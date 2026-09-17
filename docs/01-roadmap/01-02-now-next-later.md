# Now / Next / Later

This document is the short-horizon execution control plane. Keep it small and update it when priorities change.

## NOW

### MM-001 — 6174 Production Vertical Slice [COMPLETED]

**Goal:** prove the complete Math Motion pipeline with one deterministic concept.

- [x] reconcile semantic-engine contract with `math-motion/concepts/6174/recipe.json`
- [x] derive the 6174 execution trace from semantic operations
- [x] make recipe state canonical and renderer-independent
- [x] compile trace to Remotion scene descriptors
- [x] add mathematical golden tests
- [x] add compiler determinism tests
- [x] execute a real Remotion render smoke test
- [x] record reproducible verification evidence

*(MM-001 is fully verified and DONE across MM-001.1 through MM-001.6. Transitioning focus to NEXT items.)*

## NEXT

- [ ] integrate `packages/*` into workspace build/typecheck/test gates
- [ ] formalize schema/version validation
- [ ] add CI quality gates
- [ ] establish render regression policy
- [ ] create second Math Motion concept using existing primitives

## LATER

- [ ] complete one production nano-game
- [ ] expand Math Motion concept library
- [ ] expand nano-game portfolio
- [ ] deployment automation
- [ ] operational observability
- [ ] performance/accessibility certification

## Intake Rule

New work enters BACKLOG first. It moves to NOW only when it has an owner, acceptance criteria, and a clear reason it outranks existing NOW work.

## WIP Rule

Keep NOW intentionally narrow. Starting a new stream requires finishing, splitting, or explicitly de-scoping an existing NOW item.

## Completion Rule

A checked item is not DONE until it satisfies `docs/00-governance/00-01-definition-of-done.md`.
