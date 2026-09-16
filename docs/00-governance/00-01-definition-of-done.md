# Definition of Done

## Purpose

Define the minimum evidence required for work to be considered complete in `edu-nano-games`.

## Universal Definition of Done

A task is **DONE** only when all applicable conditions are satisfied:

1. **Scope** — acceptance criteria are explicit and satisfied.
2. **Implementation** — production code/content is complete and integrated at the intended boundary.
3. **Validation** — relevant tests, type checks, lint, or deterministic validators pass.
4. **Regression safety** — existing behavior remains protected by tests or documented compatibility evidence.
5. **Documentation** — contracts, operational behavior, and non-obvious decisions are documented.
6. **Reproducibility** — another developer can reproduce the result from a clean checkout using repository commands.
7. **Evidence** — the task records what was verified and any known limitations.

## Math Motion DoD

A Math Motion concept is DONE only when applicable evidence exists for:

- concept schema validation
- mathematical proof/invariants
- deterministic semantic execution
- canonical renderer-independent recipe
- visual grammar compatibility
- Remotion compilation
- render smoke test or production render evidence
- mathematical/golden regression coverage

## Nano-Game DoD

A nano-game is DONE only when applicable evidence exists for:

- content/state contract
- playable browser flow
- deterministic game rules
- scoring/progression behavior
- persistence behavior where required
- accessibility requirements for the target release
- automated regression coverage
- production build artifact

## Exceptions

Exceptions require a documented reason, explicit owner, affected scope, and follow-up task. An exception is not equivalent to completion of the underlying requirement.

## Anti-Patterns

Do not mark work DONE because:

- code merely compiles
- a JSON file exists
- an architecture document exists
- a local demo works once
- a test is skipped
- a render descriptor validates without a real render when rendering is part of acceptance
