# Reviews

This directory contains reviewer/gatekeeper records produced after a local execution agent submits evidence.

## Protocol

1. Local agent executes a task.
2. Local agent records evidence in `docs/12-evidence/<TASK-ID>.md`.
3. DWB105 reviews the task specification, changed files, verification, and evidence.
4. DWB105 records `PASS`, `FAIL`, or `BLOCKED` in `docs/reviews/<TASK-ID>.md` when a dedicated review record is needed.
5. Only an accepted review may move the task to `DONE`.

The reviewer record is separate from agent evidence so the agent cannot self-approve its own work.
