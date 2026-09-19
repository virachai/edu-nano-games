#!/usr/bin/env bash
set -u

# Document-driven local-agent loop (scheduler layer).
# Usage:
#   ./scripts/agent-loop.sh --interval 10 --duration 120 -- gemini -m gemini-3.5-flash-lite -p '...'
#
# The loop decides *when* a cycle starts. Each cycle delegates the actual agent
# invocation to scripts/agent-runner.sh, which is the canonical single-cycle
# execution primitive and owns per-run locking, the hard per-cycle timeout, and
# the agent output log. The loop itself only schedules cycles, records cycle
# boundaries plus the observed runner exit code, and keeps the invocations
# strictly synchronous: a new cycle never starts before the previous runner has
# returned.

INTERVAL_MINUTES=10
DURATION_MINUTES=120
START_DELAY_MINUTES=0
LOG_DIR=".agent-runs"
LOCK_DIR="${LOG_DIR}/.lock"

usage() {
  cat <<'EOF'
Usage:
  agent-loop.sh [options] -- <agent-command> [args...]

Options:
  --interval MINUTES   Wait this many minutes between completed cycles (default: 10)
  --duration MINUTES   Stop after this total wall-clock window (default: 120)
  --start-delay MINUTES
                       Wait before the first cycle (default: 0)
  --log-dir PATH       Directory for loop logs and runner run logs (default: .agent-runs)
  -h, --help           Show this help

Each cycle runs:
  bash scripts/agent-runner.sh --log-dir <log-dir> -- <agent-command> [args...]

The runner owns the per-cycle lock, the hard per-cycle timeout (its own
--timeout, default 30 minutes), and the agent output log (run-*.log). The loop
log (loop-*.log) records cycle begin/end, sleep decisions, and the observed
runner exit code.

Examples:
  ./scripts/agent-loop.sh --interval 10 --duration 120 -- \
    gemini -m gemini-3.5-flash-lite -p \
    'อ่าน docs/AGENT_LOOP_RUNBOOK.md แล้วทำตาม protocol โดยทำ READY task ได้ครั้งละ 1 งาน'

  ./scripts/agent-loop.sh --interval 30 --duration 480 -- \
    gemini -m gemini-3.5-flash-lite -p \
    'อ่าน docs/AGENT_LOOP_RUNBOOK.md แล้ว execute READY task ตาม protocol'
EOF
}

fail() {
  echo "agent-loop: $*" >&2
  exit 2
}

is_non_negative_integer() {
  [[ "$1" =~ ^[0-9]+$ ]]
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval)
      [[ $# -ge 2 ]] || fail "--interval requires a value"
      INTERVAL_MINUTES="$2"
      shift 2
      ;;
    --duration)
      [[ $# -ge 2 ]] || fail "--duration requires a value"
      DURATION_MINUTES="$2"
      shift 2
      ;;
    --start-delay)
      [[ $# -ge 2 ]] || fail "--start-delay requires a value"
      START_DELAY_MINUTES="$2"
      shift 2
      ;;
    --log-dir)
      [[ $# -ge 2 ]] || fail "--log-dir requires a value"
      LOG_DIR="$2"
      LOCK_DIR="${LOG_DIR}/.lock"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      fail "unexpected argument '$1'; use -- before the agent command"
      ;;
  esac
done

is_non_negative_integer "$INTERVAL_MINUTES" || fail "interval must be a non-negative integer"
is_non_negative_integer "$DURATION_MINUTES" || fail "duration must be a non-negative integer"
is_non_negative_integer "$START_DELAY_MINUTES" || fail "start-delay must be a non-negative integer"
(( DURATION_MINUTES > 0 )) || fail "duration must be greater than 0"
(( $# > 0 )) || fail "missing agent command"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNNER_SCRIPT="${ROOT_DIR}/scripts/agent-runner.sh"
cd "$ROOT_DIR" || exit 1

# The loop must not reimplement runner duties, so a missing runner is a hard
# failure rather than a silent fallback to a direct agent invocation.
[[ -f "$RUNNER_SCRIPT" ]] || fail "runner script not found: $RUNNER_SCRIPT"

mkdir -p "$LOG_DIR"

# Loop-level lock (loop vs loop). It is deliberately separate from the runner's
# own lock: this one keeps two loops from interleaving cycles in one workspace,
# while the runner's lock keeps two agent invocations from overlapping.
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  fail "another agent loop appears to be running (lock: $LOCK_DIR)"
fi

RUN_ID="$(date '+%Y%m%d-%H%M%S')"
LOG_FILE="${LOG_DIR}/loop-${RUN_ID}.log"
START_EPOCH="$(date +%s)"
END_EPOCH=$((START_EPOCH + DURATION_MINUTES * 60))
CYCLE=0
FAILED_CYCLES=0
LAST_RUNNER_EXIT_CODE=0
STOP_REASON="window_expired"
STOPPED=0

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S %z')" "$*" | tee -a "$LOG_FILE"
}

finish() {
  (( STOPPED == 1 )) && return 0
  STOPPED=1
  log "STOP run_id=${RUN_ID} cycles=${CYCLE} failed_cycles=${FAILED_CYCLES} last_runner_exit_code=${LAST_RUNNER_EXIT_CODE} reason=${STOP_REASON} log=${LOG_FILE}"
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

on_signal() {
  STOP_REASON="signal"
  exit 143
}

trap finish EXIT
trap on_signal INT TERM

log "START run_id=${RUN_ID} interval=${INTERVAL_MINUTES}m duration=${DURATION_MINUTES}m start_delay=${START_DELAY_MINUTES}m"
log "RUNNER=${RUNNER_SCRIPT} log_dir=${LOG_DIR}"
log "AGENT: $*"

if (( START_DELAY_MINUTES > 0 )); then
  log "waiting ${START_DELAY_MINUTES}m before first cycle"
  sleep $((START_DELAY_MINUTES * 60))
fi

while (( $(date +%s) < END_EPOCH )); do
  CYCLE=$((CYCLE + 1))
  NOW="$(date +%s)"
  REMAINING=$((END_EPOCH - NOW))

  if (( REMAINING <= 0 )); then
    break
  fi

  log "CYCLE ${CYCLE} BEGIN (remaining=${REMAINING}s)"

  # One synchronous runner invocation per cycle. The loop waits for the runner
  # to return, so cycles cannot overlap. The runner's stdout/stderr stay
  # attached to this process: the agent output is recorded in the runner's own
  # run log, not duplicated into the loop log.
  bash "$RUNNER_SCRIPT" --log-dir "$LOG_DIR" -- "$@"
  LAST_RUNNER_EXIT_CODE=$?
  if (( LAST_RUNNER_EXIT_CODE != 0 )); then
    FAILED_CYCLES=$((FAILED_CYCLES + 1))
  fi

  log "CYCLE ${CYCLE} END runner_exit_code=${LAST_RUNNER_EXIT_CODE}"

  NOW="$(date +%s)"
  REMAINING=$((END_EPOCH - NOW))
  (( REMAINING > 0 )) || break

  # Interval is measured from the end of the previous invocation. This avoids
  # piling up invocations when an agent takes a long time.
  SLEEP_SECONDS=$((INTERVAL_MINUTES * 60))
  (( SLEEP_SECONDS < REMAINING )) || SLEEP_SECONDS=$REMAINING

  if (( SLEEP_SECONDS > 0 )); then
    log "sleeping ${SLEEP_SECONDS}s before next cycle"
    sleep "$SLEEP_SECONDS"
  fi
done

finish
