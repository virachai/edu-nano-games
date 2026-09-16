# Agent Rules

**Version:** 1.0  
**Status:** Active protocol  
**Audience:** Gemini, Codex, Claude, and other local execution agents

## 1. Purpose

This document defines the common operating contract for local AI agents working in this repository.

The repository documentation is the task contract. Agents must not depend on an ad-hoc chat prompt for requirements that should exist in workspace docs.

## 2. Source-of-Truth Order

When information conflicts, use this precedence:

1. Explicit user instruction in the current task.
2. Repository source code and tests.
3. Task specification in `docs/tasks/`.
4. `docs/BACKLOG.md` and project architecture/spec documents.
5. Other documentation and historical session notes.
6. Agent assumptions.

Never replace repository evidence with an assumption.

## 3. Before Starting Work

For every task:

1. Read `docs/INDEX.md` if present.
2. Read `docs/FLOW.md` if relevant.
3. Read this file.
4. Read `docs/BACKLOG.md`.
5. Read the specific task file under `docs/tasks/`.
6. Inspect the relevant source, tests, and existing artifacts before editing.
7. Check dependencies and task status.

If the task is not `READY`, do not start implementation unless the current user explicitly authorizes it.

## 4. Scope Discipline

Agents must:

- Implement only the requested task scope.
- Preserve existing public contracts unless the task explicitly changes them.
- Avoid unrelated refactors.
- Avoid changing architecture merely because another approach looks cleaner.
- Record required follow-up work as a new task instead of silently expanding scope.

If a required dependency is missing, stop and report the blocker rather than inventing an implementation.

## 5. Editing Rules

Before modifying a file:

- Understand the relevant code path.
- Prefer small, targeted changes.
- Preserve formatting and project conventions.
- Do not overwrite unrelated work.
- Do not remove existing functionality without explicit authorization.

When generated artifacts are involved, follow the canonical generation path documented by the project instead of hand-editing generated output.

## 6. Verification

Implementation is not completion.

After making changes, run the task's required verification commands. Depending on the task, this may include:

- unit/integration tests
- type checking
- linting
- build/compile
- semantic validation
- canonical recipe validation
- Remotion compilation
- real rendering
- artifact inspection

Use the exact commands documented by the task whenever available.

## 7. Completion States

Agents must distinguish these states:

- `IN_PROGRESS` — work is actively being performed.
- `IMPLEMENTED` — implementation exists, but required verification/evidence is incomplete.
- `VERIFIED` — acceptance checks passed.
- `EVIDENCE_COMPLETE` — required proof has been recorded.
- `DONE` — all acceptance criteria, verification, and evidence requirements are satisfied.

Do not mark a task `DONE` just because the code compiles.

## 8. Evidence Requirements

For completed work, record enough evidence for another reviewer to reproduce the conclusion.

At minimum, evidence should identify:

- task ID
- changed files
- commands executed
- verification result
- relevant artifact paths
- known limitations or remaining risks

Use `docs/evidence/` when that directory exists or when the task requires a dedicated evidence report.

## 9. Failure and Blocker Protocol

If verification fails:

1. Do not hide or downgrade the failure.
2. Capture the failing command and relevant error.
3. Determine whether the failure is caused by the task changes, an existing issue, or an environment/dependency problem.
4. Fix only within task scope when practical.
5. Otherwise leave the task non-DONE and report the blocker clearly.

If a task depends on another incomplete task, do not bypass the dependency without explicit authorization.

## 10. Git / Workspace Safety

Agents must not:

- discard unrelated user changes
- reset or force-rewrite repository history without explicit authorization
- delete valuable artifacts merely to make tests pass
- commit changes unless the task explicitly asks for a commit

Preserve work produced by other agents.

## 11. Documentation Updates

When a task changes behavior, interfaces, workflow, or architecture, update the relevant documentation if the task requires it.

Do not rewrite project documentation speculatively. Documentation changes should describe verified repository state.

## 12. Handoff Format

At the end of an execution attempt, report:

```text
TASK: <task-id>
STATUS: <IN_PROGRESS|IMPLEMENTED|VERIFIED|EVIDENCE_COMPLETE|DONE|BLOCKED>
SUMMARY: <short summary>
CHANGED:
- <file>
- <file>
VERIFICATION:
- <command> — PASS/FAIL
EVIDENCE:
- <path or reference>
BLOCKERS:
- <none or blocker>
FOLLOW-UP:
- <none or task-id/recommended action>
```

The same information should be reflected in the task/backlog state when the protocol permits direct updates.

## 13. Stop Conditions

Stop and report instead of guessing when:

- requirements conflict
- a required file or dependency is missing
- acceptance criteria are ambiguous in a way that changes implementation behavior
- an external service/credential is required but unavailable
- a destructive operation is necessary but not authorized
- verification cannot be completed

## 14. Agent Independence

An agent should be able to continue from repository state alone.

Do not rely on hidden context from a previous agent run. Write important decisions, blockers, and evidence into the workspace.

## 15. Minimal Prompt Principle

The preferred invocation is a short command such as:

```bash
gemini -m gemini-3.5-flash-lite -p "อ่าน docs/BACKLOG.md แล้วทำ task ที่ READY ตาม AGENT_RULES.md ให้เสร็จ ตรวจสอบและบันทึก evidence" 2>/dev/null
```

The prompt is a trigger, not the specification. The repository documents are the specification.
