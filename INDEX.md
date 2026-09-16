# edu-nano-games — Workspace Index

This file is the navigation index for the repository. Start here when exploring the workspace.

## Project Areas

| Area           | Purpose                                                                                   | Entry point                                                      |
| -------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `docs/`        | Product, architecture, roadmap, delivery, quality, operations, and analysis documentation | [`docs/README.md`](docs/README.md)                               |
| `games/`       | Educational nano-game implementations                                                     | `games/`                                                         |
| `shared/`      | Shared game/runtime assets and utilities                                                  | `shared/`                                                        |
| `packages/`    | Production reusable packages, including Math Motion semantic and rendering boundaries     | `packages/`                                                      |
| `math-motion/` | Canonical Math Motion concepts, grammar, experiments, and render outputs                  | [`docs/11-math-motion/README.md`](docs/11-math-motion/README.md) |
| `tests/`       | Repository and Math Motion regression tests                                               | `tests/`                                                         |
| `memory/`      | File-based project memory records and memory standards                                    | [`memory/README.md`](memory/README.md)                           |
| `ref-01/`      | Reference/research material; not a runtime dependency                                     | `ref-01/README.md`                                               |
| `.agents/`     | Agent/project guidance                                                                    | `.agents/README.md`                                              |
| `.claude/`     | Claude-specific project guidance                                                          | `.claude/README.md`                                              |

## Math Motion Production Path

The canonical 6174 vertical slice follows this dependency direction:

```text
math-motion/concepts/6174/concept.json
                  │
                  ▼
math-motion/concepts/6174/recipe.json
                  │
                  ▼
packages/semantic-engine
  semantic execution + validation
                  │
                  ▼
  deterministic semantic trace
                  │
                  ▼
packages/semantic-engine/remotion-compiler.js
                  │
                  ▼
  Remotion scene descriptors
                  │
                  ▼
packages/remotion-runtime
                  │
                  ▼
  rendered media
                  │
                  ▼
math-motion/renders/
```

**Invariant:** mathematical truth belongs to the semantic engine and canonical recipes. Renderer code consumes semantic traces/descriptors and does not recompute the mathematics.

## Delivery Control Plane

- [`docs/00-governance/00-01-definition-of-done.md`](docs/00-governance/00-01-definition-of-done.md) — Definition of Done
- [`docs/01-roadmap/01-01-master-roadmap.md`](docs/01-roadmap/01-01-master-roadmap.md) — master roadmap
- [`docs/01-roadmap/01-02-now-next-later.md`](docs/01-roadmap/01-02-now-next-later.md) — current delivery priorities
- [`docs/02-delivery/02-01-work-breakdown.md`](docs/02-delivery/02-01-work-breakdown.md) — work breakdown and task state
- [`docs/03-quality/03-01-quality-gates.md`](docs/03-quality/03-01-quality-gates.md) — quality gates

## Math Motion Navigation

- [`docs/11-math-motion/README.md`](docs/11-math-motion/README.md) — Math Motion documentation index
- [`docs/11-math-motion/11-01-architecture-adoption.md`](docs/11-math-motion/11-01-architecture-adoption.md) — architecture adoption
- `math-motion/concepts/` — canonical mathematical concepts and recipes
- `math-motion/grammar/` — reusable visual/semantic grammar
- `math-motion/lab/` — experiments and HyperFrames research
- `math-motion/renders/` — production and prototype render outputs
- `packages/semantic-engine/` — renderer-independent semantic execution and compilation
- `packages/remotion-runtime/` — Remotion rendering boundary

## Current Release State

The first Math Motion vertical slice is `MM-001 — 6174 Production Vertical Slice`.

- `MM-001.1` Contract Reconciliation — **DONE**
- `MM-001.2` Semantic Execution — **DONE**
- `MM-001.3` Canonical Recipe — **DONE**
- `MM-001.4` Remotion Compilation — **DONE**
- `MM-001.5` Real Render — **pending verification**
- `MM-001.6` Release Evidence — **BLOCKED until MM-001.5 is verified**

See [`docs/02-delivery/02-01-work-breakdown.md`](docs/02-delivery/02-01-work-breakdown.md) for the authoritative task state.

## Repository Rules

1. Keep mathematical semantics in `packages/semantic-engine`.
2. Keep recipes renderer-independent and treat them as the central contract between mathematical state and renderers.
3. Prefer reusable state primitives and visual grammar over concept-specific renderer components.
4. Preserve existing HTML/JS prototypes as research/reference assets; extract reusable behavior rather than mass-rewriting them.
5. Keep the architecture local-first/file-first; avoid premature database, queue, or cloud infrastructure.
6. Use `ref-01/` as reference material only; it is not a runtime dependency.

## Developer Commands

The intended workspace commands are defined in the root `package.json`:

```bash
npm test
npm run build
npm run typecheck
npm run lint
npm run format:check
```

The repository is configured as a pnpm workspace, but this environment may not have `pnpm` available. If a required command cannot run because tooling is absent, record that limitation rather than treating the check as passed.
