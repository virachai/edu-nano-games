# Evidence — <TASK-ID>

**Task:** `<TASK-ID>`  
**Status:** <VERIFIED | EVIDENCE_COMPLETE | DONE | BLOCKED>  
**Date:** YYYY-MM-DD  
**Agent:** <agent identifier>  
**Reviewer:** DWB105 / pending

## Result

State only the observed, verifiable outcome. Do not claim reviewer approval here.

## Changed Files

List files actually changed by the task.

- `<path>` — <what changed>

## Commands Executed

Record the exact commands actually executed.

```bash
<command>
```

## Verification Results

| Check           | Expected   | Actual     | Result      |
| --------------- | ---------- | ---------- | ----------- |
| <command/check> | <expected> | <observed> | PASS / FAIL |

## Acceptance Criteria Evidence

Map every criterion from the task specification to concrete evidence.

- [ ] Criterion 1 — <path/output/result>
- [ ] Criterion 2 — <path/output/result>

If any required criterion is not satisfied, the task must not be represented as `DONE`.

## Artifacts

List generated or runtime artifacts and repository paths.

- `<path>` — <artifact description>

## Runtime / Render Evidence

Use when the task produces an observable runtime, media, or rendered result.

- Artifact: `<path>`
- Runtime/check: `<command or procedure>`
- Observed result: ...

## Known Limitations / Risks

- None / ...

## Reproduction

Minimum steps another agent or reviewer can use to reproduce the verification.

1. ...
2. ...

## Blocker Record

If blocked, record:

- Blocking command/step: ...
- Exact error or observed condition: ...
- Cause classification: task / existing issue / environment / dependency / external service
- Why it cannot be resolved within this task: ...

## Reviewer Notes

Reserved for DWB105. The execution agent must not fabricate this section.

## Final Assessment

This section is completed by the reviewer/gatekeeper.

- `VERIFIED` — acceptance checks pass.
- `EVIDENCE_COMPLETE` — required proof is complete and reviewable.
- `DONE` — reviewer accepts the implementation, verification, and evidence.
- `BLOCKED` — completion cannot proceed because of an unresolved blocker.

**Assessment:** `<VERIFIED | EVIDENCE_COMPLETE | DONE | BLOCKED>`
