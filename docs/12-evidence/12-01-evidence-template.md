# Evidence — <TASK-ID>

**Task:** `<TASK-ID>`  
**Status:** <VERIFIED | EVIDENCE_COMPLETE | DONE>  
**Date:** YYYY-MM-DD  
**Agent:** <agent identifier>

## Result

State the verified outcome in a few concise sentences.

## Changed Files

List files actually changed by the task.

- `<path>` — <what changed>
- `<path>` — <what changed>

## Commands Executed

Record the actual commands used for verification. Do not replace them with paraphrases.

```bash
<command>
```

## Verification

| Check           | Result      | Notes             |
| --------------- | ----------- | ----------------- |
| <check/command> | PASS / FAIL | <relevant result> |
| <check/command> | PASS / FAIL | <relevant result> |

## Acceptance Criteria

Map each acceptance criterion from the task specification to concrete evidence.

- [x] Criterion 1 — <evidence/reference>
- [x] Criterion 2 — <evidence/reference>
- [ ] Criterion 3 — <not satisfied / explanation>

If any required criterion is not satisfied, the task must not be represented as `DONE`.

## Artifacts

List generated or relevant artifacts and their repository paths.

- `<path>` — <artifact description>

## Render / Runtime Evidence

Use this section when the task produces a runtime result, render, media artifact, or other observable output.

- Artifact: `<path>`
- Runtime/check: `<command or procedure>`
- Result: <observed result>

## Known Limitations / Risks

Record known issues that remain after verification.

- None / ...

## Reproduction

Provide the minimum steps another agent or reviewer can use to reproduce the verification.

1. ...
2. ...
3. ...

## Reviewer Notes

Optional reviewer observations. Keep this separate from agent-generated evidence.

## Final Assessment

Choose exactly one:

- `VERIFIED` — acceptance checks pass, but evidence may still need final assembly.
- `EVIDENCE_COMPLETE` — required evidence is complete and reviewable.
- `DONE` — implementation, verification, and evidence requirements are all satisfied.

**Assessment:** `<VERIFIED | EVIDENCE_COMPLETE | DONE>`
