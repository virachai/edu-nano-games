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

## 3. Loop Controls

`scripts/agent-loop.sh` supports three important controls:

| Control           | Meaning                                        |
| ----------------- | ---------------------------------------------- |
| `--interval N`    | Minutes to wait between completed agent cycles |
| `--duration N`    | Maximum wall-clock window for the loop         |
| `--start-delay N` | Minutes to wait before the first cycle         |

The loop is **bounded**. It exits when the duration window expires.

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

## 4. One Cycle Contract

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

## 5. Failure and Blockers

If an agent cycle fails:

- the loop records the exit code;
- the loop does not start another invocation until the interval has elapsed;
- the next agent invocation must re-read repository state;
- an agent must not hide or overwrite the previous evidence/error;
- environment failures should be reported as `BLOCKED` when they cannot be fixed in task scope.

A non-zero agent exit code does **not** automatically mean the task is failed. Review the task evidence and repository state.

## 6. Safety / Concurrency

The loop creates a repository-local lock under `.agent-runs/.lock`.

This prevents accidentally starting two loop processes against the same workspace.

The loop also invokes the agent synchronously. It does **not** background an agent and then launch another one.

Do not run multiple independent agent loops against the same workspace unless a future concurrency protocol explicitly supports task claiming/locking.

## 7. Logs

Each loop creates:

```text
.agent-runs/loop-YYYYMMDD-HHMMSS.log
```

Logs are operational diagnostics. They are not task evidence and do not replace `docs/12-evidence/<TASK-ID>.md`.

## 8. Reviewer Boundary

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

## 9. Stop Conditions

Stop the loop when:

- the configured duration expires;
- the operator interrupts it;
- the workspace should no longer be modified;
- a higher-level project decision is needed.

If the repository contains no READY work, the loop can safely remain idle between bounded cycles. It should not manufacture work to keep itself busy.

## 10. Definition of Safe Automation

The loop is considered safe when all of the following remain true:

- Human controls the project goal.
- DWB105 controls task readiness and review.
- Agents execute repository-defined tasks.
- Each cycle is bounded to one task.
- Verification and evidence are mandatory.
- Dependencies and status transitions are respected.
- The loop has a finite time window.
- No concurrent agent writes occur in the same workspace.
