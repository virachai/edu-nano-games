# 09-01 — Workspace Verification Runbook

## Purpose

Canonical commands for verifying the workspace: build, typecheck, and test gates, including the `packages/*` workspace packages (`@edu-nano-games/semantic-engine`, `@edu-nano-games/remotion-runtime`).

Run these from the repository root. Package manager: **pnpm**.

## Verification Gates

| Gate      | Command          | What it covers                                                                        |
| --------- | ---------------- | ------------------------------------------------------------------------------------- |
| Build     | `pnpm build`     | `tsc -b` across all project references (games, `shared/`, `packages/*`)               |
| Typecheck | `pnpm typecheck` | Same project-reference graph, incremental; use `npx tsc -b --force` for a clean check |
| Test      | `pnpm test`      | `tsc -b` followed by `node --test tests/*.test.js` (pure logic modules only)          |
| Lint      | `pnpm lint`      | ESLint over hand-written JS (tests, config files)                                     |

## Workspace Package Coverage

The root `tsconfig.json` project references include:

- `games/01-vocab-match`, `games/02-math-guardian`, `games/03-chemistry-quiz`
- `shared/`
- `packages/semantic-engine` — typechecked from its JS sources via `allowJs` (no emit; emits are gitignored)
- `packages/remotion-runtime` — typechecked from `src/*.jsx` (no emit; React/Remotion types resolved from installed dependencies)

`pnpm-workspace.yaml` includes `packages/*`, so workspace tooling sees both packages.

## Full Verification Sequence

```bash
pnpm build
pnpm typecheck
pnpm test
node --test tests/*.test.js   # test baseline without rebuild
pnpm lint
```

## Rules

- Do not claim a gate passed unless the exact command was executed in this workspace.
- Emitted files under `packages/*` (`.js`, `.d.ts`, `.js.map`, `.d.ts.map`, `tsconfig.tsbuildinfo`) and `packages/remotion-runtime/dist/` are build artifacts and gitignored; never commit them.
- Game logic tests stay UI-independent: only pure logic modules are tested via `node --test` (no DOM).
