# Agent Loop Runbook

**Status:** Active protocol
**Audience:** Project owner, local execution agents, and operators running the scheduled agent loop.

This runbook defines how to run a bounded, document-driven execution loop. The loop repeatedly invokes a local agent; the agent discovers work from the repository protocol rather than receiving a newly written task prompt each cycle.

## 1. Operating Model

```text
HUMAN GOAL
   ↓
DWB105 prepares/reviews TASKS
   ↓
BACKLOG
   ↓
READY TASK
   ↓
LOCAL AGENT
   ↓
IMPLEMENT → VERIFY → EVIDENCE → HANDOFF
   ↓
DWB105 REVIEW
   ↓
DONE / BLOCKED / FOLLOW-UP
   ↓
NEXT READY TASK
```

The shell loop automates **execution attempts**, not product decisions.

It must never:

- invent requirements;
- promote PLANNED/BLOCKED work to READY;
- skip dependencies;
- declare reviewer approval;
- replace DWB105 review;
- run overlapping agent invocations in the same workspace.

## 2. Recommended Agent Prompt

Use a small, stable prompt. Repository documents are the source of task detail.

```text
อ่าน docs/AGENT_LOOP_RUNBOOK.md และ docs/AGENT_RUNBOOK.md จากนั้นทำ READY task ตาม protocol โดยทำทีละ 1 task เท่านั้น ตรวจสอบ บันทึก evidence และ handoff แล้วหยุด
```

The agent should independently read:

1. `docs/AGENT_RULES.md`
2. `docs/BACKLOG.md`
3. `docs/tasks/<TASK-ID>.md`
4. `docs/context/<TASK-ID>-CONTEXT.md` when present
5. required source/tests/artifacts

## 3. Single-Cycle Runner

Use `scripts/agent-runner.sh` when you want one real execution attempt. It provides repository-local locking, bounded execution time, and an operational log.

```bash
./scripts/agent-runner.sh
```

The default command is `gemini -m gemini-3.5-flash-lite -p '<repository protocol prompt>'`.

Useful controls: `--timeout N`, `--model MODEL`, `--prompt TEXT`, `--log-dir PATH`, and `-- <command> [args...]` for a custom agent command.

The runner does not select tasks, change lifecycle state, or approve work. The repository protocol remains authoritative.

The runner is the **canonical single-cycle execution primitive**. It owns:

- the per-run lock;
- the hard per-cycle timeout (`--timeout`, default 30 minutes);
- the agent output log (`run-*.log`).

The bounded loop in §4 does not reimplement any of these duties. Each loop cycle
delegates the agent invocation to this runner, so both direct runs and loop runs
share one implementation of locking, timing, logging, and exit-code handling.

## 4. Loop Controls

`scripts/agent-loop.sh` supports these controls:

| Control           | Meaning                                                  |
| ----------------- | -------------------------------------------------------- |
| `--interval N`    | Minutes to wait between completed agent cycles           |
| `--duration N`    | Maximum wall-clock window for the loop                   |
| `--start-delay N` | Minutes to wait before the first cycle                   |
| `--log-dir PATH`  | Directory for loop logs, runner run logs, and both locks |

The agent command is passed after `--` and is forwarded unchanged to the runner
as a custom command.

The loop is **bounded**. It exits when the duration window expires.

`--log-dir` also configures the runner: each cycle forwards its own log
directory to the runner, so loop logs, per-cycle run logs, and the runner lock
all stay under the same directory.

### Cycle delegation

Each cycle runs exactly one runner invocation:

```bash
bash scripts/agent-runner.sh --log-dir <loop log dir> -- <agent-command> [args...]
```

Responsibilities stay split:

| Layer  | Owns                                                                       |
| ------ | -------------------------------------------------------------------------- |
| Loop   | scheduling, cycle boundaries, sleep decisions, aggregate result, loop lock |
| Runner | per-run lock, hard timeout, agent output log, agent exit code              |

Consequences worth knowing:

- the loop has no timeout flag of its own; the per-cycle bound is the runner's
  `--timeout` default (30 minutes), so a cycle can finish slightly after the
  duration window expires — the loop only stops starting **new** cycles at the
  boundary;
- the loop invokes the runner synchronously and waits for it to return, so two
  cycles can never overlap.

### Example: 2 hours, every 10 minutes

```bash
./scripts/agent-loop.sh --interval 10 --duration 120 -- \
  gemini -m gemini-3.5-flash-lite -p \
  'อ่าน docs/AGENT_LOOP_RUNBOOK.md และ docs/AGENT_RUNBOOK.md จากนั้นทำ READY task ตาม protocol โดยทำทีละ 1 task เท่านั้น ตรวจสอบ บันทึก evidence และ handoff แล้วหยุด'
```

### Example: 8 hours, every 30 minutes

```bash
./scripts/agent-loop.sh --interval 30 --duration 480 -- \
  gemini -m gemini-3.5-flash-lite -p \
  'อ่าน docs/AGENT_LOOP_RUNBOOK.md และ docs/AGENT_RUNBOOK.md จากนั้นทำ READY task ตาม protocol โดยทำทีละ 1 task เท่านั้น ตรวจสอบ บันทึก evidence และ handoff แล้วหยุด'
```

## 5. One Cycle Contract

Each cycle is intended to perform at most one task:

```text
DISCOVER READY
    ↓
READ TASK + CONTEXT
    ↓
CHECK PRECONDITIONS
    ↓
EXECUTE ONE TASK
    ↓
VERIFY
    ↓
WRITE EVIDENCE
    ↓
HANDOFF
    ↓
RETURN
```

If there is no executable `READY` task, the agent should report:

```text
NO EXECUTABLE TASK
```

and return. The loop may invoke the agent again later, because DWB105 may have prepared new READY work during the window.

## 6. Failure and Blockers

If an agent cycle fails:

- the loop records the exit code the runner reported
  (`CYCLE <n> END runner_exit_code=<code>`) in the loop log;
- the loop does not start another invocation until the interval has elapsed;
- the next agent invocation must re-read repository state;
- an agent must not hide or overwrite the previous evidence/error;
- environment failures should be reported as `BLOCKED` when they cannot be fixed in task scope.

A non-zero agent exit code does **not** automatically mean the task is failed. Review the task evidence and repository state.

When the loop stops it writes one aggregate line:

```text
STOP run_id=... cycles=N failed_cycles=M last_runner_exit_code=K reason=<window_expired|signal> log=<loop log path>
```

`failed_cycles` counts cycles whose runner exit code was non-zero. The loop's own
exit status is `0` after a completed window and `143` when it is interrupted by
`INT`/`TERM`; individual cycle outcomes are reported in the log and the run logs,
not in the loop's exit status.

## 7. Safety / Concurrency

Two separate locks protect the workspace:

| Lock                            | Owner  | Prevents                                                |
| ------------------------------- | ------ | ------------------------------------------------------- |
| `<log dir>/.lock` (directory)   | loop   | two loops running against the same workspace            |
| `<log dir>/.runner.lock` (file) | runner | two agent invocations overlapping in the same workspace |

The loop creates the loop lock under `.agent-runs/.lock`, and the runner takes
its own `.agent-runs/.runner.lock` (directory fallback `.runner.lock.d` where
`flock` is unavailable). Because the loop forwards its `--log-dir` to the
runner, both locks live in the same directory and cannot collide, and a runner
started by hand with the default log directory contends on the same runner lock
as a loop-driven cycle.

The loop invokes the agent synchronously through the runner. It does **not**
background an agent and then launch another one.

Do not run multiple independent agent loops against the same workspace unless a future concurrency protocol explicitly supports task claiming/locking.

## 8. Logs

Each layer writes to its own file prefix under the configured log directory:

```text
.agent-runs/loop-YYYYMMDD-HHMMSS.log   # loop: cycle begin/end, sleep decisions, aggregate STOP
.agent-runs/run-YYYYMMDD-HHMMSS.log    # runner: one file per cycle, full agent invocation output
```

The loop log records only scheduler-level facts — cycle boundaries, sleep
decisions, the observed runner exit code, and the final aggregate line. Agent
output and the runner's own `START`/`END exit_code=... status=...` lines are
recorded once, by the runner, in its run log; the loop does not duplicate them.

Logs are operational diagnostics. They are not task evidence and do not replace `docs/12-evidence/<TASK-ID>.md`.

## 9. Reviewer Boundary

The loop can continue executing available work, but it cannot replace the review gate.

The authoritative lifecycle remains:

```text
PLANNED
  ↓
READY
  ↓
IN_PROGRESS
  ↓
IMPLEMENTED
  ↓
VERIFIED
  ↓
EVIDENCE_COMPLETE
  ↓
DWB105 REVIEW
  ↓
DONE
```

DWB105 may create and prepare future tasks independently of whether the loop is currently running.

## 10. Stop Conditions

Stop the loop when:

- the configured duration expires;
- the operator interrupts it;
- the workspace should no longer be modified;
- a higher-level project decision is needed.

If the repository contains no READY work, the loop can safely remain idle between bounded cycles. It should not manufacture work to keep itself busy.

## 11. Definition of Safe Automation

The loop is considered safe when all of the following remain true:

- Human controls the project goal.
- DWB105 controls task readiness and review.
- Agents execute repository-defined tasks.
- Each cycle is bounded to one task.
- Each cycle runs through the single-cycle runner, so locking, timeout, and
  logging have exactly one implementation.
- Verification and evidence are mandatory.
- Dependencies and status transitions are respected.
- The loop has a finite time window.
- No concurrent agent writes occur in the same workspace.
