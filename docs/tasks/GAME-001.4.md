# GAME-001.4 — Fraction Forge Game Feel & Visual Polish

**Status:** READY
**Priority:** P1
**Depends On:** GAME-001.3
**Owner:** Local Agent
**Created:** 2026-09-20
**Updated:** 2026-09-20
**Evidence:** docs/12-evidence/GAME-001.4.md

## Objective

Transform the minimal Fraction Forge browser UI into a visually coherent, responsive learning game with clear game-state feedback and lightweight interaction polish, while preserving the GAME-001.2 semantic contract and the playable loop delivered by GAME-001.3.

## Scope

### In Scope

- Establish a clear Fraction Forge visual identity using the existing project styling conventions.
- Improve layout hierarchy for title, question, target denominator, answer choices, feedback, score, and Next Question.
- Make answer states visually distinct: default, hover/focus, selected/locked, correct, and incorrect.
- Add lightweight CSS transitions and non-essential micro-animation that communicate state changes without becoming the primary renderer.
- Add responsive behavior for narrow/mobile and wider screens.
- Improve accessibility: visible focus states, semantic controls, readable contrast, reduced-motion accommodation, and useful status messaging where appropriate.
- Keep the game immediately understandable without adding instructions that duplicate the task's core learning flow.
- Add or update focused tests only where the UI contract can be tested without requiring a browser automation framework.
- Preserve the existing pure session/semantic architecture.

### Out of Scope

- Timer, lives, leaderboard, accounts, persistence, progression systems, multiplayer, backend, audio, analytics, telemetry, or external services.
- New frontend frameworks or build systems unless an existing repository convention requires one.
- Remotion as the primary game renderer.
- Procedural visual effects, particle systems, canvas/WebGL rendering, or complex animation libraries.
- New mathematical/question-generation rules.
- Changes to GAME-001.2 scoring or answer-validation semantics.
- Production deployment or release packaging.
- Unrelated refactors.
- Reviewer artifacts or DWB105 approval changes.

## Preconditions

The agent must confirm these before editing.

- [ ] GAME-001.3 is DONE in authoritative docs/BACKLOG.md.
- [ ] GAME-001.3 implementation and evidence are readable.
- [ ] Existing CSS/shared style conventions are available.
- [ ] TypeScript/build/test environment is usable.
- [ ] No unresolved blocker prevents visual polish work.

If a precondition fails, stop and report the exact blocker.

## Inputs / Read First

**Required:**

- docs/AGENT_RULES.md
- docs/AGENT_RUNBOOK.md
- docs/BACKLOG.md
- docs/tasks/GAME-001.3.md
- docs/12-evidence/GAME-001.3.md

**Task-specific:**

- games/04-fraction-forge/index.html
- games/04-fraction-forge/style.css
- games/04-fraction-forge/dom.ts
- games/04-fraction-forge/session.ts
- games/04-fraction-forge/data/questions.ts
- existing shared CSS and shell UI conventions
- relevant focused tests and package scripts

## Procedure

1. Verify GAME-001.3 is DONE and inspect the existing UI/styles.
2. Identify reusable shared tokens/components before adding new styles.
3. Implement the visual hierarchy and game-state styling.
4. Add lightweight transitions/micro-animation with a prefers-reduced-motion fallback.
5. Improve responsive layout and keyboard/focus accessibility.
6. Preserve all semantic/session behavior; do not duplicate fraction math.
7. Add/update focused tests where practical.
8. Run typecheck/build, focused tests, full test suite, self-check, and git diff --check.
9. Record exact results and known limitations in evidence.
10. Stop at EVIDENCE_COMPLETE; DWB105 owns review and DONE.

## Acceptance Criteria

- [ ] The game has a coherent visual hierarchy and recognizable Fraction Forge presentation.
- [ ] Question, target denominator, choices, feedback, score, and Next Question remain clearly visible.
- [ ] Answer states provide clear visual feedback without changing semantic outcomes.
- [ ] Keyboard users can identify focused controls and operate the game without pointer-only interactions.
- [ ] Layout remains usable on narrow/mobile and wider screens.
- [ ] Lightweight transitions/micro-animation are present where useful and disabled/reduced under prefers-reduced-motion.
- [ ] Feedback/status updates are exposed through appropriate semantic/ARIA mechanisms without excessive announcements.
- [ ] GAME-001.2 validation and score semantics remain unchanged.
- [ ] Existing focused and full test suites pass.
- [ ] Typecheck/build, self-check, and git diff --check pass.
- [ ] No excluded v0.1 systems are introduced.
- [ ] Evidence is complete and truthful.

## Verification

Run and record actual results:

```bash
tsc -b
node tests/fraction-forge.test.js
node tests/fraction-forge-session.test.js
pnpm test
node scripts/agent-self-check.mjs GAME-001.4
git diff --check
```

Also perform a code-level accessibility/responsive inspection and, if the repository environment provides a browser-capable check, run the appropriate browser/UI check.

Expected result:

- Typecheck/build succeeds.
- Focused tests pass.
- Full suite passes.
- Self-check passes.
- Diff check passes.
- UI remains semantically driven by GAME-001.2.

## Failure / Blocker Protocol

If a required step fails:

1. Capture the exact command and relevant error/output.
2. Determine whether the cause is task code, an existing issue, or environment/dependency.
3. Fix only if within this task's scope.
4. Otherwise stop and report BLOCKED or IMPLEMENTED; never claim DONE.

## Evidence Required

Update docs/12-evidence/GAME-001.4.md with:

- changed files
- exact commands executed
- actual verification results
- acceptance-criteria mapping
- accessibility/responsive inspection results
- screenshots or runtime artifacts if available
- known limitations/risks
- reproduction steps

Do not add reviewer conclusions; DWB105 adds them after handoff.

## Definition of Done

The local agent may report EVIDENCE_COMPLETE only when:

- [ ] implementation is complete
- [ ] every acceptance criterion passes
- [ ] required verification passes
- [ ] evidence is complete and truthful
- [ ] no unresolved in-scope blocker remains

**Important:** Local-agent completion is not reviewer approval. DWB105 reviews the evidence before the task is accepted as DONE.

## Final Handoff

TASK: GAME-001.4
STATUS: <EVIDENCE_COMPLETE|BLOCKED>
SUMMARY: <short factual summary>
CHANGED:

- <implementation files>
- <test files>
- docs/12-evidence/GAME-001.4.md
  VERIFICATION:
- <command> — PASS/FAIL
  EVIDENCE:
- docs/12-evidence/GAME-001.4.md
  BLOCKERS:
- <none or exact blocker>

FOLLOW-UP:

- DWB105 review
