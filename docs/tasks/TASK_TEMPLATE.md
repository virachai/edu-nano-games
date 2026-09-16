# <TASK-ID> — <Task Title>

**Status:** PLANNED  
**Priority:** P1  
**Depends On:** —  
**Owner:** —  
**Created:** YYYY-MM-DD  
**Updated:** YYYY-MM-DD  

## Objective

Describe the concrete outcome this task must produce.

## Scope

### In Scope

- ...

### Out of Scope

- ...

## Dependencies

List required completed tasks, files, services, decisions, or environment prerequisites.

## Inputs / Files to Read

- `docs/AGENT_RULES.md`
- `docs/BACKLOG.md`
- ...

## Agent Instructions

Give the execution agent precise, ordered instructions.

1. ...
2. ...
3. ...

## Constraints

- Preserve existing contracts unless explicitly changed here.
- Do not perform unrelated refactors.
- Do not silently expand scope.
- ...

## Acceptance Criteria

The task is acceptable only when every required criterion is satisfied.

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Verification

Specify the exact commands/checks that must be run.

```bash
# example
<command>
```

Expected result:

- ...

## Evidence Required

The completion evidence must include:

- changed files
- commands executed
- verification results
- generated artifacts, if applicable
- known limitations or risks

Expected evidence file:

`docs/evidence/<TASK-ID>.md`

## Completion

The agent must not mark this task `DONE` until:

- [ ] implementation is complete
- [ ] acceptance criteria pass
- [ ] verification passes
- [ ] evidence is recorded
- [ ] no unresolved in-scope blocker remains

### Final Handoff

```text
TASK: <TASK-ID>
STATUS: <FINAL STATUS>
SUMMARY: <short summary>
CHANGED:
- <file>
VERIFICATION:
- <command> — PASS/FAIL
EVIDENCE:
- <path>
BLOCKERS:
- <none or blocker>
FOLLOW-UP:
- <none or task-id>
```
