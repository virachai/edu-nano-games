# 08-02-documentation-gap.md

## Documentation Gap Analysis: What Docs Are Actually Needed

An audit of the project's documentation against what an open-source educational web project **necessarily** requires — and what the current `docs/` tree gets right, wrong, and over-built. Research basis: Open Source Guides (opensource.guide) launch checklist, GitHub community-health-file conventions, the FTC COPPA Rule (amended April 2025), and Thailand's PDPA.

---

## 1. Research Baseline: Docs Every Project Needs

Open Source Guides is explicit that every launched open-source project should include:

1. **LICENSE** — the single document that makes the project legally open source; protects both users and the author.
2. **README** — what the project does, why it matters, how to get started, where to get help.
3. **CONTRIBUTING** — how to file bugs, suggest features, set up the environment, run tests.
4. **CODE_OF_CONDUCT** — community behavior expectations (Contributor Covenant is the drop-in standard).

Security practice guidance (GitGuardian, etc.) adds **SECURITY.md** — how to report vulnerabilities and what's in/out of scope.

For this specific project, two more docs are **necessary**, not optional:

5. **Privacy statement (no-data-collection)** — COPPA (amended Apr 2025) applies to child-directed services **that collect personal information**. Persistent identifiers from analytics/tracking count as collection. This project's design collects nothing (see `10-01` § 5), so COPPA's parental-consent machinery is *not triggered* — but schools vetting the site need a written statement to rely on. Thai PDPA reinforces this: data of children **under 10** requires parental consent, and this audience starts in early elementary.
6. **User-facing (teacher/student) docs** — the README answers "how do I get started" for a *developer*. A teaching tool's primary users are teachers; without classroom-facing guidance the product is undiscoverable to its actual audience.

Everything else is **optional** and should be written when it earns its keep — not before.

---

## 2. Current Inventory & Verdict

| File | State | Verdict |
| :--- | :---- | :------ |
| `README.md` (root) | ✅ Good, English, clone URL fixed | **Keep.** Add links to LICENSE / CONTRIBUTING / PRIVACY + "pre-alpha, no games yet" note |
| `LICENSE` | ❌ Missing | **Write now (P0)** — MIT recommended for a learning project |
| `CONTRIBUTING.md` | ❌ Missing | **Write now (P0)** — short: run `node --test`, content-in-data, keyboard-first, no data collection |
| `CODE_OF_CONDUCT.md` | ❌ Missing | **Write now (P0)** — Contributor Covenant |
| `SECURITY.md` | ❌ Missing | **Write now (P1)** — short: static client-side site, no secrets, zero collection, report via issues |
| `PRIVACY.md` | ❌ Missing | **Write now (P0)** — COPPA/PDPA statement: collects nothing, `localStorage` only, no third parties |
| `docs/README.md` | ✅ Good index | **Keep.** Make it the single home of the naming convention (see § 3.2) |
| 9× directory `README.md` stubs (01–10) | ⚠️ Duplicated boilerplate | **Slim** — see § 3.2 |
| `01-01-executive-summary.md` | ✅ Substantive | Keep |
| `02-01-web-game-architecture.md` | ⚠️ One-paragraph placeholder | **Expand when code lands** (RFC must document real decisions) or cut the file now |
| `03-01-system-overview.md` | ⚠️ One-paragraph placeholder | Same as above |
| `04-api-integration/` | ⚠️ Shell only, no content | **Hold** — write when an API/backend actually exists |
| `05-ops-deployment/` | ⚠️ Shell only, no content | **Hold** — hosting decision now lives in `10-01` § 8; flesh out when CI deploys |
| `06-security-compliance/` | ⚠️ Shell only, no content | **Fold into `PRIVACY.md`** for now; expand if accounts/backends ever appear |
| `07-01-product-roadmap.md` | ✅ Skeleton | Keep — align versions with `10-01` |
| `08-01-project-analysis-gap.md` | ✅ Substantive | Keep — update when code exists |
| `09-runbook/` | ⚠️ Shell only, no content | **Hold** — write when there is a real build/release to run |
| `10-01-development-plan.md` | ✅ Substantive | Keep — the working plan |

---

## 3. Key Findings

### 3.1 The real gaps are at the repo root, not in `docs/`

The most necessary documents (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, PRIVACY) **do not exist anywhere** — yet the tree contains 10 spec directories. Effort is inverted: heaviest documentation sits in the least-necessary places.

### 3.2 Nine copies of the same "Naming Rule" boilerplate

Every directory README repeats the identical `Purpose + Naming Rule + NN-{aa-bb-cc}.md` block with only the `NN` changing. That is ~90 lines of duplication with 9 places to drift (two already did before the refactor). Fix: keep one canonical definition in `docs/README.md`; each directory README keeps only its 1-line purpose.

### 3.3 Content-free scaffolding reads as false coverage

`04`, `05`, `06`, `09` contain only stub READMEs; `02-01` and `03-01` are one-liners. An empty "API integration" or "Runbook" directory implies the concern is handled when it is not. Policy (matches `08-01`'s own conclusion — progress is code, not docs): **create content files only when the thing they document exists**; keep the directory tree as intent.

### 3.4 Wrong audience

100% of today's docs are developer/operator-facing. The product's users — teachers and students — have no documentation at all: no "how to play", no classroom suggestions, no printable word lists. This is the largest *content* gap and should be filled in lockstep with each shipped game (README section + per-game notes), not speculatively now.

### 3.5 Legal exposure is unaddressed

No license means the project is not legally open source (all rights reserved by default). No privacy statement means schools cannot vet it, and the zero-collection design — this project's strongest compliance asset — is undocumented.

---

## 4. Recommended Actions (priority order)

| # | Action | Priority | Trigger |
| :- | :----- | :------- | :------ |
| 1 | Add `LICENSE` (MIT) | P0 | Now |
| 2 | Add `CONTRIBUTING.md` (tests, conventions, content-in-data) | P0 | Now |
| 3 | Add `CODE_OF_CONDUCT.md` (Contributor Covenant) | P0 | Now |
| 4 | Add `PRIVACY.md` (no data collection, COPPA/PDPA) | P0 | Now |
| 5 | Add `SECURITY.md` (short static-site statement) | P1 | Now |
| 6 | Link 1–5 from `README.md`; add "status: pre-alpha" note | P0 | With 1–5 |
| 7 | Collapse 9 duplicate Naming-Rule stubs into `docs/README.md` | P1 | Now |
| 8 | Delete or clearly mark placeholder RFC/system stubs (`02-01`, `03-01`) | P2 | When game 1 code lands |
| 9 | Write per-game classroom/teacher docs + game pages | P1 | With each game (Phase 1+) |
| 10 | Fill `04`, `05`, `06`, `09` only when their subjects exist | — | Never speculatively |

---

## 5. Definition of "Docs Complete" for v1.0.0

- Root has: `README.md`, `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `PRIVACY.md`.
- `docs/README.md` is the sole naming-convention source; directory READMEs carry only a purpose line.
- Every file under `docs/` names something that exists or a decision that was made — no placeholders.
- The first shipped game ships with teacher-facing usage notes.