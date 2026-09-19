import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SCRIPT_PATH = path.join(REPO_ROOT, "scripts", "agent-self-check.mjs");

function runSelfCheck(args, cwd = REPO_ROOT) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function backlogDocument(row) {
  return [
    "# Backlog Protocol",
    "",
    "## 14. Active Backlog",
    "",
    "| ID | Status | Priority | Depends On | Task Spec | Summary | Owner | Evidence |",
    "| -- | ------ | -------- | ---------- | --------- | ------- | ----- | -------- |",
    row,
    "",
  ].join("\n");
}

function taskRow({ id, status, dependsOn = "—", taskSpec, evidence }) {
  return `| ${id} | ${status} | P1 | ${dependsOn} | \`${taskSpec}\` | Fixture task | — | \`${evidence}\` |`;
}

function validEvidence(taskId, status = "EVIDENCE_COMPLETE") {
  return [
    `# Evidence — ${taskId}`,
    "",
    `**Task:** \`${taskId}\`  `,
    `**Status:** ${status}  `,
    "**Date:** 2026-09-18  ",
    "**Agent:** fixture  ",
    "**Reviewer:** DWB105 / pending",
    "",
    "## Result",
    "",
    "Fixture result.",
    "",
    "## Changed Files",
    "",
    "- `fixture.js` — fixture change",
    "",
    "## Commands Executed",
    "",
    "```bash",
    "node --test",
    "```",
    "",
    "## Verification Results",
    "",
    "| Check      | Expected | Actual  | Result |",
    "| ---------- | -------- | ------- | ------ |",
    "| `node -v` | version  | v25.0.0 | PASS   |",
    "",
    "## Artifacts",
    "",
    "- `fixture.js` — fixture artifact",
    "",
    "## Blocker Record",
    "",
    "None.",
    "",
    "## Final Assessment",
    "",
    "**Assessment:** `" + status + "`",
    "",
  ].join("\n");
}

function makeFixtureRoot(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agent-self-check-"));
  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
  }
  return root;
}

function withFixtureRoot(files, assertion) {
  const root = makeFixtureRoot(files);
  try {
    assertion(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("self-check passes for a consistent fixture repository", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument(
        taskRow({
          id: "WS-900",
          status: "EVIDENCE_COMPLETE",
          taskSpec: "tasks/WS-900.md",
          evidence: "12-evidence/WS-900.md",
        })
      ),
      "docs/tasks/WS-900.md": "# WS-900 — Fixture\n\n**Status:** READY\n",
      "docs/12-evidence/WS-900.md": validEvidence("WS-900"),
    },
    (root) => {
      const result = runSelfCheck(["--root", root, "WS-900"]);
      assert.equal(result.status, 0, result.stdout + result.stderr);
      assert.match(result.stdout, /SELF-CHECK: PASS/);
    }
  );
});

test("self-check passes for the real repository task under validation (WS-004)", () => {
  const result = runSelfCheck(["--root", REPO_ROOT, "WS-004"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /SELF-CHECK: PASS/);
  assert.match(result.stdout, /docs\/12-evidence\/WS-004\.md/);
});

test("self-check passes for the real repository task under validation (WS-005)", () => {
  const result = runSelfCheck(["--root", REPO_ROOT, "WS-005"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /SELF-CHECK: PASS/);
  assert.match(result.stdout, /docs\/12-evidence\/WS-005\.md/);
});

test("self-check passes in whole-backlog mode for the real repository", () => {
  const result = runSelfCheck(["--root", REPO_ROOT]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /SELF-CHECK: PASS/);
});

test("self-check accepts a task file whose Status is still READY", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument(
        taskRow({
          id: "WS-901",
          status: "EVIDENCE_COMPLETE",
          taskSpec: "tasks/WS-901.md",
          evidence: "12-evidence/WS-901.md",
        })
      ),
      "docs/tasks/WS-901.md": "# WS-901 — Fixture\n\n**Status:** READY\n",
      "docs/12-evidence/WS-901.md": validEvidence("WS-901"),
    },
    (root) => {
      const result = runSelfCheck(["--root", root, "WS-901"]);
      assert.equal(result.status, 0, result.stdout + result.stderr);
      assert.match(result.stdout, /SELF-CHECK: PASS/);
      assert.match(result.stdout, /notes \(non-fatal\)/);
      assert.match(result.stdout, /Status: READY/);
    }
  );
});

test("self-check fails when an advanced state has no evidence record", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument(
        taskRow({
          id: "WS-902",
          status: "EVIDENCE_COMPLETE",
          taskSpec: "tasks/WS-902.md",
          evidence: "12-evidence/WS-902.md",
        })
      ),
      "docs/tasks/WS-902.md": "# WS-902 — Fixture\n\n**Status:** READY\n",
    },
    (root) => {
      const result = runSelfCheck(["--root", root, "WS-902"]);
      assert.notEqual(result.status, 0);
      assert.match(result.stdout, /SELF-CHECK: FAIL/);
      assert.match(result.stdout, /EVIDENCE_COMPLETE but its evidence record/);
    }
  );
});

test("self-check fails when the evidence record omits required fields", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument(
        taskRow({
          id: "WS-903",
          status: "EVIDENCE_COMPLETE",
          taskSpec: "tasks/WS-903.md",
          evidence: "12-evidence/WS-903.md",
        })
      ),
      "docs/tasks/WS-903.md": "# WS-903 — Fixture\n\n**Status:** READY\n",
      "docs/12-evidence/WS-903.md": [
        "# Evidence — WS-903",
        "",
        "**Task:** `WS-903`  ",
        "**Status:** EVIDENCE_COMPLETE",
        "",
        "## Result",
        "",
        "Fixture result.",
        "",
      ].join("\n"),
    },
    (root) => {
      const result = runSelfCheck(["--root", root, "WS-903"]);
      assert.notEqual(result.status, 0);
      assert.match(result.stdout, /SELF-CHECK: FAIL/);
      assert.match(result.stdout, /## Changed Files/);
      assert.match(result.stdout, /blockers\/follow-up/);
    }
  );
});

test("self-check fails on the unreconciled state class exposed by WS-002", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument(
        taskRow({
          id: "WS-904",
          status: "READY",
          taskSpec: "tasks/WS-904.md",
          evidence: "12-evidence/WS-904.md",
        })
      ),
      "docs/tasks/WS-904.md": "# WS-904 — Fixture\n\n**Status:** READY\n",
      "docs/12-evidence/WS-904.md": validEvidence("WS-904"),
    },
    (root) => {
      const result = runSelfCheck(["--root", root, "WS-904"]);
      assert.notEqual(result.status, 0);
      assert.match(result.stdout, /SELF-CHECK: FAIL/);
      assert.match(result.stdout, /unreconciled/);
    }
  );
});

test("self-check fails when a task is marked DONE without corroborating evidence", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument(
        taskRow({
          id: "WS-905",
          status: "DONE",
          taskSpec: "tasks/WS-905.md",
          evidence: "12-evidence/WS-905.md",
        })
      ),
      "docs/tasks/WS-905.md": "# WS-905 — Fixture\n\n**Status:** READY\n",
      "docs/12-evidence/WS-905.md": validEvidence("WS-905"),
    },
    (root) => {
      const result = runSelfCheck(["--root", root, "WS-905"]);
      assert.notEqual(result.status, 0);
      assert.match(result.stdout, /SELF-CHECK: FAIL/);
      assert.match(result.stdout, /must not mark a task DONE/);
    }
  );
});

test("self-check fails when the referenced task file is missing", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument(
        taskRow({
          id: "WS-906",
          status: "READY",
          taskSpec: "tasks/WS-906.md",
          evidence: "12-evidence/WS-906.md",
        })
      ),
    },
    (root) => {
      const result = runSelfCheck(["--root", root, "WS-906"]);
      assert.notEqual(result.status, 0);
      assert.match(result.stdout, /SELF-CHECK: FAIL/);
      assert.match(result.stdout, /missing task file/);
    }
  );
});

test("self-check fails when the task has no backlog row", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument(
        taskRow({
          id: "WS-907",
          status: "READY",
          taskSpec: "tasks/WS-907.md",
          evidence: "12-evidence/WS-907.md",
        })
      ),
      "docs/tasks/WS-907.md": "# WS-907 — Fixture\n\n**Status:** READY\n",
    },
    (root) => {
      const result = runSelfCheck(["--root", root, "WS-999"]);
      assert.notEqual(result.status, 0);
      assert.match(result.stdout, /SELF-CHECK: FAIL/);
      assert.match(result.stdout, /no backlog row found for task WS-999/);
    }
  );
});
