# Backlog Protocol

**Version:** 1.0  
**Status:** Active protocol  
**Purpose:** Agent-readable execution queue for the workspace

## 1. Purpose

`docs/BACKLOG.md` is the coordination layer between project planning and local execution agents.

It answers four questions:

1. What work exists?
2. What can be executed now?
3. What is blocked or dependent on other work?
4. What has been verified and completed?

Detailed implementation instructions belong in `docs/tasks/<TASK-ID>.md`. The backlog is the index and state machine, not a replacement for task specifications.

## 2. Task States

Use only these states unless this protocol is explicitly revised:

```text
PLANNED
READY
IN_PROGRESS
IMPLEMENTED
VERIFIED
EVIDENCE_COMPLETE
DONE
BLOCKED
CANCELLED
```

### State meanings

- `PLANNED` — identified but not yet executable.
- `READY` — dependencies and instructions are sufficient for an agent to execute.
- `IN_PROGRESS` — an agent has started work.
- `IMPLEMENTED` — implementation exists; required verification is not yet complete.
- `VERIFIED` — acceptance checks have passed.
- `EVIDENCE_COMPLETE` — required evidence has been recorded.
- `DONE` — implementation, verification, and evidence are complete.
- `BLOCKED` — execution cannot continue because a dependency, decision, environment, or external requirement is missing.
- `CANCELLED` — intentionally removed from the active plan.

## 3. Task Readiness

A task may be `READY` only when:

- a unique task ID exists
- the task file exists under `docs/tasks/`
- objective and scope are clear
- dependencies are known
- acceptance criteria are defined
- required verification is defined or explicitly not applicable
- no unresolved blocker prevents execution

## 4. Task Record Format

Use one row per task in the active backlog table:

| ID       | Status | Priority | Depends On | Task Spec           | Summary | Owner | Evidence                  |
| -------- | ------ | -------- | ---------- | ------------------- | ------- | ----- | ------------------------- |
| MM-001.1 | DONE   | P0       | —          | `tasks/MM-001.1.md` | Spec    | —     | `12-evidence/MM-001.1.md` |

### Field rules

- **ID:** stable unique identifier; never reuse an ID.
- **Status:** one of the protocol states.
- **Priority:** use `P0`, `P1`, `P2`, or `P3`.
- **Depends On:** task IDs separated by commas, or `—`.
- **Task Spec:** relative path to the authoritative task document.
- **Summary:** concise description only.
- **Owner:** agent/human identifier when useful; `—` if unassigned.
- **Evidence:** relative evidence path when available; `—` otherwise.

## 5. Dependency Rules

A task must not move to `READY` if a required dependency is not complete.

Default rule:

```text
Dependency DONE → dependent task may become READY
```

If a dependency is intentionally waived, record the authorization and reason in the task specification.

## 6. Agent Selection Rule

When an agent is instructed to work from the backlog, it should:

1. Read `docs/AGENT_RULES.md`.
2. Read this file.
3. Find tasks with `Status = READY`.
4. Check dependency fields against current states.
5. Select an executable task.
6. Read its task specification.
7. Execute and verify it.
8. Update task state and evidence.

Agents must not arbitrarily select `PLANNED` tasks when `READY` tasks exist unless explicitly instructed.

## 7. Ordering

Unless a task specification says otherwise, select work using:

1. executable dependency chain
2. lower priority number (`P0` before `P1`)
3. earlier appearance in the backlog

This is an execution ordering rule, not a product-value ranking.

## 8. Updating State

State transitions should reflect evidence:

```text
PLANNED → READY
READY → IN_PROGRESS
IN_PROGRESS → IMPLEMENTED
IMPLEMENTED → VERIFIED
VERIFIED → EVIDENCE_COMPLETE
EVIDENCE_COMPLETE → DONE
```

A failed verification may return a task from `IMPLEMENTED` or `VERIFIED` to `IN_PROGRESS`.

A missing dependency or environment issue should use `BLOCKED` rather than pretending the task is complete.

## 9. Completion Rule

A task can be `DONE` only when:

- implementation is present
- acceptance criteria pass
- required verification passes
- required evidence exists
- no known in-scope blocker remains

## 10. Backlog Hygiene

Keep the backlog concise and machine-readable.

Do:

- use stable IDs
- link to task specs
- keep status current
- record blockers
- archive or mark cancelled work explicitly

Do not:

- put long implementation instructions into the backlog
- duplicate the full task specification
- mark work DONE without evidence
- delete historical task IDs
- silently change the meaning of an existing ID

## 11. Task Specification Contract

Every task referenced by this backlog should eventually have a file with this conceptual structure:

```md
# <TASK-ID> — <Title>

## Objective

## Scope

## Dependencies

## Inputs / Files to Read

## Agent Instructions

## Constraints

## Acceptance Criteria

## Verification

## Evidence Required

## Completion
```

The task file is the detailed execution contract. If it conflicts with a stale backlog summary, the detailed task specification should be reviewed and the backlog corrected rather than silently choosing one.

## 12. Evidence Contract

When a task reaches `DONE`, the Evidence column should point to a durable evidence record when the project workflow requires one.

Recommended evidence structure:

```md
# Evidence — <TASK-ID>

## Result

## Changed Files

## Commands

## Verification

## Artifacts

## Notes / Risks
```

## 13. Current MM-001 Pipeline

The current known milestone chain is:

```text
MM-001.1 Spec
    ↓
MM-001.2 Semantic Execution
    ↓
MM-001.3 Canonical Recipe
    ↓
MM-001.4 Remotion Compilation
    ↓
MM-001.5 Real Render
    ↓
MM-001.6 Release Evidence
```

The exact current state of each task must be kept in the active task records rather than inferred from this diagram.

## 14. Active Backlog

> This section is the authoritative task table. States below are reconciled against the current repository state on 2026-09-17.

| ID       | Status | Priority | Depends On | Task Spec                        | Summary                                                                       | Owner | Evidence                               |
| -------- | ------ | -------- | ---------- | -------------------------------- | ----------------------------------------------------------------------------- | ----- | -------------------------------------- |
| MM-001.1 | DONE   | P0       | —          | `tasks/MM-001.1.md`              | Spec                                                                          | —     | —                                      |
| MM-001.2 | DONE   | P0       | MM-001.1   | `tasks/MM-001.2.md`              | Semantic Execution                                                            | —     | —                                      |
| MM-001.3 | DONE   | P0       | MM-001.2   | `tasks/MM-001.3.md`              | Canonical Recipe                                                              | —     | —                                      |
| MM-001.4 | DONE   | P0       | MM-001.3   | `tasks/MM-001.4.md`              | Remotion Compilation                                                          | —     | —                                      |
| MM-001.5 | DONE   | P0       | MM-001.4   | `tasks/MM-001.5.md`              | Real Render; verified real Remotion render artifact produced                  | —     | `12-evidence/MM-001.5.md`              |
| MM-001.6 | DONE   | P0       | MM-001.5   | `tasks/MM-001.6.md`              | Release Evidence; assembled durable release evidence and DoD sign-off         | —     | `12-evidence/MM-001.6.md`              |
| MM-001-R | DONE   | P0       | MM-001.6   | `tasks/MM-001-reconciliation.md` | Workspace reconciliation and MM-001 documentation cleanup before NEXT handoff | —     | `12-evidence/MM-001-reconciliation.md` |
| WS-001   | DONE   | P0       | MM-001-R   | `tasks/WS-001.md`                | Integrate packages/* into workspace build/typecheck/test gates                | —     | `12-evidence/WS-001.md`                |

## 15. Protocol Extension

When a new workflow requirement appears, update this protocol deliberately and increment the version. Do not create agent-specific exceptions in prompts when the rule should apply to the whole workspace.
