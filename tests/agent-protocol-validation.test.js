import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";

test("agent runbook exists and contains core protocol requirements", () => {
  const runbookPath = path.resolve("docs/AGENT_RUNBOOK.md");
  assert.ok(fs.existsSync(runbookPath), "docs/AGENT_RUNBOOK.md must exist");

  const content = fs.readFileSync(runbookPath, "utf8");

  // 1. READY task selection
  assert.ok(
    content.includes("READY") || content.includes("READY task"),
    "Runbook must specify READY task selection"
  );

  // 2. Exactly one task per invocation
  assert.ok(
    content.includes("one task per agent invocation") ||
      content.includes("one task per invocation") ||
      content.includes("exactly one task"),
    "Runbook must specify executing one task per invocation"
  );

  // 3. Verification required
  assert.ok(
    content.includes("Verification") || content.includes("VERIFY"),
    "Runbook must require verification"
  );

  // 4. Evidence required
  assert.ok(
    content.includes("Evidence") || content.includes("12-evidence"),
    "Runbook must require evidence recording"
  );

  // 5. Handoff required
  assert.ok(
    content.includes("Handoff") || content.includes("handoff"),
    "Runbook must require structured handoff"
  );

  // 6. DWB105 reviewer boundary
  assert.ok(
    content.includes("DWB105") || content.includes("reviewer"),
    "Runbook must define the DWB105 reviewer boundary"
  );

  // 7. NO EXECUTABLE TASK stop behavior
  assert.ok(
    content.includes("NO EXECUTABLE TASK"),
    "Runbook must specify NO EXECUTABLE TASK stop behavior"
  );
});
