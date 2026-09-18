# logs

Append-only record of repeatable, automatable agent actions (test runs, lint, build, validation gates) with a pass/fail outcome. Governed by `.claude/rules/agent-action-logging-standard.md`.

## Naming Rule

One file per day, UTC date:

```text
logs/{YYYYMMDD}-agent-actions.jsonl
```

Example: `logs/20260918-agent-actions.jsonl`

- Append only. Never rewrite, reorder, or delete existing lines.
- A new day starts a new file; do not continue the previous day's file.
- One JSON object per line (JSONL), no pretty-printing.

## Entry Schema

| Field       | Required | Description                                                                                    |
| ----------- | -------- | ---------------------------------------------------------------------------------------------- |
| `timestamp` | yes      | ISO 8601 UTC, e.g. `2026-09-18T13:42:05Z`                                                      |
| `action`    | yes      | Short identifier of the action, e.g. `pnpm test`, `agent:self-check`                           |
| `result`    | yes      | `pass` or `fail`                                                                               |
| `detail`    | on fail  | One line; the first relevant error or the observed summary. Optional but encouraged on `pass`. |

Rules:

- Never write secrets, tokens, or credentials into `detail`.
- `detail` must be a single line (no raw newlines inside the JSON string).
- Log only actions with a pass/fail outcome. Do not log exploratory reads, searches, or file edits.

Example line:

```text
{"timestamp":"2026-09-18T13:42:05Z","action":"pnpm test","result":"pass","detail":"tests 45, pass 45, fail 0"}
```

## Relationship to `memory/`

`logs/*.jsonl` is a raw, timestamped, append-only action record and is not read back at the start of a session. Durable lessons distilled from a session belong in `memory/`, not here — and pass/fail outcomes belong here, not in `memory/`.
