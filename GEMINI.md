# 🎮 GEMINI.md - Instructions & Design Mandates

This file serves as the core instruction manual and design mandate for Gemini AI when developing inside the `edu-nano-games` (nano-games) repository. These guidelines represent the absolute source of truth and take precedence over general defaults.

---

## 🚀 1. Project Overview & Architectural Vision

`nano-games` is a collection of educational mini-games (K-12 grade-banded) built to be fast, highly accessible, and simple to run on school hardware.

- **Technology Stack:** Plain HTML5, CSS3, and Vanilla JavaScript (ES6+ modules).
- **Dependency Philosophy:** **Zero runtime dependencies and no build step.** No bundlers (Vite/Webpack), compilers (TypeScript), frameworks (React/Vue), or bloated CSS libraries (Tailwind). Code is written in pure ES6+ modules and served as-is.
- **Pre-Implementation State:** The project is starting from a clean slate. Currently, only documentation (`docs/`) and root configuration files exist. There is no `package.json` and none is planned.

---

## 🛠️ 2. Repository Layout (Target Architecture)

All upcoming implementations must strictly build toward and respect this layout:

```text
index.html                     # Game hub / launcher (card links to each game)
games/
  01-vocab-match/
    index.html                 # game-specific page
    style.css                  # game-specific styles
    game.js                    # DOM logic only (cards, flip, match)
    data/words.js              # word/picture sets, difficulty bands
  02-math-guardian/
    index.html
    style.css
    game.js                    # Canvas 2D render loop + input + collision
    data/levels.js             # arithmetic difficulty bands
  03-chemistry-quiz/
    index.html
    style.css
    game.js                    # DOM quiz engine (scenario -> question -> feedback)
    data/questions.js          # chemistry question bank with explanations
shared/
  shell.js                     # start screen, HUD, game-over flow, state machine
  audio.js                     # Web Audio SFX synth + mute toggle (no static audio files)
  storage.js                   # localStorage score persistence (best scores)
  styles.css                   # design tokens (CSS custom properties), shared UI
tests/
  vocab-match.test.js          # matching & scoring logic tests
  math-guardian.test.js        # answer generation & validation tests
  chemistry-quiz.test.js       # question selection & scoring tests
  shell.test.js                # state machine transitions tests
.github/workflows/ci.yml       # run tests on push; deploy to GitHub Pages
```

### Shared Game Shell (`shared/shell.js`)

- **State Machine:** Enforce states: `start → playing → paused → gameover`.
- **Keyboard Controls:** Use `Esc` or `P` to toggle pause.
- **HUD:** Common overlay displaying score, lives/streak, current level, and mute button.
- **Game-Over Screen:** Star feedback based on score + retry option. Do not use punitive screens.
- **Synthesized Audio (`shared/audio.js`):** Built on the Web Audio API to synthetically generate short, clean game sound effects, preventing the need for licensed audio asset files. Includes a global mute switch.

---

## 🛑 3. Non-Negotiable Constraints & Mandates

### ♿ Accessibility (WCAG 2.2 AA)

- **Keyboard Operability:** 100% of game functions must be keyboard-operable, utilizing logical tab indexing.
- **Focus Indicators:** Always supply prominent, high-contrast focus rings for interactable elements.
- **Contrast ratio:** Must be $\ge$ 4.5:1 for all text. Never use color alone to convey crucial info.
- **Reduced Motion:** Respect `prefers-reduced-motion` media queries (e.g., lower speed/spawn rate of meteors in Game 2).
- **Touch-Friendly:** Keep touch targets at $\ge$ 44px with generous spacing.
- **ARIA Live Regions:** Use standard live regions (`role="status"` or `aria-live`) to announce game state transitions, correct/incorrect answers, and final scores to screen readers.

### 🔒 Privacy (COPPA Compliance)

- **Zero Collection:** Absolutely no accounts, forms, cookies, analytics, or external trackers.
- **Isolation:** No third-party network requests (e.g., CDNs, Google Fonts). Package fonts and icons locally or use system font stacks.
- **Local Persistence:** Save high scores only to `localStorage`.
- **Classroom Mode:** Provide a toggle/option for "no scores saved" to fit zero-persistence school environments.

### ⚡ Performance & Footprint

- **File Limit:** Total JavaScript payload per game must be $\le$ 200 KB.
- **Assets:** Use lightweight SVG icons or procedurally generated canvas assets where possible. Ensure images are highly compressed.

### 🌐 Deploy & Path Routing

- **Deploy Target:** GitHub Pages served via GitHub Actions.
- **Relative Linking Mandatory:** All paths (e.g., asset links, game links, imports) **MUST be relative** (`./games/...` or `./shared/...`). Absolute paths (`/games/...` or `/shared/...`) will break routing when hosted from a GitHub repository subpath.

---

## 🧪 4. Testing & Validation

- **Test Runner:** Built-in Node test runner: `node --test`. No third-party frameworks (Jest/Vitest).
- **Execution Command:**

  ```bash
  node --test tests/*.test.js
  ```

- **Test Scope:** Pure logic modules only. Test answer generation, scoring calculations, matching checks, and state machine transitions.
- **No Browser Mocking:** Do not use DOM mocking, JSDOM, or browser testing in unit tests. Keep game logic cleanly decoupled from DOM rendering to maintain quick, local node tests.

---

## ⚠️ 5. Stale Configurations & Anti-Patterns to Avoid

- **Ignore Boilerplate Rules:** The `.claude/rules/`, `.agents/rules/`, and `.claude/skills/` directories contain boilerplate from a completely unrelated template (NestJS, Prisma, Turborepo, FinTech, quantitative analysis). **Ignore these entirely.**
- **No Monorepo/Task Runners:** Turborepo is explicitly evaluated and rejected. Do not introduce workspace packaging, `package.json` layers, or bundler configs.
- **No TypeScript/Compilers:** Stick purely to ES6+ Vanilla JavaScript.

---

## 🎨 6. Coding & Styling Standards

- **Separation of Concerns:** Keep core content (words, levels, questions) in pure data structures inside `data/*.js` (e.g., `words.js`), separate from game controller code (`game.js`).
- **Styling Method:** Standard CSS3 with CSS Custom Properties (variables) in `shared/styles.css` for consistent tokens (colors, font scales, border radiuses, and accessibility focus outlines). Avoid utility libraries like Tailwind.
- **ES6 Modules:** Every JS file must be structured as an ES module (`export`, `import` with explicit `.js` extensions).
