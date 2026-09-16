# Master Roadmap

## Mission

Build a deterministic educational content and nano-game platform where mathematical truth, game rules, visual rendering, and quality evidence remain independently testable.

## Phase 0 — Foundation

**Status:** established / hardening

- workspace/package boundaries
- Math Motion architecture adoption
- semantic engine boundary
- renderer boundary
- visual grammar foundation
- 6174 canonical concept
- gap analysis

**Exit evidence:** repository boundaries and contracts are documented and discoverable.

## Phase 1 — Verified Vertical Slice

**Status:** NOW

### MM-001 — 6174 Production Vertical Slice

- canonical concept → semantic execution
- canonical recipe generation
- deterministic compiler output
- Remotion scene compilation
- real render smoke test
- mathematical golden tests
- regression artifacts

**Exit evidence:** 6174 can be reproduced from source to render from a clean checkout.

## Phase 2 — Engineering Gates

**Status:** NEXT

- package-level build/test commands
- root workspace integration
- schema/version validation
- CI quality gates
- deterministic regression checks
- render QA policy

**Exit evidence:** CI rejects contract, semantic, compiler, and build regressions.

## Phase 3 — Reuse Proof

**Status:** NEXT

- second Math Motion concept
- reuse existing semantic operations
- reuse visual grammar
- prove renderer independence

**Exit evidence:** a new concept can be added without modifying the core renderer for concept-specific logic.

## Phase 4 — Complete Nano-Game

**Status:** LATER

- choose one existing game
- implement complete gameplay loop
- content contract
- scoring/progression
- accessibility
- persistence where required
- automated regression
- production artifact

**Exit evidence:** one nano-game is complete and independently releasable.

## Phase 5 — Scale

**Status:** LATER

- concept/content expansion
- additional games
- deployment automation
- operational observability
- release management
- performance and accessibility certification

## Explicitly Deferred

Do not introduce database, queue, cloud-worker, SaaS, analytics-platform, or broad orchestration infrastructure until a concrete product requirement requires it.

## Roadmap Rule

Prefer one fully verified vertical slice over many partially implemented features. Architecture changes must be justified by a concrete boundary, test, or product requirement.
