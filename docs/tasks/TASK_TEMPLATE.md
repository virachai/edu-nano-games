# <TASK-ID> — <Task Title>

**Status:** PLANNED  
**Priority:** P1  
**Depends On:** —  
**Owner:** Local Agent  
**Created:** YYYY-MM-DD  
**Updated:** YYYY-MM-DD  
**Context:** `docs/context/<TASK-ID>-CONTEXT.md`  
**Evidence:** `docs/12-evidence/<TASK-ID>.md`

## Objective

State the single concrete outcome this task must produce.

## Scope

### In Scope

- ...

### Out of Scope

- ...

## Preconditions

The agent must confirm these before editing.

- [ ] Required dependency/task is complete.
- [ ] Required files/tools are available.
- [ ] Required environment capability is available.
- [ ] No unresolved blocker prevents execution.

If a precondition fails, stop and report the exact blocker unless the task explicitly defines a recovery step.

## Inputs / Read First

**Required:**

- `docs/AGENT_RULES.md`
- `docs/AGENT_RUNBOOK.md`
- `docs/BACKLOG.md`
- `docs/tasks/<TASK-ID>.md`
- `docs/context/<TASK-ID>-CONTEXT.md` (if present)

**Task-specific:**

- ...

## Procedure

Execute in order. Do not skip a step without recording why.

1. Inspect ...
2. Implement ...
3. Run ...
4. Record evidence ...

## Constraints

- Preserve existing contracts unless explicitly changed here.
- Do not perform unrelated refactors.
- Do not silently expand scope.
- Do not invent requirements when documentation is incomplete; stop and report.

## Acceptance Criteria

Every required criterion must pass.

- [ ] Criterion 1 — observable result: ...
- [ ] Criterion 2 — observable result: ...
- [ ] Criterion 3 — observable result: ...

## Verification

Run the exact checks below and record actual output/results in the evidence file.

```bash
<command>
```

Expected result:

- ...

Additional inspection, if required:

- ...

## Failure / Blocker Protocol

If any required step or check fails:

1. Capture the exact command and relevant error/output.
2. Determine whether the cause is task code, an existing issue, or environment/dependency.
3. Fix only if the fix remains inside this task's scope.
4. Otherwise stop and report `BLOCKED` or `IMPLEMENTED`; do not claim `DONE`.

## Evidence Required

Update `docs/12-evidence/<TASK-ID>.md` with:

- changed files
- exact commands executed
- actual verification results
- acceptance-criteria mapping
- generated/runtime artifacts
- known limitations/risks
- reproduction steps

## Definition of Done

The agent may report completion only when:

- [ ] implementation is complete
- [ ] every acceptance criterion passes
- [ ] required verification passes
- [ ] evidence is complete and truthful
- [ ] no unresolved in-scope blocker remains

**Important:** Local-agent completion is not reviewer approval. DWB105 reviews the evidence before the task is accepted as `DONE`.

## Final Handoff

```text
TASK: <TASK-ID>
STATUS: <IMPLEMENTED|VERIFIED|EVIDENCE_COMPLETE|DONE|BLOCKED>
SUMMARY: <short factual summary>
CHANGED:
- <file>
VERIFICATION:
- <command> — PASS/FAIL
EVIDENCE:
- docs/12-evidence/<TASK-ID>.md
BLOCKERS:
- <none or exact blocker>
FOLLOW-UP:
- <none or task-id/recommended action>
```
