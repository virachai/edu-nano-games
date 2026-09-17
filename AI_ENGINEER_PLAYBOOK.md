# AI Engineer Playbook

## Purpose

This project is designed to be developed as an **AI-native software project**: humans define intent, constraints, architecture, acceptance criteria, and judgment; coding agents perform bounded implementation work; evidence and review close the loop.

The goal is not to make agents autonomous at all costs. The goal is to make agent work **repeatable, inspectable, verifiable, and easy to hand off**.

## Core Mental Model

Think in terms of a software-production system rather than individual prompts:

```text
Human intent
    ↓
Problem framing
    ↓
Research / clarification
    ↓
Specification
    ↓
Task decomposition
    ↓
Agent execution
    ↓
Tests / validation
    ↓
Evidence
    ↓
Human review
    ↓
Release
    ↓
Feedback → improve the system
```

The human remains responsible for product intent, important trade-offs, acceptance criteria, and final judgment. Agents are execution partners, not unquestioned authorities.

## 1. Problem Framing Before Coding

Before asking an agent to implement something, establish:

- What problem are we solving?
- Who or what consumes the result?
- What is explicitly in scope?
- What is explicitly out of scope?
- What constraints must not be violated?
- What assumptions are uncertain?
- What observable result would prove success?

Prefer a precise task over a clever prompt.

## 2. Context Engineering

Agents perform better when project context is explicit and discoverable.

Important context includes:

- project purpose and architecture
- repository conventions
- current backlog and task status
- relevant specifications
- constraints and invariants
- commands for validation
- known evidence requirements
- prior decisions that should not be rediscovered

Keep context close to the work and maintain it as project documentation. Do not rely on chat history as the only source of truth.

## 3. Plan Before Implementation

For non-trivial work, use this progression:

```text
Idea
  → clarify
  → research
  → spec
  → task(s)
  → implement
  → validate
  → review
  → evidence
```

If implementation reveals a missing requirement, stop and update the specification/task rather than silently inventing product decisions.

## 4. Task Design for Coding Agents

A good agent task should be:

- bounded
- independently understandable
- explicit about relevant files or areas
- explicit about constraints
- testable
- small enough to review
- capable of producing evidence

A useful task contains:

```text
Objective
Context
Inputs
Constraints
Expected changes
Acceptance criteria
Validation commands
Evidence to capture
```

Avoid tasks such as "improve everything" or "refactor the project" unless they are first decomposed.

## 5. Agent Roles

Use agents according to their strengths instead of treating every model as the same worker.

Typical roles:

```text
Research agent   → gather facts / inspect docs / compare options
Planning agent   → turn intent into executable tasks
Coding agent     → implement bounded changes
Test agent       → validate behavior and find regressions
Review agent     → challenge implementation against spec
Evidence agent   → collect reproducible proof
```

One agent may perform multiple roles, but the **role and expected output should remain explicit**.

## 6. Human ↔ Agent Handoff Protocol

Every handoff should answer:

1. What are we trying to accomplish?
2. What has already been decided?
3. What should the agent inspect first?
4. What may the agent change?
5. What must it not change?
6. What commands should it run?
7. What evidence must it return?
8. What remains for human review?

A handoff is successful when another agent can continue without needing hidden conversational context.

## 7. Verification Over Vibes

Never treat "the code looks right" as sufficient evidence.

Use the strongest practical validation for the task:

- type checking
- unit/integration tests
- linting
- build/compile
- deterministic scripts
- rendered output inspection
- artifact existence and integrity checks
- targeted regression checks

Separate these concepts:

```text
Agent claim      ≠ evidence
Passing test     ≠ complete product validation
Generated output ≠ accepted output
```

## 8. Evidence as a First-Class Artifact

For meaningful work, record what was actually verified.

Evidence should answer:

- What was tested?
- With which command/input?
- What was the observed result?
- Which artifact or output proves it?
- When was it verified?
- Are there known limitations?

Prefer reproducible evidence over screenshots or narrative claims alone.

## 9. Review Loop

Review against the specification, not against personal intuition alone.

A review should check:

```text
Spec requirement
    ↓
Implementation
    ↓
Validation
    ↓
Evidence
```

Ask:

- Did we solve the requested problem?
- Did we accidentally expand scope?
- Are important assumptions documented?
- Are tests meaningful?
- Is there evidence for the acceptance criteria?
- Did the change introduce avoidable complexity or regression?

## 10. Agent Safety Boundaries

Agents may act autonomously only within explicit boundaries.

Before autonomous execution, define:

- allowed directories/files
- allowed commands
- expected duration/iteration limits
- stopping conditions
- validation requirements
- whether destructive operations are prohibited
- whether human approval is required before release

For long-running or unattended work, prefer sandboxed execution, bounded tasks, visible logs, and a final human review.

## 11. Keep the Repository Agent-Friendly

Prefer a repository that explains itself.

Useful project-level artifacts include:

```text
AGENT_RULES.md       → global working rules
BACKLOG.md           → current work queue
FLOW.md              → project workflow
INDEX.md             → documentation map

docs/tasks/          → executable task specifications
docs/evidence/       → verification records
```

Keep these documents concise, current, and linked to one another. Documentation is part of the agent interface.

## 12. Skills, Not Giant Prompts

When a process repeats, turn it into a reusable skill or documented procedure.

Examples:

```text
research
clarify
specify
decompose
implement
review
validate
capture-evidence
release
```

A skill should describe a small, repeatable operation with clear inputs and outputs. Avoid building one enormous prompt that tries to control every stage of the project.

## 13. Prefer Small Feedback Loops

For uncertain work:

```text
small change
  → validate
  → inspect result
  → adjust
```

is usually safer than:

```text
large change
  → large implementation
  → discover problems at the end
```

Agent speed makes iteration cheap; use that advantage.

## 14. Model-Agnostic Workflow

Do not design the project around one model's personality.

The durable interface is:

```text
specification
+ task
+ repository context
+ tools
+ acceptance criteria
+ evidence
```

Models can change as capabilities, cost, latency, and quotas change. The workflow should survive model replacement.

## 15. Definition of Done

A task is not done merely because an agent stopped producing output.

Default definition of done:

- implementation is complete for the stated scope
- acceptance criteria are addressed
- relevant validation has run
- results are reproducible where practical
- evidence is recorded
- known limitations are documented
- human review is complete when required
- backlog/task status is updated

## 16. Project Principle

> **Humans decide what matters. Agents accelerate how it gets done. Evidence determines whether it worked.**

This principle should guide new tooling, automation, agent prompts, skills, and project conventions.

## Practical Checklist

Before sending work to an agent:

- [ ] Is the problem clearly framed?
- [ ] Is the relevant context available?
- [ ] Is the scope bounded?
- [ ] Are constraints explicit?
- [ ] Are acceptance criteria observable?
- [ ] Is the task small enough to review?
- [ ] Is the validation method known?
- [ ] Is evidence expected?
- [ ] Are human approval points clear?

Before accepting agent work:

- [ ] Did it implement the requested scope?
- [ ] Did validation actually run?
- [ ] Do results support the acceptance criteria?
- [ ] Is there reproducible evidence?
- [ ] Are there regressions or unexplained changes?
- [ ] Is the documentation/backlog state current?

## Relationship to Existing Project Protocol

This playbook complements the project's existing `AGENT_RULES.md`, `BACKLOG.md`, task templates, evidence templates, `FLOW.md`, and `INDEX.md`.

When rules conflict, follow the more specific project rule and preserve the core principle of explicit intent, bounded execution, verification, evidence, and human review.
