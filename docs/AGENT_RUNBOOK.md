# Local Agent Runbook

**Status:** Active protocol  
**Audience:** Local execution agents (Gemini, Codex, Claude, and similar)

This runbook is the short operational entry point. Detailed requirements live in the task specification.

## Execution Loop

```text
READ → CHECK STATUS → EXECUTE → VERIFY → RECORD EVIDENCE → HANDOFF
                                      ↓
                                  BLOCKED/FAIL
                                      ↓
                                   REPORT
```

## 1. Read Before Acting

1. Read `docs/AGENT_RULES.md`.
2. Read `docs/BACKLOG.md` and identify a `READY` task.
3. Read `docs/tasks/<TASK-ID>.md`.
4. If present, read `docs/context/<TASK-ID>-CONTEXT.md`.
5. Inspect the files named by the task before editing.

Do not treat the chat prompt as the task specification.

## 2. Check Preconditions

Confirm:

- task status is `READY` unless the user explicitly authorized another state;
- dependencies are satisfied;
- required tools/dependencies are available;
- acceptance criteria are understandable;
- required output/artifact paths are writable.

If a precondition fails, stop and report the exact blocker.

## 3. Execute Exactly the Task

Follow the task's ordered procedure.

- Stay inside `In Scope`.
- Do not perform unrelated cleanup.
- Do not invent missing requirements.
- If a better idea changes scope, record it as a follow-up instead.

## 4. Verify

Run the exact verification commands in the task.

A successful implementation without required verification is not `DONE`.

## 5. Record Evidence

Create/update `docs/12-evidence/<TASK-ID>.md` using the evidence template.

Evidence must contain actual commands and observed results, not statements such as "works" without proof.

## 6. Handoff

Return the task handoff required by `docs/AGENT_RULES.md`.

The local agent reports facts and evidence. **DWB105 is the reviewer/gatekeeper.** Do not fabricate a reviewer approval or mark a task `DONE` merely because the implementation appears complete.

## Failure Rule

If a required check fails:

1. capture the command and error;
2. determine whether it is caused by the change or environment;
3. fix only if the fix remains in scope;
4. otherwise report `BLOCKED` or `IMPLEMENTED`, with evidence.
