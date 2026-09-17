#!/usr/bin/env bash
set -u

# Document-driven local-agent loop.
# Usage:
#   ./scripts/agent-loop.sh --interval 10 --duration 120 -- gemini -m gemini-3.5-flash-lite -p '...'
#
# The script runs one synchronous agent invocation per cycle. The agent itself
# discovers a READY task and follows docs/AGENT_RUNBOOK.md. The loop never
# launches a second invocation while the previous one is still running.

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
  --interval MINUTES   Wait this many minutes between cycle starts (default: 10)
  --duration MINUTES   Stop after this total wall-clock window (default: 120)
  --start-delay MINUTES
                       Wait before the first cycle (default: 0)
  --log-dir PATH       Directory for loop logs (default: .agent-runs)
  -h, --help           Show this help

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
cd "$ROOT_DIR" || exit 1

mkdir -p "$LOG_DIR"

# Simple repository-local lock. It prevents accidentally running two loops
# against the same workspace at the same time.
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  fail "another agent loop appears to be running (lock: $LOCK_DIR)"
fi
cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

RUN_ID="$(date '+%Y%m%d-%H%M%S')"
LOG_FILE="${LOG_DIR}/loop-${RUN_ID}.log"
START_EPOCH="$(date +%s)"
END_EPOCH=$((START_EPOCH + DURATION_MINUTES * 60))
CYCLE=0

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S %z')" "$*" | tee -a "$LOG_FILE"
}

log "START run_id=${RUN_ID} interval=${INTERVAL_MINUTES}m duration=${DURATION_MINUTES}m start_delay=${START_DELAY_MINUTES}m"
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

  # Keep the agent invocation synchronous. This is intentional: no overlap,
  # no uncontrolled concurrency, and each cycle starts only after the prior
  # agent has returned.
  set +e
  "$@" 2>&1 | tee -a "$LOG_FILE"
  AGENT_STATUS=${PIPESTATUS[0]}
  set -e

  log "CYCLE ${CYCLE} END exit_code=${AGENT_STATUS}"

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

log "STOP run_id=${RUN_ID} cycles=${CYCLE} reason=window_expired"
