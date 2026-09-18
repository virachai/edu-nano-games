import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";

test("WS-002 backlog state and evidence satisfy the state/evidence contract", () => {
  const backlogPath = path.resolve("docs/BACKLOG.md");
  const evidencePath = path.resolve("docs/12-evidence/WS-002.md");

  assert.ok(fs.existsSync(backlogPath), "docs/BACKLOG.md must exist");
  assert.ok(
    fs.existsSync(evidencePath),
    "docs/12-evidence/WS-002.md must exist"
  );

  const backlog = fs.readFileSync(backlogPath, "utf8");
  const wsRow = backlog
    .split("\n")
    .find((line) => line.trim().startsWith("| WS-002"));

  assert.ok(wsRow, "docs/BACKLOG.md must contain a WS-002 row");
  assert.ok(
    wsRow.includes("EVIDENCE_COMPLETE"),
    "WS-002 backlog row must be EVIDENCE_COMPLETE"
  );
  assert.ok(
    !wsRow.includes("DONE"),
    "WS-002 must not be marked DONE by a local agent"
  );

  const evidence = fs.readFileSync(evidencePath, "utf8");
  assert.ok(
    evidence.includes("tests/agent-protocol-validation.test.js"),
    "WS-002 evidence must reference its implementation test"
  );
  assert.ok(
    evidence.includes("docs/12-evidence/WS-002.md"),
    "WS-002 evidence must reference the evidence artifact itself"
  );
});
