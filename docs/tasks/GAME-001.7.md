# GAME-001.7 — Fraction Forge Answer Choice Randomization

**Status:** READY
**Priority:** P1
**Depends On:** GAME-001.6
**Owner:** Local Agent
**Created:** 2026-09-20
**Updated:** 2026-09-20
**Evidence:** docs/12-evidence/GAME-001.7.md

## Objective

Randomize the order of answer choices presented for each Fraction Forge question so players cannot infer the correct answer from a fixed position, while preserving the GAME-001.2 semantic contract, GAME-001.5 question randomization, and GAME-001.6 feedback behavior.

## Scope

### In Scope

- Shuffle the existing choices of each selected question at the session/content boundary.
- Use deterministic/injectable randomness so tests can force a known order.
- Preserve the exact choice values and exactly-one-correct-choice invariant.
- Preserve GAME-001.2 validation and scoring semantics.
- Preserve GAME-001.5 question selection/randomization and GAME-001.6 submitted-choice feedback.
- Do not mutate QUESTION_BANK or its question/choice arrays.
- Keep DOM rendering passive: `dom.ts` must consume the session question order and must not implement its own randomization.
- Add focused tests for deterministic shuffle, actual order variation, immutability, correct-answer preservation, and small-choice edge cases.

### Out of Scope

- New fraction mathematics, question generation, validation, scoring, or difficulty logic.
- Changing the question bank content.
- Timer, lives, leaderboard, accounts, persistence, progression, adaptive learning, multiplayer, backend, audio, analytics, telemetry, or external services.
- New frontend frameworks/build systems.
- Remotion as primary renderer.
- Complex animation, Canvas/WebGL, particles, or unrelated UI redesign.
- Deployment/release packaging.
- Unrelated refactors.
- Reviewer artifacts or DWB105 approval changes.

## Preconditions

- GAME-001.6 is DONE in authoritative `docs/BACKLOG.md`.
- GAME-001.6 implementation/evidence are readable.
- Current session/question-bank/UI architecture is available.
- TypeScript/build/test environment is usable.
- No unresolved blocker prevents this task.

## Inputs / Files to Read

- `docs/AGENT_RULES.md`
- `docs/AGENT_RUNBOOK.md`
- `docs/BACKLOG.md`
- `docs/tasks/GAME-001.6.md`
- `docs/12-evidence/GAME-001.6.md`
- `games/04-fraction-forge/game.ts`
- `games/04-fraction-forge/session.ts`
- `games/04-fraction-forge/data/questions.ts`
- `games/04-fraction-forge/dom.ts`
- `tests/fraction-forge.test.js`
- `tests/fraction-forge-session.test.js`
- package/TypeScript configuration

## Procedure

1. Verify GAME-001.6 is DONE and inspect the current question/choice/session flow.
2. Choose the narrowest session/content boundary for answer-order randomization.
3. Implement a small deterministic/injectable shuffle, preferably Fisher-Yates or equivalent, without mutating source arrays.
4. Apply the shuffle when a question enters the session, including the initial question and subsequent questions.
5. Preserve the question's source/target metadata and semantic meaning; only choice order may change.
6. Preserve `lastSubmitted`/feedback behavior from GAME-001.6.
7. Add focused tests for:
   - deterministic randomizer producing a known permutation;
   - a different randomizer producing a different order;
   - same choice set and exactly one correct answer after shuffling;
   - source QUESTION_BANK remains unchanged;
   - one/two-choice edge cases;
   - existing submit/score behavior still works;
   - advanceSession still preserves no-immediate-question-repeat.
8. Run typecheck/build, semantic/session tests, full suite, self-check, and git diff --check.
9. Record exact results, acceptance mapping, limitations, and reproduction steps in evidence.
10. Stop at EVIDENCE_COMPLETE; DWB105 owns review and DONE.

## Constraints

- Do not duplicate correctness/scoring logic.
- Do not randomize in the DOM layer.
- Do not mutate QUESTION_BANK, question objects, or their choices.
- Do not make tests depend on uncontrolled Math.random().
- Preserve existing public behavior except for intentional choice ordering.
- Preserve GAME-001.5 question selection semantics.
- Preserve GAME-001.6 `lastSubmitted` and feedback semantics.
- No unrelated refactors.
- Do not modify reviewer conclusions or claim DWB105 approval.

## Acceptance Criteria

- [ ] Answer choices are presented in randomized order for session questions.
- [ ] Initial and subsequent questions both receive shuffled choice order.
- [ ] Randomness is injectable/controllable for deterministic tests.
- [ ] The set and values of choices are unchanged by shuffling.
- [ ] Exactly one correct choice remains semantically correct after shuffling.
- [ ] QUESTION_BANK and its choice arrays are not mutated.
- [ ] One-choice and small-choice banks remain valid.
- [ ] Existing answer validation, score, `lastSubmitted`, and feedback behavior remain unchanged.
- [ ] Question randomization/no-immediate-repeat from GAME-001.5 remains intact.
- [ ] DOM contains no duplicated choice-randomization logic.
- [ ] Focused randomization tests pass.
- [ ] Semantic/session tests pass.
- [ ] Typecheck/build, full suite, self-check, and git diff --check pass.
- [ ] No excluded v0.1 systems are introduced.
- [ ] Evidence is complete and truthful.

## Verification

Run and record actual results:

```bash
npx tsc -b
node tests/fraction-forge.test.js
node tests/fraction-forge-session.test.js
pnpm test
node scripts/agent-self-check.mjs GAME-001.7
git diff --check
```

Also run any new focused choice-randomization test command if introduced.

Expected result:

- Typecheck/build succeeds.
- Semantic and session tests pass.
- New choice-randomization tests pass.
- Full suite passes.
- Self-check passes.
- Diff check passes.
- UI remains driven by session-provided choice order.

## Failure / Blocker Protocol

If verification fails:

1. Capture the exact command and relevant error/output.
2. Determine whether the cause is task code, existing issue, or environment/dependency.
3. Fix only within this task's scope when practical.
4. Otherwise stop and report BLOCKED or IMPLEMENTED; never claim DONE.

## Evidence Required

Update `docs/12-evidence/GAME-001.7.md` with:

- changed files
- exact commands and results
- acceptance-criteria mapping
- deterministic randomization strategy
- immutability and semantic-preservation notes
- known limitations/risks
- reproduction steps

Do not add reviewer conclusions; DWB105 adds them after handoff.

## Definition of Done

The local agent may report EVIDENCE_COMPLETE only when:

- implementation is complete;
- every acceptance criterion passes;
- required verification passes;
- evidence is complete and truthful;
- no unresolved in-scope blocker remains.

Local-agent completion is not reviewer approval.

## Final Handoff

TASK: GAME-001.7
STATUS: <EVIDENCE_COMPLETE|BLOCKED>
SUMMARY: <short factual summary>
CHANGED:
- <implementation/test files>
- docs/12-evidence/GAME-001.7.md
VERIFICATION:
- <command> — PASS/FAIL
EVIDENCE:
- docs/12-evidence/GAME-001.7.md
BLOCKERS:
- <none or exact blocker>
FOLLOW-UP:
- DWB105 review
