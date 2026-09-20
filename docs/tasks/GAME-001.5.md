# GAME-001.5 — Fraction Forge Question Variety & Randomization

**Status:** READY
**Priority:** P1
**Depends On:** GAME-001.4
**Owner:** Local Agent
**Created:** 2026-09-20
**Updated:** 2026-09-20
**Evidence:** docs/12-evidence/GAME-001.5.md

## Objective

Increase Fraction Forge replayability by selecting questions with controlled variety from the existing question bank, while preserving the GAME-001.2 semantic model, GAME-001.3 session contract, and GAME-001.4 UI behavior.

## Scope

### In Scope

- Introduce question selection/randomization at the session/content boundary without duplicating fraction validation or scoring logic.
- Use the existing fixed question bank as the source of playable content.
- Avoid presenting the same question immediately twice when the bank contains more than one distinct question.
- Keep selection behavior testable and deterministic through an injectable or equivalent controlled randomness mechanism.
- Preserve question object semantics and GAME-001.2 validation/scoring unchanged.
- Preserve GAME-001.3 session behavior and GAME-001.4 UI wiring.
- Add focused tests covering selection, variety, deterministic test control, and small-bank edge cases.
- Keep the implementation framework-independent and compatible with the current TypeScript/browser build.

### Out of Scope

- New fraction mathematics, validation rules, scoring rules, or learning semantics.
- Authoring a large new content-generation system or procedural question generator.
- Timer, lives, leaderboard, accounts, persistence, progression systems, multiplayer, backend, audio, analytics, telemetry, or external services.
- Difficulty/progression algorithms or adaptive learning.
- New frontend frameworks/build systems.
- Remotion as the primary game renderer.
- Complex animation, particles, canvas/WebGL, or unrelated visual work.
- Deployment/release packaging.
- Unrelated refactors.
- Reviewer artifacts or DWB105 approval changes.

## Preconditions

The agent must confirm these before editing.

- [ ] GAME-001.4 is DONE in authoritative docs/BACKLOG.md.
- [ ] GAME-001.4 implementation and evidence are readable.
- [ ] Existing question bank/session architecture is available.
- [ ] TypeScript/build/test environment is usable.
- [ ] No unresolved blocker prevents question-variety work.

If a precondition fails, stop and report the exact blocker.

## Inputs / Read First

**Required:**

- docs/AGENT_RULES.md
- docs/AGENT_RUNBOOK.md
- docs/BACKLOG.md
- docs/tasks/GAME-001.4.md
- docs/12-evidence/GAME-001.4.md

**Task-specific:**

- games/04-fraction-forge/session.ts
- games/04-fraction-forge/data/questions.ts
- games/04-fraction-forge/dom.ts
- games/04-fraction-forge/index.html
- relevant Fraction Forge tests
- package.json and TypeScript configuration

## Procedure

1. Verify GAME-001.4 is DONE and inspect the current question-bank/session flow.
2. Identify the narrowest boundary where question selection can be varied without changing semantic validation or scoring.
3. Implement controlled question selection using the existing question bank.
4. Ensure consecutive selection does not repeat the same question when at least two distinct questions are available.
5. Keep randomness injectable/controllable so tests do not depend on flaky random outcomes.
6. Add focused tests for normal selection, no-immediate-repeat behavior, deterministic control, and a one-question bank.
7. Verify existing semantic/session tests remain green and the UI still consumes the same question/session contract.
8. Run typecheck/build, focused tests, full test suite, self-check, and git diff --check.
9. Record exact results, acceptance mapping, and any limitations in evidence.
10. Stop at EVIDENCE_COMPLETE; DWB105 owns review and DONE.

## Constraints

- Preserve GAME-001.2 semantic validation and score semantics exactly.
- Preserve the existing session API unless a narrowly scoped compatible extension is required.
- Do not make tests depend on uncontrolled Math.random() outcomes.
- Do not silently expand the task into difficulty/progression or content-generation work.
- Do not perform unrelated refactors.
- Do not modify reviewer conclusions or claim DWB105 approval.

## Acceptance Criteria

- [ ] Questions are selected with variety from the existing question bank.
- [ ] The same question is not selected consecutively when at least two distinct questions are available.
- [ ] A one-question bank remains valid and continues to return that question.
- [ ] Randomness/selection can be controlled deterministically in tests.
- [ ] Existing question objects remain semantically valid under GAME-001.2.
- [ ] Existing answer validation and score behavior are unchanged.
- [ ] Existing Fraction Forge session/UI flow continues to work without a duplicated question-selection implementation in the DOM layer.
- [ ] Focused question-variety tests pass.
- [ ] Existing semantic and session tests pass.
- [ ] Typecheck/build, full test suite, self-check, and git diff --check pass.
- [ ] No excluded v0.1 systems are introduced.
- [ ] Evidence is complete and truthful.

## Verification

Run and record actual results:

```bash
tsc -b
node tests/fraction-forge.test.js
node tests/fraction-forge-session.test.js
pnpm test
node scripts/agent-self-check.mjs GAME-001.5
git diff --check
```

Also run the new focused question-variety test command if it is separate.

Expected result:

- Typecheck/build succeeds.
- Focused variety tests pass.
- Existing semantic/session tests pass.
- Full suite passes.
- Self-check passes.
- Diff check passes.
- UI remains driven by the existing session/semantic contract.

## Failure / Blocker Protocol

If a required step fails:

1. Capture the exact command and relevant error/output.
2. Determine whether the cause is task code, an existing issue, or environment/dependency.
3. Fix only if within this task's scope.
4. Otherwise stop and report BLOCKED or IMPLEMENTED; never claim DONE.

## Evidence Required

Update docs/12-evidence/GAME-001.5.md with:

- changed files
- exact commands executed
- actual verification results
- acceptance-criteria mapping
- question-selection behavior and deterministic test strategy
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

TASK: GAME-001.5
STATUS: <EVIDENCE_COMPLETE|BLOCKED>
SUMMARY: <short factual summary>
CHANGED:
- <implementation/test files>
- docs/12-evidence/GAME-001.5.md
VERIFICATION:
- <command> — PASS/FAIL
EVIDENCE:
- docs/12-evidence/GAME-001.5.md
BLOCKERS:
- <none or exact blocker>
FOLLOW-UP:
- DWB105 review
