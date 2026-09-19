# GAME-001.1 — Fraction Forge v0.1 Specification

**Status:** READY  
**Priority:** P1  
**Depends On:** —  
**Owner:** Local Agent  
**Created:** 2026-09-19  
**Updated:** 2026-09-19  
**Evidence:** `docs/12-evidence/GAME-001.1.md`

## Objective

Define the authoritative v0.1 product and gameplay specification for Fraction Forge, a small browser game that teaches equivalent fractions.

This task is specification-only. It must establish a precise implementation contract for later tasks without implementing the game.

## Scope

### In Scope

- Define the v0.1 gameplay loop: source fraction → target denominator → answer choices → validation → immediate feedback → session score → next question.
- Define the mathematical concept being taught: equivalent fractions.
- Define the minimum question/state model needed by later semantic implementation work.
- Define correct-answer and incorrect-answer behavior at the product level.
- Define the minimum session scoring behavior.
- Define browser-game boundaries and renderer independence for the semantic rules.
- Define acceptance criteria and verification for this specification task.

### Out of Scope

- Game implementation code.
- Browser UI implementation.
- Timer or countdown mechanics.
- Lives/health systems.
- Leaderboards, accounts, persistence, or progression systems.
- Multiplayer or backend services.
- Audio.
- Complex animation or procedural visual effects.
- Remotion as the primary game renderer.
- Production deployment or release packaging.

## Preconditions

The agent must confirm these before editing.

- [ ] Workspace is at the clean pre-GAME-001 baseline or an explicitly authorized equivalent.
- [ ] `docs/BACKLOG.md` exists and is the authoritative task-state source.
- [ ] `docs/tasks/TASK_TEMPLATE.md` and agent workflow rules are available.
- [ ] No unresolved blocker prevents writing the specification.

If a precondition fails, stop and report the exact blocker unless the task explicitly defines a recovery step.

## Inputs / Read First

**Required:**

- `docs/AGENT_RULES.md`
- `docs/AGENT_RUNBOOK.md`
- `docs/BACKLOG.md`
- `docs/tasks/TASK_TEMPLATE.md`

**Task-specific context:**

- Existing Fraction Forge project memory/context, if available.
- Existing repository package/test conventions relevant to later implementation, without modifying them.

## Procedure

1. Inspect the repository and current workflow contracts.
2. Write the authoritative Fraction Forge v0.1 specification in this task file.
3. Ensure the specification is internally consistent and bounded to the stated scope.
4. Update `docs/BACKLOG.md` so `GAME-001.1` is `READY` and points to this task spec and evidence path.
5. Do not create implementation code or reviewer artifacts.
6. Run the verification checks below.
7. Record truthful evidence in `docs/12-evidence/GAME-001.1.md`.
8. Stop at `EVIDENCE_COMPLETE`; DWB105 owns review and the `DONE` transition.

## Product Contract

### Core Learning Goal

The player practices recognizing and generating equivalent fractions by converting a source fraction to a requested denominator and selecting the matching numerator/denominator pair.

### Core Question Flow

Each question provides:

1. a valid source fraction `a/b`, where `b > 0`;
2. a target denominator that is a positive integer multiple of `b`;
3. a finite set of answer choices containing exactly one mathematically correct target fraction and one or more incorrect alternatives.

For multiplier `k = targetDenominator / b`, the correct numerator is `a × k`.

A submitted answer is correct only when both numerator and denominator match the expected target fraction. Matching a numerator while using the wrong denominator is incorrect.

### Feedback

- Correct answer: immediately communicate success and the achieved result.
- Incorrect answer: immediately communicate that the selected answer is incorrect and preserve the question state sufficiently for the next defined action.
- Feedback must be deterministic from the semantic question and submitted answer.

### Session Score

The v0.1 session score increments by one for each correctly answered question. Incorrect answers do not increment the score. The specification does not require persistence across sessions.

### Next Question

After the question outcome is resolved, the player can advance to the next question. Question generation/selection mechanics are delegated to later implementation tasks; this task only defines the required semantic contract.

## Implementation Boundary

Later tasks must keep mathematical state and validation independent from browser rendering. UI code may render the state and feedback but must not redefine the equivalent-fraction rules.

The v0.1 implementation should remain a small browser game and should not introduce excluded systems unless a new explicitly approved task changes the scope.

## Acceptance Criteria

- [ ] The specification defines the v0.1 learning goal and complete core gameplay loop.
- [ ] The source fraction, target denominator, multiplier, correct numerator, and answer-choice requirements are unambiguous.
- [ ] Correctness requires both numerator and denominator equality with the expected target fraction.
- [ ] Correct and incorrect feedback behavior is defined.
- [ ] Session scoring behavior is defined without persistence requirements.
- [ ] The implementation boundary separates semantic rules from browser rendering.
- [ ] Explicit out-of-scope features prevent scope creep.
- [ ] The task contains verification, evidence, and completion rules consistent with the workspace protocol.

## Verification

Run the exact checks below and record actual results in the evidence file.

```bash
git diff --check -- docs/tasks/GAME-001.1.md docs/BACKLOG.md docs/12-evidence/GAME-001.1.md
node -e "const fs=require('fs'); const p='docs/tasks/GAME-001.1.md'; const s=fs.readFileSync(p,'utf8'); for (const x of ['Core Learning Goal','Core Question Flow','Feedback','Session Score','Implementation Boundary','Acceptance Criteria']) if(!s.includes(x)) throw new Error('missing section: '+x); console.log('GAME-001.1 spec check: PASS')"
```

Expected result:

- Both commands exit successfully.
- The specification contains every required contract section.
- No implementation files are changed by this task.

## Failure / Blocker Protocol

If a required step or check fails:

1. Capture the exact command and relevant error/output.
2. Determine whether the cause is task code, an existing issue, or environment/dependency.
3. Fix only if the fix remains inside this task's specification scope.
4. Otherwise stop and report `BLOCKED` or `IMPLEMENTED`; do not claim `DONE`.

## Evidence Required

Update `docs/12-evidence/GAME-001.1.md` with:

- changed files
- exact commands executed
- actual verification results
- acceptance-criteria mapping
- generated/runtime artifacts, if any
- known limitations/risks
- reproduction steps

## Definition of Done

The local agent may report `EVIDENCE_COMPLETE` only when:

- [ ] specification is complete
- [ ] every acceptance criterion passes
- [ ] required verification passes
- [ ] evidence is complete and truthful
- [ ] no unresolved in-scope blocker remains

**Important:** Local-agent completion is not reviewer approval. DWB105 reviews the evidence before the task is accepted as `DONE`.

## Final Handoff

```text
TASK: GAME-001.1
STATUS: <EVIDENCE_COMPLETE|BLOCKED>
SUMMARY: <short factual summary>
CHANGED:
- docs/tasks/GAME-001.1.md
- docs/BACKLOG.md
- docs/12-evidence/GAME-001.1.md
VERIFICATION:
- git diff --check -- docs/tasks/GAME-001.1.md docs/BACKLOG.md docs/12-evidence/GAME-001.1.md — PASS/FAIL
- node -e "..." — PASS/FAIL
EVIDENCE:
- docs/12-evidence/GAME-001.1.md
BLOCKERS:
- <none or exact blocker>
FOLLOW-UP:
- DWB105 review
```
