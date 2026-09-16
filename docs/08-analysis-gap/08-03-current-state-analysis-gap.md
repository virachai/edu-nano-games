# Current State Analysis & Gap Assessment

## Scope

This assessment covers the current `/workspace` after adopting the `ref-01` Math Motion architecture. It evaluates both product tracks: `edu-nano-games` and the newly adopted Math Motion content/engine capability.

## Executive Summary

The workspace has moved from a documentation-only repository toward a real engineering foundation, but it is still **pre-MVP**.

The strongest architectural progress is the separation of mathematical semantics from rendering through `packages/semantic-engine`, `math-motion/concepts`, visual grammar, and `packages/remotion-runtime`. The 6174 concept now exists as a canonical golden concept with proof and a recipe artifact.

The largest remaining gaps are execution gaps rather than documentation gaps:

1. The three educational games remain placeholder scaffolds.
2. The Math Motion 6174 recipe is currently a compiled benchmark descriptor rather than a canonical renderer-independent authoring recipe matching the intended contract.
3. The 6174 path is not yet wired end-to-end from concept → semantic execution → visual grammar → prototype → Remotion render → QA.
4. Package/workspace integration is incomplete: the root TypeScript project does not reference the new packages, and the Remotion package has runtime dependencies but no explicit build/render scripts or package-level TypeScript configuration.
5. Automated tests for the semantic engine, Math Motion golden path, visual compilation, and rendering are missing from the root test suite.
6. Content governance, accessibility, curriculum validation, and release/distribution remain largely specified rather than implemented.

## Current State

### Product track A — Nano Games

| Area           | Current state                                                                                   | Gap                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Vocab Match    | `games/01-vocab-match/game.ts` is a 7-line placeholder                                          | No playable game, content model, scoring, UI, or game-specific tests                                      |
| Math Guardian  | `games/02-math-guardian/game.ts` is a 7-line placeholder                                        | No gameplay loop, answer generation, collision/input model, or game-specific tests                        |
| Chemistry Quiz | `games/03-chemistry-quiz/game.ts` is a 7-line placeholder                                       | No question bank, scenario flow, scoring, or game-specific tests                                          |
| Shared shell   | `shared/shell.ts`, `shell-dom.ts`, `audio.ts`, and `storage.ts` provide reusable infrastructure | Need to prove integration in a real game                                                                  |
| Build/test     | Root scripts exist                                                                              | New packages are not included in the root TS project references; package-level verification is incomplete |
| Distribution   | No implemented release/deploy workflow for playable games                                       | Need a concrete static-hosting/release path                                                               |

### Product track B — Math Motion

| Area             | Current state                                         | Gap                                                                                                    |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Semantic engine  | Implemented reusable JS modules                       | Needs stronger schema/runtime contracts and broader mathematical coverage                              |
| 6174 concept     | `math-motion/concepts/6174/concept.json` + `proof.md` | Needs canonical recipe linkage and automated validation                                                |
| 6174 recipe      | Contains benchmark scene values/phases                | Does not currently match the renderer-independent operation recipe used by the semantic engine         |
| Visual grammar   | Initial number registry exists                        | Registry is not yet connected to executable reusable visual primitives through a formal contract       |
| Remotion runtime | Runtime and visual primitives exist                   | No proven production render in this workspace                                                          |
| HyperFrames lab  | Directory exists                                      | No adopted 6174 prototype currently present in `math-motion/lab/hyperframes`                           |
| QA               | Validation modules exist in semantic engine           | No root-level golden/visual pipeline proving concept → render correctness                              |
| Reuse            | Architecture explicitly targets reuse                 | Only one canonical concept is present, so reuse has not yet been demonstrated across multiple concepts |

## Critical Architecture Gaps

### 1. Canonical contract mismatch

The intended architecture defines a renderer-independent Recipe containing concept identity, format, and semantic scene/operation declarations. The current `math-motion/concepts/6174/recipe.json` is instead a compact render benchmark containing `values`, `phases`, and frame metadata.

This creates two competing meanings of "recipe":

- semantic authoring recipe in `packages/semantic-engine/recipe.js`
- compiled/render benchmark descriptor in `math-motion/concepts/6174/recipe.json`

**Risk:** the file presented as the canonical recipe can drift away from the semantic engine and become renderer-specific.

**Required action:** define one canonical authoring schema and give compiled output a separate name/location such as `artifacts/compiled/*.json` or `.tmp/compiled/*.json`.

### 2. Concept → recipe linkage is incomplete

`concept.json` declares `visual.grammar: number/converge`, while the recipe currently describes a fixed sequence of phases. There is no explicit automated contract proving that the concept's mathematical operation, grammar, and recipe form a coherent executable unit.

**Required action:** add a concept validator that resolves the concept's recipe and grammar references and fails on missing or incompatible contracts.

### 3. Renderer boundary exists but production proof is incomplete

`packages/semantic-engine/remotion-compiler.js` correctly treats the execution trace as input and avoids doing mathematics in the render compiler. This is architecturally sound.

However, the actual path into `packages/remotion-runtime` has not been demonstrated in the workspace with a deterministic rendered artifact.

**Required action:** make 6174 the first executable production composition and add a render verification command plus a golden metadata check.

### 4. Package integration is partial

The workspace file includes `games/*`, `shared`, and `packages/*`, but the root `tsconfig.json` still references only the three games and `shared`.

This means the new packages are structurally present without being part of the same root typecheck/build graph.

**Required action:** add package-level `tsconfig.json` files and root project references where appropriate. Keep JavaScript semantic packages intentionally JS if desired, but give them explicit validation scripts.

### 5. Dependency/reproducibility risk

The Remotion runtime declares React, React DOM, Remotion, and the Remotion CLI, but there is no package-level script defining how to build or render a composition.

**Required action:** define explicit package scripts for compile/check/render and pin a compatible Remotion/React toolchain through the workspace lockfile.

## Testing & QA Gaps

### Existing

- Shared audio, shell, and storage tests exist.
- Semantic engine contains validation logic.
- Remotion compiler contains timeline validation.

### Missing

- semantic-engine unit tests in the root test command
- 6174 mathematical golden test
- invalid-input tests for 6174 rules
- concept/recipe schema validation tests
- grammar registry validation
- semantic trace → compilation golden test
- Remotion composition smoke test
- actual 1080×1920 / 30fps render verification
- text overflow/readability checks
- visual regression/golden render comparison
- deterministic artifact hash/metadata verification
- end-to-end test that a second concept can reuse the same primitives

## Product Gaps

### Nano Games

The product README promises three playable educational games, but implementation remains at scaffold level. The next milestone should therefore be measured by one complete playable game, not additional planning documents.

The shared infrastructure is ahead of the games themselves. This creates a risk of over-investing in architecture before validating player experience.

### Math Motion

Math Motion has the opposite imbalance: its architecture and semantic engine are more mature than its production content pipeline. The next milestone should therefore be a complete 6174 vertical slice rather than expanding the topic inventory.

## Content & Education Gaps

- No formal content schema for the three nano-games.
- No versioned question/word bank format.
- No curriculum-review workflow.
- No explicit Thai curriculum mapping despite the original documentation identifying this as a requirement.
- No teacher/content reviewer role in the content lifecycle.
- No learning-objective metadata shared across games and Math Motion.
- No evidence-based difficulty calibration.
- No content QA gate before release.

## UX / Accessibility Gaps

The documentation identifies cross-device and accessibility requirements, but implementation evidence is limited.

Missing or unverified areas include:

- keyboard-only operation for each game
- touch target sizing
- responsive behavior across phone/tablet/desktop
- reduced-motion behavior
- screen-reader semantics where applicable
- contrast verification
- non-color-only feedback
- audio-independent feedback
- readable text at intended device sizes

## Operations / Distribution Gaps

- No demonstrated static deployment target.
- No release artifact convention for games.
- No production render artifact convention for Math Motion.
- No CI job covering the new packages and Math Motion pipeline.
- No content version/release manifest.
- No failure/recovery runbook for render generation.
- No artifact retention policy.

## Scope / Boundary Risk

The workspace now contains two related but distinct product capabilities:

```text
edu-nano-games
├── interactive educational games
└── Math Motion
    ├── mathematical visual content
    ├── semantic engine
    └── deterministic video rendering
```

The shared engineering principles are useful, but the products should not be forced into one runtime or one UX architecture.

The strongest reusable boundary is the semantic/contract tooling, not a shared visual runtime between ordinary games and mathematical videos.

## Priority Matrix

### P0 — Blocking the first credible MVP

1. Make 6174 canonical recipe executable and consistent with the semantic engine.
2. Complete concept → recipe → semantic trace → Remotion compilation → render for 6174.
3. Add mathematical and compilation golden tests.
4. Integrate new packages into reproducible workspace validation.
5. Build one playable nano-game end-to-end.

### P1 — Required for repeatability

1. Formalize visual grammar registry/contract.
2. Add concept/recipe schema validation.
3. Add visual/render QA.
4. Add a second Math Motion concept using existing primitives.
5. Add game-specific content data contracts and tests.
6. Add CI coverage for both tracks.

### P2 — Scale after the vertical slices work

1. More mathematical concepts.
2. More game content.
3. Analytics feedback loop.
4. Broader accessibility certification.
5. Deployment automation and artifact management.
6. MCP orchestration beyond the minimum workflow.

## Recommended Next Sequence

```text
A. Fix contract naming/schema
        ↓
B. Make 6174 executable end-to-end
        ↓
C. Add golden + mathematical + render metadata QA
        ↓
D. Prove second Math Motion concept reuse
        ↓
E. Build one complete nano-game
        ↓
F. Integrate CI + deployment
        ↓
G. Scale content
```

## Definition of "Architecture Working"

The architecture should not be considered proven until all of the following are true:

- A verified mathematical concept exists as data.
- A canonical renderer-independent recipe executes without renderer code.
- The visual grammar is reusable and explicit.
- The same semantic result compiles into deterministic Remotion descriptors.
- A real Remotion render is produced and validated.
- A second mathematical concept reuses existing semantic/visual primitives.
- A complete nano-game uses the shared shell in a playable browser flow.
- CI validates both tracks from a clean checkout.

## Overall Assessment

**Architecture maturity:** foundation established.

**Implementation maturity:** pre-MVP.

**Primary risk:** the repository can accumulate architecture, documentation, and topic inventories faster than it accumulates working user-facing artifacts.

**Best corrective strategy:** stop broad expansion temporarily and prove two concrete vertical slices — one 6174 Math Motion video and one playable nano-game — with automated tests and reproducible builds.
