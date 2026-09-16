# Work Breakdown

## MM-001 — 6174 Production Vertical Slice

**Objective:** establish the first complete, deterministic Math Motion production path.

### MM-001.1 — Contract Reconciliation

**Status:** DONE

- canonical 6174 recipe is the source of truth
- semantic engine imports canonical recipe data
- recipe and operation contracts are validated
- contract regression tests exist

### MM-001.2 — Semantic Execution

**Status:** DONE

**Acceptance criteria**

- 6174 state transitions are derived from semantic operations
- terminal state is mathematically correct
- execution is deterministic
- state invariants are enforced
- the canonical sequence is regression-tested

**Implementation evidence**

- `packages/semantic-engine/math-state.js` now updates `value`, `text`, and ordered digits together during semantic sorting
- state validation now rejects mismatched numeric/text/digit representations
- `tests/math-motion-semantic-execution.test.js` verifies the complete 9-step semantic sequence, digit multiset preservation, and replay determinism

**Verified sequence**

```text
3524
→ 5432
→ 2345
→ 3087
→ 8730
→ 0378
→ 8352
→ 8532
→ 2358
→ 6174
```

### MM-001.3 — Canonical Recipe

**Status:** DONE

**Acceptance criteria**

- recipe is the renderer-independent source of truth
- semantic execution order is validated against recipe operation order
- recipe expectations are checked against observed semantic changes
- preserved element invariants are checked during trace validation
- canonical recipe remains deterministic and contract-valid

**Implementation evidence**

- `math-motion/concepts/6174/recipe.json` is the canonical recipe source
- `packages/semantic-engine/recipe.js` imports the canonical recipe directly
- `packages/semantic-engine/validation.js` validates trace operation identity/order and recipe `expect.preserves` / `expect.changes`
- `tests/math-motion-contract.test.js` covers canonical trace conformance and rejects operation-order drift

**Verified**

- 6174 recipe executes through the canonical 9-step sequence
- renderer-oriented operation parameters remain rejected
- trace validation returns no errors for the canonical recipe
- all MM-001 contract and semantic execution tests pass

### MM-001.4 — Remotion Compilation

**Status:** DONE

**Acceptance criteria**

- validated semantic trace compiles to valid scene descriptors
- compilation is deterministic
- scene timing and duration are consistent

**Implementation evidence**

- `packages/semantic-engine/remotion-compiler.js` compiles the semantic trace into deterministic Remotion scene descriptors
- `validateRemotionScenes` enforces contiguous frame ranges, scene durations, unique IDs, semantic/render payloads, and total timeline duration
- `compileValidatedRemotionScenes` provides a recipe-execution-to-compilation boundary for the next pipeline stage
- `tests/math-motion-contract.test.js` verifies 6174 scene compilation, terminal-state preservation, operation ordering, timeline consistency, and deterministic replay

**Verified**

- 6174 produces one initial scene plus one scene per semantic operation
- compilation uses explicit FPS and per-scene frame durations
- scene frame ranges are contiguous with no gaps or overlaps
- compiled terminal state matches the semantic execution terminal state
- repeated compilation produces an identical descriptor
- MM-001 contract and semantic execution tests pass (10/10)

### MM-001.5 — Real Render

**Status:** BACKLOG

- real Remotion render completes from repository source
- output is traceable to concept/recipe
- render failure is reproducible

### MM-001.6 — Release Evidence

**Status:** BLOCKED

**Reason:** MM-001.5 Real Render is not complete. The repository contains the Remotion runtime source and deterministic scene compiler, but the current environment cannot complete dependency installation / an actual MP4 render.

**Release evidence captured so far**

- semantic and contract tests pass (10/10)
- canonical 6174 execution is deterministic
- Remotion scene compilation is deterministic and timeline-valid
- runtime documentation records the environment-dependent render limitation

**Exit criteria remaining**

- clean-checkout verification after a successful real render
- recorded render artifact and source-to-render traceability
- known limitations updated from the actual render run
- Definition of Done sign-off after MM-001.5 is DONE

## Task State Machine

```text
BACKLOG → READY → IN PROGRESS → VERIFY → DONE
                       │              │
                       └──────────────┴→ BLOCKED
```

`BLOCKED` requires a reason and the dependency preventing progress.
