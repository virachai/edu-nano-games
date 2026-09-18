#!/usr/bin/env bash
set -uo pipefail

# Run exactly one repository-driven local-agent invocation.
# The agent discovers the READY task from repository state; this runner does
# not choose, create, or approve tasks.

DEFAULT_MODEL="gemini-3.5-flash-lite"
DEFAULT_PROMPT='อ่าน docs/AGENT_LOOP_RUNBOOK.md และ docs/AGENT_RUNBOOK.md จากนั้นทำ READY task ตาม protocol โดยทำทีละ 1 task เท่านั้น ตรวจสอบ บันทึก evidence และ handoff แล้วหยุด'
DEFAULT_TIMEOUT_MINUTES=30
LOG_DIR=".agent-runs"
LOCK_FILE="${LOG_DIR}/.runner.lock"
TIMEOUT_MINUTES="$DEFAULT_TIMEOUT_MINUTES"

usage() {
  cat <<'USAGE'
Usage:
  agent-runner.sh [options] [-- <agent-command> [args...]]

Runs exactly one local-agent invocation. With no command, runs:
  gemini -m gemini-3.5-flash-lite -p '<repository protocol prompt>'

Options:
  --model MODEL          Model used by the default Gemini command
  --prompt TEXT          Prompt used by the default Gemini command
  --timeout MINUTES      Hard execution timeout (default: 30)
  --log-dir PATH         Runtime log directory (default: .agent-runs)
  -h, --help             Show this help
USAGE
}

fail() {
  echo "agent-runner: $*" >&2
  exit 2
}

is_positive_integer() {
  [[ "$1" =~ ^[1-9][0-9]*$ ]]
}

MODEL="$DEFAULT_MODEL"
PROMPT="$DEFAULT_PROMPT"
USE_CUSTOM_COMMAND=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --model)
      [[ $# -ge 2 ]] || fail "--model requires a value"
      MODEL="$2"
      shift 2
      ;;
    --prompt)
      [[ $# -ge 2 ]] || fail "--prompt requires a value"
      PROMPT="$2"
      shift 2
      ;;
    --timeout)
      [[ $# -ge 2 ]] || fail "--timeout requires a value"
      TIMEOUT_MINUTES="$2"
      shift 2
      ;;
    --log-dir)
      [[ $# -ge 2 ]] || fail "--log-dir requires a value"
      LOG_DIR="$2"
      LOCK_FILE="${LOG_DIR}/.runner.lock"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      USE_CUSTOM_COMMAND=1
      shift
      break
      ;;
    *)
      fail "unexpected argument '$1'; use -- before a custom agent command"
      ;;
  esac
done

is_positive_integer "$TIMEOUT_MINUTES" || fail "timeout must be a positive integer"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR" || exit 1

mkdir -p "$LOG_DIR" || fail "cannot create log directory: $LOG_DIR"
command -v flock >/dev/null 2>&1 || fail "flock is required for runner concurrency control"
command -v timeout >/dev/null 2>&1 || fail "timeout is required for the hard execution timeout"

# flock is released by the kernel when this process exits, including SIGKILL.
# This avoids stale lock directories after interrupted runs.
exec 9>"$LOCK_FILE" || fail "cannot open lock: $LOCK_FILE"
if ! flock -n 9; then
  fail "another agent runner is already active (lock: $LOCK_FILE)"
fi

RUN_ID="$(date '+%Y%m%d-%H%M%S')"
LOG_FILE="${LOG_DIR}/run-${RUN_ID}.log"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S %z')" "$*" | tee -a "$LOG_FILE"
}

if (( USE_CUSTOM_COMMAND == 0 )); then
  command -v gemini >/dev/null 2>&1 || fail "gemini command not found; install it or pass a custom command after --"
  set -- gemini -m "$MODEL" -p "$PROMPT"
fi

(( $# > 0 )) || fail "missing agent command"

log "START run_id=${RUN_ID} timeout=${TIMEOUT_MINUTES}m"
log "WORKSPACE=${ROOT_DIR}"
log "AGENT=$*"

set +e
timeout --signal=TERM --kill-after=30s "${TIMEOUT_MINUTES}m" "$@" 2>&1 | tee -a "$LOG_FILE"
AGENT_STATUS=${PIPESTATUS[0]}
set -e

case "$AGENT_STATUS" in
  0) log "END exit_code=0 status=PASS" ;;
  124|137) log "END exit_code=${AGENT_STATUS} status=TIMEOUT" ;;
  *) log "END exit_code=${AGENT_STATUS} status=FAIL" ;;
esac

exit "$AGENT_STATUS"
