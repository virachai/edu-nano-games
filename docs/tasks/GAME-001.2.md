# GAME-001.2 — Fraction Forge Semantic Question Model

**Status:** READY  
**Priority:** P1  
**Depends On:** GAME-001.1  
**Owner:** Local Agent  
**Created:** 2026-09-19  
**Updated:** 2026-09-19  
**Evidence:** docs/12-evidence/GAME-001.2.md

## Objective

Implement the framework-independent semantic question model and answer-validation logic for Fraction Forge v0.1.

This task establishes the mathematical state and deterministic validation contract defined by GAME-001.1. It must not implement browser UI or renderer-specific behavior.

## Scope

### In Scope

- Define a small semantic question representation for source fraction, target denominator, and answer choices.
- Implement deterministic derivation of the expected equivalent fraction.
- Implement answer validation requiring both numerator and denominator equality.
- Implement deterministic question-outcome/score semantics needed by later UI work.
- Add focused automated tests for valid and invalid cases.
- Keep semantic rules independent of browser rendering.

### Out of Scope

- Browser UI or styling.
- React/browser component work unless strictly required by existing project structure for importing the semantic module.
- Timer, lives, leaderboard, accounts, persistence, progression, multiplayer, backend, or audio.
- Complex animation or procedural visual effects.
- Remotion as the primary game renderer.
- Production deployment or release packaging.
- Random question generation beyond the minimum deterministic model needed for tests.
- Reviewer artifacts or DWB105 approval changes.

## Preconditions

The agent must confirm these before editing.

- [ ] GAME-001.1 is DONE in the authoritative docs/BACKLOG.md.
- [ ] The GAME-001.1 specification exists and is readable.
- [ ] docs/AGENT_RULES.md, docs/AGENT_RUNBOOK.md, and docs/BACKLOG.md are available.
- [ ] Existing package/test conventions needed for implementation are available.
- [ ] No unresolved blocker prevents implementing the semantic model.

If a precondition fails, stop and report the exact blocker.

## Inputs / Read First

**Required:**

- docs/AGENT_RULES.md
- docs/AGENT_RUNBOOK.md
- docs/BACKLOG.md
- docs/tasks/TASK_TEMPLATE.md
- docs/tasks/GAME-001.1.md

**Task-specific context:**

- Existing source/test structure and package scripts.
- Existing Fraction Forge project memory/context, if available.

## Procedure

1. Inspect the repository and verify GAME-001.1 is DONE.
2. Identify the smallest appropriate source/test location for framework-independent semantic logic.
3. Implement the semantic question model and deterministic equivalent-fraction calculation.
4. Implement answer validation with exact numerator-and-denominator matching.
5. Implement only the semantic outcome/score behavior required by GAME-001.1.
6. Add focused tests covering valid conversion, invalid answers, denominator mismatch, and relevant input invariants.
7. Run the verification commands below and the relevant existing test suite.
8. Run the agent self-check if the repository provides the agent:self-check command; if unavailable, record that limitation truthfully.
9. Record truthful evidence in docs/12-evidence/GAME-001.2.md.
10. Stop at EVIDENCE_COMPLETE; DWB105 owns review and the DONE transition.

## Semantic Contract

### Question State

A semantic question contains:

- source numerator a
- source denominator b, where b > 0
- target denominator d, where d > 0 and d is a positive integer multiple of b
- a finite answer-choice set
- exactly one expected target fraction

For multiplier k = d / b, the expected numerator is a × k.

### Validation

Given submitted numerator n and denominator dSubmitted, the answer is correct iff:

- n === expectedNumerator, and
- dSubmitted === targetDenominator.

A numerator match with a denominator mismatch is incorrect.

### Outcome and Score

The semantic result must distinguish at least:

- correct answer
- incorrect answer

A correct answer contributes 1 to session score; an incorrect answer contributes 0.

The semantic layer must not own persistence, UI messaging, animation, or rendering.

## Acceptance Criteria

- [ ] A framework-independent semantic question representation exists in an appropriate source location.
- [ ] Expected equivalent-fraction numerator is derived deterministically from source and target denominators.
- [ ] Target denominator validity is enforced according to GAME-001.1.
- [ ] Answer validation requires both numerator and denominator equality.
- [ ] Correct and incorrect outcomes are deterministic.
- [ ] Score contribution follows the GAME-001.1 contract.
- [ ] Focused automated tests cover correct conversion and meaningful invalid-answer cases, including denominator mismatch.
- [ ] Semantic code has no dependency on browser rendering or UI state.
- [ ] Verification and evidence are complete and truthful.
- [ ] No excluded v0.1 features are introduced.

## Verification

Run the repository-appropriate checks and record actual results in the evidence file.

At minimum:

git diff --check

Run the focused semantic tests and the relevant existing test suite using the repository's documented package/test command. If a package manager or self-check command is unavailable, record the exact limitation rather than inventing a result.

Expected result:

- Semantic tests pass.
- Existing relevant tests remain passing.
- No whitespace errors are reported.
- No browser-rendering dependency is introduced into the semantic layer.

## Failure / Blocker Protocol

If a required step or check fails:

1. Capture the exact command and relevant error/output.
2. Determine whether the cause is task code, an existing issue, or environment/dependency.
3. Fix only if the fix remains inside this task's scope.
4. Otherwise stop and report BLOCKED or IMPLEMENTED; do not claim DONE.

## Evidence Required

Update docs/12-evidence/GAME-001.2.md with:

- changed files
- exact commands executed
- actual verification results
- acceptance-criteria mapping
- generated/runtime artifacts, if any
- known limitations/risks
- reproduction steps

Do not add reviewer conclusions to the evidence record; DWB105 adds review after local-agent handoff.

## Definition of Done

The local agent may report EVIDENCE_COMPLETE only when:

- [ ] semantic implementation is complete
- [ ] every acceptance criterion passes
- [ ] required verification passes
- [ ] evidence is complete and truthful
- [ ] no unresolved in-scope blocker remains

**Important:** Local-agent completion is not reviewer approval. DWB105 reviews the evidence before the task is accepted as DONE.

## Final Handoff

TASK: GAME-001.2
STATUS: <EVIDENCE_COMPLETE|BLOCKED>
SUMMARY: <short factual summary>
CHANGED:
- <implementation files>
- <test files>
- docs/12-evidence/GAME-001.2.md
VERIFICATION:
- <command> — PASS/FAIL
EVIDENCE:
- docs/12-evidence/GAME-001.2.md
BLOCKERS:
- <none or exact blocker>
FOLLOW-UP:
- DWB105 review
