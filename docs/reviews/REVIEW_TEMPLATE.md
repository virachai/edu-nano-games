# Review — <TASK-ID>

**Task:** `<TASK-ID>`  
**Review Date:** YYYY-MM-DD  
**Reviewer:** DWB105  
**Agent:** <agent identifier>  
**Decision:** `<PASS | FAIL | BLOCKED>`

## Review Scope

- Task specification: `docs/tasks/<TASK-ID>.md`
- Evidence: `docs/12-evidence/<TASK-ID>.md`
- Changed files: <paths>

## Acceptance Review

| Criterion | Evidence | Result |
| --- | --- | --- |
| <criterion> | <path/command/output> | PASS / FAIL |

## Verification Review

| Check | Claimed Result | Reviewer Result | Notes |
| --- | --- | --- | --- |
| <command/check> | PASS / FAIL | PASS / FAIL | ... |

## Scope Review

- [ ] Changes stay within task scope.
- [ ] No unrelated refactor is required for acceptance.
- [ ] Public contracts are preserved unless explicitly changed.
- [ ] Generated/runtime artifacts follow the canonical path.

## Evidence Review

- [ ] Changed files are listed accurately.
- [ ] Actual commands are recorded.
- [ ] Results are reproducible or otherwise inspectable.
- [ ] Artifacts are present at the claimed paths.
- [ ] Limitations/blockers are disclosed.

## Blocking Issues

- None / ...

## Required Fixes

1. ...

## Reviewer Conclusion

`PASS` means the evidence supports completion and the task may proceed to `DONE` under the project protocol.

`FAIL` means required work or evidence is missing; the task must not be marked `DONE`.

`BLOCKED` means completion cannot proceed because of a dependency/environment/external constraint that is not resolved within task scope.

**Decision:** `<PASS | FAIL | BLOCKED>`
