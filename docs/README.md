# 📚 Documentation Directory

Welcome to the **nano-games** documentation repository. This structure is governed by strict naming conventions and modular separation of concerns to ensure maintainability, scalability, and production readiness.

---

## 📂 Directory Structure & Responsibilities

| Directory                 | Scope & Primary Purpose                                                                                             |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------ |
| `01-product-vision/`      | Product requirements, executive summaries, target personas, and core value propositions.                            |
| `02-rfc-tech-spec/`       | Technical RFCs (Request for Comments), architectural decision records (ADRs), and deep technical specifications.    |
| `03-system-architecture/` | High-level system design, data flow diagrams, and component interactions for the game collection.                   |
| `04-api-integration/`     | API contracts and third-party service integrations (leaderboards, analytics, content backends).                     |
| `05-ops-deployment/`      | DevOps procedures, CI/CD pipelines, static hosting setup, and scaling strategies.                                   |
| `06-security-compliance/` | Security audits, child-privacy policies, content-safety guidelines, and dependency hygiene.                         |
| `07-product-roadmap/`     | Phased delivery milestones, MVP scope definitions, feature backlogs, and long-term release plans.                   |
| `08-analysis-gap/`        | Gap analysis between the documented vision and the current repository state.                                        |
| `09-runbook/`             | Operational runbooks for building, releasing, and deploying the games.                                              |

---

## 🏷️ File Naming Convention (`NN-{aa-bb-cc}.md`)

All documentation files inside `docs/` must strictly adhere to the following kebab-case sequence format:

```text
NN-{topic-subtopic-descriptor}.md
```

### Components Breakdown

1. **`NN` (Two-Digit Sequence Prefix):** Matches the parent directory's numeric namespace (`01`, `02`, `03`, etc.) to preserve alphabetical and logical sorting in file explorers.
2. **`aa-bb-cc` (Kebab-Case Descriptive Slug):** Clear, descriptive summary of the document's subject separated strictly by hyphens (no spaces, no underscores, lowercase only).
3. **`.md` (Markdown Extension):** Standard Markdown format for version control and rendered documentation hosting.

### Examples

- ✅ `docs/01-product-vision/01-01-executive-summary.md`
- ✅ `docs/02-rfc-tech-spec/02-01-web-game-architecture.md`
- ❌ `docs/01-product-vision/ExecutiveSummary.md` (Invalid PascalCase & missing NN prefix)
- ❌ `docs/03-system-architecture/03_system_overview.md` (Invalid underscore usage)