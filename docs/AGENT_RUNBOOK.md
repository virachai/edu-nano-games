# Local Agent Runbook

**Status:** Active protocol  
**Version:** 1.1  
**Audience:** Local execution agents (Gemini, Codex, Claude, and similar)

This is the operational entry point for an agent executing repository-defined work. The repository documents are the specification; the chat prompt is only a trigger.

## Operating Contract

```text
DWB105 / HUMAN
      ↓
BACKLOG
      ↓
READY TASK
      ↓
LOCAL AGENT
      ↓
READ → CHECK → EXECUTE → VERIFY → SELF-CHECK → EVIDENCE → HANDOFF
                                      ↓
                               IMPLEMENTED / BLOCKED
                                      ↓
                                  DWB105 REVIEW
                                      ↓
                                DONE / FOLLOW-UP
```

The local agent executes. It does not invent requirements, bypass dependencies, or replace the reviewer.

---

## 1. Start Here

Before touching source code:

1. Read `docs/AGENT_RULES.md`.
2. Read `docs/BACKLOG.md`.
3. Find a task with `Status = READY`.
4. Read `docs/tasks/<TASK-ID>.md`.
5. Read `docs/context/<TASK-ID>-CONTEXT.md` when present.
6. Inspect the source, tests, and artifacts named by the task.
7. Confirm the task dependencies and preconditions.

**Do not treat an ad-hoc chat prompt as the task specification.**

If there is no executable READY task, report:

```text
NO EXECUTABLE TASK
```

and stop.

---

## 2. Select Exactly One Task

When multiple READY tasks exist:

1. respect dependency order;
2. respect the priority defined by `docs/BACKLOG.md`;
3. use the backlog's existing order when otherwise equivalent;
4. execute **one task per agent invocation**.

Do not start `PLANNED`, `BLOCKED`, or dependency-incomplete work unless the current user explicitly authorizes it.

Do not manufacture a task to keep the agent busy.

---

## 3. Preconditions

Before editing, verify:

- [ ] task status is `READY`;
- [ ] all required dependencies are complete;
- [ ] task objective and scope are understandable;
- [ ] acceptance criteria are observable;
- [ ] required verification commands are available;
- [ ] required tools/dependencies are available;
- [ ] required output paths are writable;
- [ ] no unresolved blocker prevents execution.

If a precondition fails, stop and report the exact blocker.

---

## 4. Execute Exactly the Scope

Follow the ordered procedure in the task specification.

### In scope

- changes explicitly required by the task;
- verification required by the task;
- evidence required by the task;
- narrowly necessary fixes that remain inside task scope.

### Out of scope

- unrelated cleanup;
- speculative refactors;
- architecture changes not requested by the task;
- silently changing public contracts;
- fixing unrelated pre-existing failures;
- inventing requirements.

If a useful idea would expand scope, record it as **FOLLOW-UP** instead of implementing it.

---

## 5. Workspace Safety

Before editing:

- inspect relevant existing code;
- preserve unrelated user/agent work;
- prefer small targeted changes;
- follow existing project conventions;
- use the canonical generation path for generated artifacts.

Never:

- reset or discard unrelated changes;
- force-rewrite repository history;
- delete valuable artifacts just to make a check pass;
- commit unless the task explicitly requires a commit.

If another agent appears to be modifying the same area, stop rather than overwriting its work.

---

## 6. Verification Is Mandatory

Implementation alone is not completion.

Run the exact verification defined by the task. Depending on the task, this may include:

- tests;
- typecheck;
- lint;
- build/compile;
- semantic validation;
- canonical recipe validation;
- Remotion compilation;
- real rendering;
- artifact inspection.

Record **actual commands and observed results**.

Never report a check as PASS because it was expected to pass.

### 6.1 Self-Validation Gate (SELF-CHECK)

Between `VERIFY` and `EVIDENCE`/`HANDOFF`, run the repository self-check gate:

```bash
pnpm agent:self-check -- <TASK-ID>
```

The gate is read-only. It validates that the authoritative lifecycle state (`docs/BACKLOG.md`), the task specification, and the evidence record agree:

- the task row exists and carries a valid protocol state;
- referenced task and evidence paths exist;
- the evidence record contains task ID, status, changed files, commands/verification, artifacts, and blockers/follow-up;
- the backlog state and the state recorded in the evidence record are not unreconciled;
- the task is not marked `DONE` without corroborating evidence.

Outcomes:

- `SELF-CHECK: PASS` (exit 0) — the gate passed. **This is a gate, not reviewer approval.**
- `SELF-CHECK: FAIL` (exit non-zero) — fix the reported inconsistency and rerun. The gate never repairs state silently; an unreconciled backlog row is the agent's to reconcile explicitly.

`**Status:**` headers in `docs/tasks/*.md` are planning metadata, not authoritative runtime state, so a task file still reading `READY` is reported as a non-fatal note rather than a failure.

---

## 7. Evidence

Create or update:

`docs/12-evidence/<TASK-ID>.md`

using:

`docs/12-evidence/12-01-evidence-template.md`

Evidence must be reproducible and truthful.

At minimum record:

- task ID and status;
- changed files;
- exact commands executed;
- actual verification results;
- acceptance-criteria mapping;
- generated/runtime artifacts;
- known limitations or risks;
- reproduction steps.

For render/runtime tasks, include the actual artifact path and the command/procedure used to observe it.

**Evidence is proof, not a narrative of what should have happened.**

---

## 8. Status Discipline

Use the lifecycle defined by `docs/AGENT_RULES.md` and `docs/BACKLOG.md`:

```text
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

Use `BLOCKED` when execution cannot continue.

Important:

- `IMPLEMENTED` does not mean verified.
- `VERIFIED` does not mean evidence is complete.
- `EVIDENCE_COMPLETE` does not mean reviewer approval.
- The execution agent must not fabricate `DWB105 REVIEW`.
- Do not mark `DONE` merely because the implementation compiles.

When the repository workflow permits direct backlog/task updates, keep state consistent with the evidence.

---

## 9. Failure / Blocker Protocol

If a required step fails:

1. capture the exact command;
2. capture the relevant error/output;
3. classify the cause:
   - task change;
   - existing issue;
   - environment;
   - dependency;
   - external service;
4. fix only when the fix remains inside task scope;
5. rerun the required verification;
6. otherwise report `BLOCKED` or `IMPLEMENTED`.

Never hide, downgrade, or replace a failed result with an assumption.

A non-zero command exit code is evidence of failure of that command; the overall task status still depends on the task's acceptance criteria and blocker analysis.

---

## 10. Handoff

Every execution attempt ends with this factual handoff:

```text
TASK: <task-id>
STATUS: <IMPLEMENTED|VERIFIED|EVIDENCE_COMPLETE|DONE|BLOCKED>
SUMMARY: <short factual summary>

CHANGED:
- <file>

VERIFICATION:
- <exact command> — PASS/FAIL

EVIDENCE:
- docs/12-evidence/<TASK-ID>.md

BLOCKERS:
- <none or exact blocker>

FOLLOW-UP:
- <none or task-id/recommended action>
```

The handoff must describe observed repository state. Do not claim reviewer approval.

---

## 11. Minimal Agent Prompt

The preferred invocation is intentionally short:

```bash
gemini -m gemini-3.5-flash-lite -p "อ่าน docs/AGENT_RUNBOOK.md แล้วทำ READY task ตาม protocol ทีละ 1 task ตรวจสอบ บันทึก evidence และ handoff แล้วหยุด"
```

For the bounded loop, use `docs/AGENT_LOOP_RUNBOOK.md` and its documented command.

The prompt is a trigger. The repository remains the source of truth.

---

## 12. Stop Conditions

Stop and report instead of guessing when:

- requirements conflict;
- a required file or dependency is missing;
- acceptance criteria are ambiguous in a behavior-changing way;
- a required external service or credential is unavailable;
- a destructive operation is necessary but unauthorized;
- verification cannot be completed;
- the task would require unrelated scope expansion;
- concurrent workspace modification creates a safety risk.

---

## 13. Reviewer Boundary

The local agent is responsible for:

```text
IMPLEMENT → VERIFY → EVIDENCE → HANDOFF
```

DWB105 is responsible for:

```text
REVIEW → ACCEPT / REQUEST FOLLOW-UP
```

The agent must never simulate the reviewer.

---

## 14. Quick Checklist

Before finishing an execution attempt:

- [ ] I executed exactly one task.
- [ ] The task was READY and dependencies were satisfied.
- [ ] I stayed within scope.
- [ ] I ran the required verification.
- [ ] I ran the self-check gate (`pnpm agent:self-check -- <TASK-ID>`) and it passed.
- [ ] I recorded actual results.
- [ ] I created/updated the evidence file.
- [ ] I reported blockers honestly.
- [ ] I did not fabricate reviewer approval.
- [ ] My final handoff matches repository state.

**Protocol principle:**

> Repository state + task specification + verification evidence > agent assumption.
