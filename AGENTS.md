# AGENTS.md

Guidance for AI agents working in this repository. Full plan: `docs/10-development-plan/10-01-development-plan.md`.

## Project

**nano-games**: 3 small vanilla-JS/HTML5 educational browser games for K-12 students (vocab matching, math arcade, chemistry quiz). Zero runtime dependencies, no build step, no framework — plain ES6+ modules served as-is.

**Current state: pre-implementation.** No `index.html`, `games/`, or top-level `tests/` runtime yet — only `docs/` and early `shared/` scaffolding (`audio.ts`, `shell.ts`, `shell-dom.ts`, `storage.ts`, `styles.css`). There is no `package.json`, no npm/build tooling beyond the TS/CI pipeline already added, and no bundler or framework is planned.

## Target architecture (build toward this)

```textplain
index.html            # game hub
games/01-vocab-match/  02-math-guardian/  03-chemistry-quiz/
  index.html, style.css, game.js, data/*.js   # content data separate from game logic
shared/                # shell.js (state machine/HUD), audio.js, storage.js, styles.css
tests/                 # node --test, one pure-logic-module test per game
.github/workflows/ci.yml
```

- Game 2 (Math Guardian) uses Canvas 2D (fast sprites); Games 1 & 3 use DOM (screen-reader friendly).
- Game logic must stay UI-independent and testable without a browser (pure functions in `tests/*.test.js` via `node --test`).
- Content (word lists, question banks, difficulty bands) lives in `data/*.js` modules, separate from game logic, so it's editable without touching code.

## Non-negotiable constraints

- **Accessibility (WCAG 2.2 AA)**: full keyboard operation, visible focus, contrast ≥ 4.5:1, `prefers-reduced-motion` support, touch targets ≥ 44px, ARIA live regions for game state changes.
- **Privacy (COPPA)**: zero data collection. No accounts, no analytics, no third-party requests/scripts/cookies. Persist only to `localStorage`.
- **Performance**: ≤ 200 KB total JS per game; no framework payloads.
- **Deploy target**: GitHub Pages via GitHub Actions (not branch-deploy). All hub/game links must be **relative** (`./games/...`) since the site is served from a subpath — absolute paths break it. Include `.nojekyll` in the deploy artifact.

## Testing

Use Node's built-in test runner: `node --test`. Only pure logic modules are tested (matching, scoring, answer generation/validation, state machine transitions) — no DOM testing.

## Ignore unrelated rules

`.claude/rules/`, `.agents/rules/`, and `.claude/skills/` contain boilerplate from an unrelated template (NestJS/Prisma/Turborepo monorepo conventions, trading-signal governance docs, `@repo/*` package conventions, Python/uv standards, finance/trading skills). None of this describes nano-games — this is not a monorepo, not TypeScript/NestJS-backend, not Python, and has no trading component. Ignore that technology-specific guidance; general process rules unrelated to tech stack (e.g. no-fluff communication style) may still apply. Turborepo was explicitly evaluated and rejected — see plan §8.1.

README.md references a "Freebuff CLI" AI agent workflow from the project's original setup; that doesn't affect how you should work here.
