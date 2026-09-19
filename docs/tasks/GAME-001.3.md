# GAME-001.3 — Fraction Forge Browser UI

**Status:** READY  
**Priority:** P1  
**Depends On:** GAME-001.2  
**Owner:** Local Agent  
**Created:** 2026-09-19  
**Updated:** 2026-09-19  
**Evidence:** docs/12-evidence/GAME-001.3.md

## Objective

Implement the minimal browser UI that makes Fraction Forge v0.1 playable in a browser, using the semantic contract from GAME-001.2 as the source of truth for question validation and scoring.

## Scope

### In Scope

- Create the browser entry page at the repository-appropriate location, including index.html if that is the project convention.
- Render the current fraction question and target denominator.
- Render a finite set of answer choices as interactive controls.
- Use GAME-001.2 semantic logic for answer validation and score updates; do not duplicate mathematical rules in UI code.
- Show immediate correct/incorrect feedback after an answer.
- Show the current session score.
- Provide a Next Question action that advances the session without requiring persistence.
- Add focused browser/UI tests using the repository's existing test conventions where available.
- Keep the implementation small, accessible, and framework-compatible with the existing workspace.

### Out of Scope

- Timer, lives, leaderboard, accounts, persistence, progression systems, multiplayer, backend, or audio.
- Complex animation or procedural visual effects.
- Remotion as the primary game renderer.
- Production deployment or release packaging.
- Authentication, analytics, telemetry, or external services.
- Unrelated refactors or changes to the semantic contract of GAME-001.2.
- Reviewer artifacts or DWB105 approval changes.

## Preconditions

The agent must confirm these before editing.

- [ ] GAME-001.2 is DONE in authoritative docs/BACKLOG.md.
- [ ] docs/tasks/GAME-001.2.md and its evidence are readable.
- [ ] docs/AGENT_RULES.md, docs/AGENT_RUNBOOK.md, and docs/BACKLOG.md are available.
- [ ] Existing frontend/build/test conventions are available and usable.
- [ ] No unresolved blocker prevents browser UI implementation.

If a precondition fails, stop and report the exact blocker.

## Inputs / Read First

**Required:**

- docs/AGENT_RULES.md
- docs/AGENT_RUNBOOK.md
- docs/BACKLOG.md
- docs/tasks/TASK_TEMPLATE.md
- docs/tasks/GAME-001.2.md
- docs/12-evidence/GAME-001.2.md

**Task-specific:**

- Existing package scripts and TypeScript configuration.
- Existing game/source/test structure.
- Existing browser entry conventions, if any.

## Procedure

1. Inspect the repository and verify GAME-001.2 is DONE.
2. Identify the smallest existing browser entry/build convention; do not introduce a new framework unless required by the repository.
3. Implement the Fraction Forge v0.1 playable UI.
4. Import and use the semantic model from GAME-001.2 for validation and score semantics.
5. Add focused UI/browser tests appropriate to the existing toolchain.
6. Run build/typecheck, focused tests, full relevant suite, and git diff --check.
7. Run the agent self-check if available.
8. Record truthful evidence in docs/12-evidence/GAME-001.3.md.
9. Stop at EVIDENCE_COMPLETE; DWB105 owns review and the DONE transition.

## UI Contract

The v0.1 screen must make the core loop observable:

1. Present a source fraction and target denominator.
2. Present answer choices.
3. Let the player select one answer.
4. Validate the selection through GAME-001.2 semantics.
5. Immediately show whether the answer is correct or incorrect.
6. Update the session score by the semantic score delta.
7. Allow the player to request the next question.

The UI may choose its own simple visual treatment, but it must not add excluded gameplay systems.

## Acceptance Criteria

- [ ] A browser entry page exists and can be opened/built using the repository's documented frontend convention.
- [ ] The source fraction and target denominator are visible.
- [ ] Answer choices are visible and interactive.
- [ ] Selecting an answer uses GAME-001.2 validation rather than duplicated fraction math.
- [ ] Immediate correct/incorrect feedback is visible.
- [ ] Correct answers increase the session score by 1; incorrect answers increase it by 0.
- [ ] Next Question advances the playable loop without persistence.
- [ ] Focused UI tests cover the core interaction and score/feedback behavior where the repository toolchain permits.
- [ ] Existing build/typecheck/test checks remain passing.
- [ ] No excluded v0.1 feature is introduced.
- [ ] Evidence is complete and truthful.

## Verification

Run the repository-appropriate checks and record actual results in the evidence file.

At minimum, run:

    tsc -b
    node tests/fraction-forge.test.js
    pnpm test
    git diff --check
    node scripts/agent-self-check.mjs GAME-001.3

Also run the repository-appropriate browser/UI-focused test command and build command if they are separate from the commands above.

Expected result:

- UI-focused tests pass.
- Typecheck/build passes.
- Existing relevant tests remain passing.
- git diff --check passes.
- Agent self-check passes when available.

## Failure / Blocker Protocol

If a required step or check fails:

1. Capture the exact command and relevant error/output.
2. Determine whether the cause is task code, an existing issue, or environment/dependency.
3. Fix only if the fix remains inside this task's scope.
4. Otherwise stop and report BLOCKED or IMPLEMENTED; do not claim DONE.

## Evidence Required

Update docs/12-evidence/GAME-001.3.md with:

- changed files
- exact commands executed
- actual verification results
- acceptance-criteria mapping
- browser/build/runtime artifacts, if any
- known limitations/risks
- reproduction steps

Do not add reviewer conclusions to the evidence record; DWB105 adds review after local-agent handoff.

## Definition of Done

The local agent may report EVIDENCE_COMPLETE only when:

- [ ] browser UI implementation is complete
- [ ] every acceptance criterion passes
- [ ] required verification passes
- [ ] evidence is complete and truthful
- [ ] no unresolved in-scope blocker remains

Important: Local-agent completion is not reviewer approval. DWB105 reviews the evidence before the task is accepted as DONE.

## Final Handoff

TASK: GAME-001.3
STATUS: <EVIDENCE_COMPLETE|BLOCKED>
SUMMARY: <short factual summary>
CHANGED:
- <implementation files>
- <test files>
- docs/12-evidence/GAME-001.3.md
VERIFICATION:
- <command> — PASS/FAIL
EVIDENCE:
- docs/12-evidence/GAME-001.3.md
BLOCKERS:
- <none or exact blocker>
FOLLOW-UP:
- DWB105 review
