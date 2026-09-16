# Now / Next / Later

This document is the short-horizon execution control plane. Keep it small and update it when priorities change.

## NOW

### MM-001 — 6174 Production Vertical Slice

**Goal:** prove the complete Math Motion pipeline with one deterministic concept.

- [ ] reconcile semantic-engine contract with `math-motion/concepts/6174/recipe.json`
- [ ] derive the 6174 execution trace from semantic operations
- [ ] make recipe state canonical and renderer-independent
- [ ] compile trace to Remotion scene descriptors
- [ ] add mathematical golden tests
- [ ] add compiler determinism tests
- [ ] execute a real Remotion render smoke test
- [ ] record reproducible verification evidence

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
