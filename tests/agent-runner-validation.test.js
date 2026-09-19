import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverReadyTask } from "../scripts/agent-discover-task.mjs";

const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const RUNNER_SCRIPT = path.join(REPO_ROOT, "scripts", "agent-runner.sh");
const DISCOVER_SCRIPT = path.join(
  REPO_ROOT,
  "scripts",
  "agent-discover-task.mjs"
);

function runBash(args, cwd = REPO_ROOT) {
  return spawnSync("bash", args, {
    cwd,
    encoding: "utf8",
  });
}

function runDiscover(args, cwd = REPO_ROOT) {
  return spawnSync(process.execPath, [DISCOVER_SCRIPT, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function makeFixtureRoot(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agent-runner-fixture-"));
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

function backlogDocument(rows) {
  return [
    "# Backlog Protocol",
    "",
    "## 14. Active Backlog",
    "",
    "| ID | Status | Priority | Depends On | Task Spec | Summary | Owner | Evidence |",
    "| -- | ------ | -------- | ---------- | --------- | ------- | ----- | -------- |",
    ...rows,
    "",
  ].join("\n");
}

test("agent-runner.sh syntax check passes", () => {
  const result = runBash(["-n", RUNNER_SCRIPT]);
  assert.equal(result.status, 0, result.stderr);
});

test("agent-runner.sh --help displays usage and exits 0", () => {
  const result = runBash([RUNNER_SCRIPT, "--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /agent-runner\.sh/);
});

test("agent-runner.sh executes custom command, logs output, and propagates exit code 0", () => {
  const tmpLogDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-runner-log-"));
  try {
    const result = runBash([
      RUNNER_SCRIPT,
      "--log-dir",
      tmpLogDir,
      "--",
      process.execPath,
      "-e",
      "console.log(987654)",
    ]);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /987654/);
    assert.match(result.stdout, /status=PASS/);

    const logFiles = fs
      .readdirSync(tmpLogDir)
      .filter((file) => file.startsWith("run-") && file.endsWith(".log"));
    assert.equal(logFiles.length, 1, "Exactly one log file must be created");

    const logContent = fs.readFileSync(
      path.join(tmpLogDir, logFiles[0]),
      "utf8"
    );
    assert.match(logContent, /START run_id=/);
    assert.match(logContent, /987654/);
    assert.match(logContent, /END exit_code=0 status=PASS/);
  } finally {
    fs.rmSync(tmpLogDir, { recursive: true, force: true });
  }
});

test("agent-runner.sh propagates non-zero exit code and logs FAIL", () => {
  const tmpLogDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "agent-runner-fail-log-")
  );
  try {
    const result = runBash([
      RUNNER_SCRIPT,
      "--log-dir",
      tmpLogDir,
      "--",
      process.execPath,
      "-e",
      "process.exit(7)",
    ]);

    assert.equal(result.status, 7);
    assert.match(result.stdout, /status=FAIL/);

    const logFiles = fs
      .readdirSync(tmpLogDir)
      .filter((file) => file.startsWith("run-") && file.endsWith(".log"));
    assert.equal(logFiles.length, 1);

    const logContent = fs.readFileSync(
      path.join(tmpLogDir, logFiles[0]),
      "utf8"
    );
    assert.match(logContent, /END exit_code=7 status=FAIL/);
  } finally {
    fs.rmSync(tmpLogDir, { recursive: true, force: true });
  }
});

test("agent-discover-task reports NO EXECUTABLE TASK when no tasks are READY", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument([
        "| TASK-1 | DONE | P0 | — | `tasks/1.md` | Task 1 | — | `12-evidence/1.md` |",
        "| TASK-2 | DONE | P0 | TASK-1 | `tasks/2.md` | Task 2 | — | `12-evidence/2.md` |",
        "| TASK-3 | PLANNED | P1 | TASK-2 | `tasks/3.md` | Task 3 | — | — |",
      ]),
    },
    (root) => {
      const outcome = discoverReadyTask({ root });
      assert.equal(outcome.task, null);
      assert.equal(outcome.reason, "no_ready_task");

      const cliResult = runDiscover(["--root", root]);
      assert.equal(cliResult.status, 0);
      assert.match(cliResult.stdout, /NO EXECUTABLE TASK/);
    }
  );
});

test("agent-discover-task blocks READY task whose dependency is not DONE", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument([
        "| TASK-1 | IN_PROGRESS | P0 | — | `tasks/1.md` | Task 1 | — | — |",
        "| TASK-2 | READY | P0 | TASK-1 | `tasks/2.md` | Task 2 | — | — |",
      ]),
    },
    (root) => {
      const outcome = discoverReadyTask({ root });
      assert.equal(outcome.task, null);
      assert.equal(outcome.reason, "no_ready_task");

      const cliResult = runDiscover(["--root", root]);
      assert.equal(cliResult.status, 0);
      assert.match(cliResult.stdout, /NO EXECUTABLE TASK/);
    }
  );
});

test("agent-discover-task selects executable READY task when dependencies are DONE", () => {
  withFixtureRoot(
    {
      "docs/BACKLOG.md": backlogDocument([
        "| TASK-1 | DONE | P0 | — | `tasks/1.md` | Task 1 | — | `12-evidence/1.md` |",
        "| TASK-2 | READY | P1 | TASK-1 | `tasks/2.md` | Task 2 | — | — |",
      ]),
    },
    (root) => {
      const outcome = discoverReadyTask({ root });
      assert.ok(outcome.task);
      assert.equal(outcome.task.id, "TASK-2");

      const cliResult = runDiscover(["--root", root]);
      assert.equal(cliResult.status, 0);
      assert.match(cliResult.stdout, /READY_TASK: TASK-2/);
    }
  );
});

test("agent-runner.sh prevents concurrent executions via locking", async () => {
  const tmpLogDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "agent-runner-lock-log-")
  );
  let firstRun;
  try {
    // Start a first runner that holds the lock for long enough for a second
    // invocation to observe it as active, regardless of whether the
    // environment's agent-runner.sh takes the flock or mkdir-fallback path.
    firstRun = spawn(
      "bash",
      [
        RUNNER_SCRIPT,
        "--log-dir",
        tmpLogDir,
        "--",
        process.execPath,
        "-e",
        "setTimeout(() => {}, 3000)",
      ],
      { cwd: REPO_ROOT }
    );

    const deadline = Date.now() + 5000;
    let started = false;
    while (Date.now() < deadline) {
      const logFiles = fs
        .readdirSync(tmpLogDir)
        .filter((file) => file.startsWith("run-") && file.endsWith(".log"));
      if (
        logFiles.length > 0 &&
        fs
          .readFileSync(path.join(tmpLogDir, logFiles[0]), "utf8")
          .includes("START")
      ) {
        started = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.ok(started, "first runner must log START before lock check");

    const result = runBash([
      RUNNER_SCRIPT,
      "--log-dir",
      tmpLogDir,
      "--",
      process.execPath,
      "-e",
      "console.log(1)",
    ]);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /another agent runner is already active/);
  } finally {
    if (firstRun && firstRun.exitCode === null) {
      firstRun.kill("SIGTERM");
    }
    await new Promise((resolve) => {
      if (!firstRun || firstRun.exitCode !== null) {
        resolve();
        return;
      }
      firstRun.once("exit", resolve);
      setTimeout(resolve, 4000);
    });
    fs.rmSync(tmpLogDir, { recursive: true, force: true });
  }
});

test("WS-005 backlog state and evidence satisfy protocol contracts", () => {
  const backlogPath = path.join(REPO_ROOT, "docs", "BACKLOG.md");
  const evidencePath = path.join(REPO_ROOT, "docs", "12-evidence", "WS-005.md");

  assert.ok(fs.existsSync(backlogPath), "docs/BACKLOG.md must exist");
  assert.ok(
    fs.existsSync(evidencePath),
    "docs/12-evidence/WS-005.md must exist"
  );

  const backlog = fs.readFileSync(backlogPath, "utf8");
  const wsRow = backlog
    .split("\n")
    .find((line) => line.trim().startsWith("| WS-005"));

  assert.ok(wsRow, "docs/BACKLOG.md must contain a WS-005 row");
  assert.ok(
    wsRow.includes("EVIDENCE_COMPLETE") || wsRow.includes("DONE"),
    "WS-005 backlog row must be EVIDENCE_COMPLETE or reviewer-approved DONE"
  );

  const evidence = fs.readFileSync(evidencePath, "utf8");
  assert.ok(
    evidence.includes("scripts/agent-runner.sh"),
    "WS-005 evidence must reference runner script"
  );
  assert.ok(
    evidence.includes("docs/12-evidence/WS-005.md"),
    "WS-005 evidence must reference itself"
  );
});
