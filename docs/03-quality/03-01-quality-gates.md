# Quality Gates

## Purpose

Define objective gates for changes entering the repository and for production-oriented releases.

## Gate 1 — Repository Hygiene

- formatting passes
- lint passes
- no accidental generated artifacts or secrets
- changed files are within intended scope

## Gate 2 — Build Integrity

- TypeScript build/typecheck passes for affected projects
- package boundaries resolve correctly
- ESM/module contracts remain valid

## Gate 3 — Unit and Contract Integrity

- affected tests pass
- schema/contract validators pass
- invalid inputs are tested where boundary code changed

## Gate 4 — Mathematical Integrity

For mathematical content:

- invariants are explicit
- expected terminal state is asserted
- deterministic replay passes
- golden fixtures remain consistent or are intentionally versioned

## Gate 5 — Compiler Integrity

For semantic-to-renderer changes:

- compiler output validates
- compilation is deterministic
- scene timing/duration is consistent
- renderer-specific logic does not become the source of mathematical truth

## Gate 6 — Render Integrity

When rendering is part of acceptance:

- real render smoke test passes
- output artifact is structurally valid
- failures are reproducible

## Gate 7 — Release Integrity

Before release:

- Definition of Done is satisfied
- release checklist is complete
- known limitations are documented
- rollback/recovery path is known for the affected artifact

## Change Classification

| Change                   | Required gates                           |
| ------------------------ | ---------------------------------------- |
| Documentation only       | 1, scope review                          |
| Game logic               | 1–3, plus relevant game acceptance tests |
| Mathematical engine      | 1–4                                      |
| Compiler/recipe          | 1–5                                      |
| Renderer/render pipeline | 1–6                                      |
| Production release       | 1–7                                      |

## Principle

A quality gate is evidence, not ceremony. If a gate cannot be automated yet, document the manual verification method and create a follow-up task to automate it.
