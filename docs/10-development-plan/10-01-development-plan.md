# 10-01-development-plan.md

## Development Plan: nano-games

The master plan for turning the documented vision (`README.md`, `docs/`) into a working collection of web-based educational mini-games. It covers research-backed technical decisions, the target architecture, a phased roadmap with definitions of done, content planning, and cross-cutting requirements.

---

## 1. Research Summary & Key Decisions

| Topic               | Decision                                                                                                                          | Rationale                                                                                                                                         |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Engine**          | Vanilla JavaScript (ES6+ modules), zero dependencies                                                                              | Matches `README.md` tech stack; instant load on older school hardware; nothing to license or maintain.                                            |
| **Rendering**       | DOM/HTML for Games 1 & 3 (cards, quiz); **Canvas 2D** for Game 2 (arcade action)                                                  | DOM is screen-reader friendly and responsive-friendly; Canvas is justified only where sprites move fast (Game 2).                                 |
| **Accessibility**   | Target WCAG 2.2 AA: full keyboard operation, visible focus, contrast ≥ 4.5:1, pausable gameplay, `prefers-reduced-motion` support | Schools increasingly require WCAG-compliant ed-tech; keyboard-only play also helps touch/switch users.                                            |
| **Privacy (COPPA)** | **Zero data collection.** No accounts, no analytics, no third-party requests. Scores persist only in `localStorage`               | Audience includes children under 13; COPPA requires parental consent for any personal info collection — collecting nothing avoids this entirely.  |
| **Learning design** | Immediate feedback, retrieval practice, spaced repetition of missed items, difficulty progression                                 | 2024 meta-analysis: spaced repetition + retrieval practice improves outcomes ~25% vs. either alone; instant feedback reinforces correct behavior. |
| **Content as data** | Word lists / question banks / difficulty bands live in plain JS data modules, separate from game logic                            | Teachers can review and update curriculum content without touching game code; enables future curriculum variants.                                 |
| **Audio**           | Web Audio API for synthesized SFX + a global mute toggle                                                                          | No licensed assets; tiny footprint; audio feedback supports learning and engagement.                                                              |
| **Testing**         | Node built-in test runner (`node --test`) against **pure logic modules** (no DOM)                                                 | Zero-dependency testing — game logic (matching, scoring, generators, validation) is testable without a browser or framework.                      |
| **Hosting**         | GitHub Pages for v1, deployed via GitHub Actions (see § 8); Netlify later for a custom domain / previews                          | GitHub Pages ships from this repo for free with HTTPS; Actions deploy avoids a `gh-pages` branch and runs tests first.                            |
| **3D (Three.js)**   | Deferred until a game actually needs 3D                                                                                           | Keep the initial release dependency-free; revisit per `README.md` optional tech.                                                                  |

---

## 2. Target Architecture

### 2.1 Repository Layout

```text
index.html                     # Game hub / launcher (card links to each game)
games/
  01-vocab-match/
    index.html                 # game-specific page
    style.css
    game.js                    # DOM logic only (cards, flip, match)
    data/words.js              # word/picture sets, difficulty bands
  02-math-guardian/
    index.html
    style.css
    game.js                    # Canvas render loop + input
    data/levels.js             # arithmetic difficulty bands
  03-chemistry-quiz/
    index.html
    style.css
    game.js                    # DOM quiz engine (scenario → question → feedback)
    data/questions.js          # question bank with explanations
shared/
  shell.js                     # start screen, HUD, game-over flow, state machine
  audio.js                     # Web Audio SFX synth + mute toggle
  storage.js                   # localStorage score persistence (best scores)
  styles.css                   # design tokens (CSS custom properties), shared UI
tests/
  vocab-match.test.js          # matching & scoring logic
  math-guardian.test.js        # answer generation & validation
  chemistry-quiz.test.js       # question selection & scoring
  shell.test.js                # state machine transitions
.github/workflows/ci.yml       # run tests on push; deploy to GitHub Pages
```

### 2.2 Shared Game Shell (built once, used by all games)

- **State machine:** `start → playing → paused → gameover` (and back), with keyboard shortcut for pause (Esc/P).
- **HUD:** score, lives/streak, level, mute toggle.
- **Game-over:** stars based on score + "try again" / "back to hub"; never punishes failure.
- **Layout:** responsive (≥ 360 px), touch-friendly targets (≥ 44 px), keyboard + mouse + touch input.

### 2.3 Content Data Schema (examples)

```js
// games/01-vocab-match/data/words.js
export const sets = [
  {
    id: "animals-easy",
    gradeBand: "early-elementary",
    pairs: [
      { word: "cat", image: "cat.svg", translation: "cat" },
      { word: "dog", image: "dog.svg", translation: "dog" },
    ],
  },
];

// games/02-math-guardian/data/levels.js
export const levels = [
  {
    band: "upper-elementary",
    operators: ["+", "-"],
    maxOperand: 20,
    meteorCount: 4,
    speed: 1.0,
  },
];

// games/03-chemistry-quiz/data/questions.js
export const questions = [
  {
    scenario: "Which element is essential for breathing?",
    answer: "Oxygen",
    distractors: ["Nitrogen", "Helium"],
    explanation: "...",
  },
];
```

---

## 3. Phased Roadmap

### Phase 0 — Foundation (v1.0.0)

- [ ] Scaffold repository layout (hub page, `shared/`, `games/`, `tests/`, CI workflow).
- [ ] Build the shared game shell: state machine, HUD, game-over flow, design tokens.
- [ ] Deploy stub site to GitHub Pages; verify HTTPS and mobile rendering.
- **Definition of done:** hub page loads, shell runs a dummy game end-to-end, `node --test` passes, site is live on HTTPS.

### Phase 1 — Game 1: Vocabulary Matching (v1.1.0)

- [ ] Card-flip mechanic (DOM): flip two cards, match word↔image, immediate feedback.
- [ ] Content: 3 word sets (early elementary English/basic science) in `data/words.js`.
- [ ] Scoring + streaks; missed pairs reappear later in the round (retrieval practice).
- [ ] Keyboard-first operation + ARIA live regions for match results.
- **DoD:** playable on touch and keyboard; logic covered by `tests/vocab-match.test.js`; content editable without touching logic.

### Phase 2 — Game 2: Math Guardian Spaceship (v1.2.0)

- [ ] Canvas 2D render loop (requestAnimationFrame, delta-time) and input (keyboard + pointer).
- [ ] Answer generator + meteor targets; correct answers score, wrong answers cost a life.
- [ ] Difficulty bands per grade (upper elementary → middle school) via `data/levels.js`.
- [ ] Pause on focus loss; reduced-motion fallback (lower spawn rate).
- **DoD:** playable on desktop and touch; generator/scoring covered by tests; runs smoothly on low-end hardware (no frame-rate assumptions).

### Phase 3 — Game 3: Chemistry Quiz Adventure (v1.3.0)

- [ ] Quiz engine (DOM): scenario → question → answer → explanation feedback loop.
- [ ] Question bank for middle/high school (periodic table, elements, reactions) in `data/questions.js`.
- [ ] Level progression through simulated scenarios; wrong answers explained and retried.
- **DoD:** full bank playable; selection/scoring covered by tests; explanations shown on every answer.

### Phase 4 — Polish & Scale (v1.4.0+)

- [ ] WCAG 2.2 AA audit (keyboard walkthrough, contrast check, screen-reader pass).
- [ ] Lighthouse performance/a11y pass (target: a11y ≥ 95, fast-load budget ≤ 200 KB total JS per game).
- [ ] Teacher-facing extras: printable word lists, class-friendly "no scores saved" mode.
- [ ] Optional: Netlify deploy (custom domain, preview branches), leaderboards only via a privacy-safe opt-in backend.
- **DoD:** all three games pass the audit; every game logic module has unit tests; zero data collection verified in network tab.

---

## 4. Content & Curriculum Plan

- **Game 1:** start with English/basic-science word sets (animals, colors, classroom objects) with language translations; grade bands early → upper elementary.
- **Game 2:** arithmetic only (+, −, ×, ÷) with operand limits per band; later: simple equations to match the README description.
- **Game 3:** periodic table essentials (symbols, uses, groups), then simple reactions; scenario-based framing per README.
- Content must be reviewed against curriculum levels before release — see `08-analysis-gap` risk C.

---

## 5. Cross-Cutting Requirements (apply to every game)

### Accessibility (WCAG 2.2 AA)

- Full keyboard operation; visible focus indicator; logical tab order; Esc/P pauses.
- ARIA live regions announce score changes and match results; alt text for images.
- Contrast ≥ 4.5:1 for text; no information conveyed by color alone.
- `prefers-reduced-motion` respected; no mandatory time pressure (timers pause-able).
- Touch targets ≥ 44 px.

### Privacy (COPPA-aligned)

- No accounts, no forms, no third-party scripts, no analytics, no cookies.
- Scores/state in `localStorage` only; "no data saved" mode for classrooms.
- Verify in DevTools Network tab: zero outbound requests beyond the site itself.

### Performance

- Zero build step; ES modules loaded per game; total JS per game ≤ 200 KB.
- Assets (images/sprites) as small SVGs or compressed PNGs; no framework payloads.

### Consistency

- All games share `shared/styles.css` tokens, shell flow, and audio for a uniform feel.
- All content in `data/` modules; game logic stays UI-independent and testable.

---

## 6. Risks & Mitigations

| Risk                                 | Mitigation                                                                                    |
| :----------------------------------- | :-------------------------------------------------------------------------------------------- |
| Content not aligned with curricula   | Version content as data; review word/question banks with teachers before release.             |
| Age-appropriateness / frustration    | Per-game difficulty bands, streaks over harsh penalties, encouraging game-over screens.       |
| Cross-device inconsistency           | Responsive shell, 44 px touch targets, keyboard + touch input everywhere.                     |
| Accessibility gaps                   | Keyboard-first development from Phase 1, WCAG 2.2 AA audit in Phase 4, not retrofitted later. |
| Scope creep (leaderboards, accounts) | Deferred to Phase 4+ and only via privacy-safe opt-in; core = the three games, done well.     |

---

## 7. Success Metrics

- A student reaches any game in ≤ 3 clicks from the hub.
- All three games playable keyboard-only and touch-only.
- Every pure logic module has passing `node --test` tests in CI.
- Lighthouse accessibility ≥ 95 and performance ≥ 90 on a mid-range device.
- Network tab shows zero data collection; scores persist across reloads via `localStorage`.
- Content (word lists, questions, difficulty) editable by a teacher without touching game logic.

---

## 8. Turborepo & GitHub Pages — Research Decisions (Sept 2026)

Deep-research outcomes for two recurring questions: (a) should the repo adopt Turborepo, and (b) how the static site is built and deployed to GitHub Pages.

### 8.1 Turborepo: not adopted (for now)

**What it is:** Turborepo is Vercel's open-source task orchestrator + content-hash cache for JavaScript/TypeScript monorepos. It is not a package manager — it layers onto npm/pnpm/yarn workspaces and runs each package's existing `package.json` scripts. Core value: (1) task-graph parallelism (`dependsOn` with `^` for dependency-first ordering), (2) caching of task `outputs` so unchanged work is skipped, (3) changed-only CI runs (`--filter=...[origin/main]`).

**Why not here yet:** caching pays off when tasks emit build artifacts; this repo deliberately has **no build step** (vanilla ES modules served as-is). Adopting Turborepo would require npm/pnpm workspaces, per-game `package.json`s, and a `turbo.json` — contradicting the zero-dependency, runs-on-school-hardware ethos in `README.md` and § 1. The `games/` + `shared/` folder layout is already a lightweight monorepo structure without the tooling.

**Revisit when:** the collection grows beyond ~5–6 games, shared code gains a compile step (e.g., TypeScript), or CI time becomes a bottleneck. Migration path: introduce pnpm workspaces → split into `apps/` (games) + `packages/` (shared logic) → add turbo. `.gitignore` already excludes `.turbo/`, so nothing blocks this later.

### 8.2 GitHub Pages: static build via GitHub Actions

GitHub Pages supports two publishing modes (GitHub docs):

1. **Deploy from a branch** — pick a branch + folder (`/` or `/docs`) with zero config, auto-published on push. Not suitable here: `/docs` is project documentation, not the site, and branch mode cannot run a build or tests.
2. **GitHub Actions workflow** — recommended when any build/control is needed. Current canonical pattern for this repo lives in `.github/workflows/ci.yml` and combines check, build, and deploy jobs.

```yaml
name: Deploy site
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: node --test # run tests before shipping
      - run: mkdir -p _site && cp -r index.html games shared _site && touch _site/.nojekyll
      - uses: actions/upload-pages-artifact@v3
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

**Non-negotiables for this repo:**

- **Relative URLs only.** A project site lives at `https://<user>.github.io/edu-nano-games/` (a subpath), so any absolute path (`/games/…`) breaks. Hub links must use `./games/01-vocab-match/`, and assets must be referenced relatively. This is the #1 failure mode for vanilla multi-page static sites.
- **`.nojekyll`** in the deploy root to prevent Jekyll preprocessing.
- The deploy root is built into `_site/` (or the repo root staged via the artifact action); sources always stay on `main` — no `gh-pages` branch to maintain.
- Site content is **public by default** (even for private repos on paid plans) — never publish secrets.
- Custom domain is configured in repo Settings (or API), and Pages is free on GitHub Free for public repos.
- `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` require the `pages: write` / `id-token: write` permissions and a `github-pages` deployment environment.
