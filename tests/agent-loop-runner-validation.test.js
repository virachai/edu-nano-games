import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const LOOP_SCRIPT = path.join(REPO_ROOT, "scripts", "agent-loop.sh");
const RUNNER_SCRIPT = path.join(REPO_ROOT, "scripts", "agent-runner.sh");

const POLL_INTERVAL_MS = 50;
const CYCLE_WAIT_MS = 30_000;
const STOP_WAIT_MS = 10_000;
const AGENT_STDOUT_TOKEN = "WS006-AGENT-STDOUT-TOKEN";

/**
 * Agent command used to observe cycle overlap: it records BEGIN, waits, then
 * records END, so a second BEGIN before an END proves two cycles overlapped.
 */
const MARKER_SCRIPT = [
  "const fs = require('node:fs');",
  "const file = process.argv[1];",
  "fs.appendFileSync(file, 'BEGIN\\n');",
  "setTimeout(() => { fs.appendFileSync(file, 'END\\n'); }, 200);",
].join(" ");

function runBash(args, cwd = REPO_ROOT) {
  return spawnSync("bash", args, { cwd, encoding: "utf8" });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeLogDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "agent-loop-log-"));
}

async function removeLogDir(dir) {
  // A runner stopped mid-cycle can still hold a file handle on Windows, so retry
  // briefly instead of failing a test on temporary-directory cleanup.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch {
      await sleep(200);
    }
  }
}

function readLogs(logDir, prefix) {
  return fs
    .readdirSync(logDir)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".log"))
    .map((name) => ({
      name,
      content: fs.readFileSync(path.join(logDir, name), "utf8"),
    }));
}

function readLogText(logDir, prefix) {
  return readLogs(logDir, prefix)
    .map((entry) => entry.content)
    .join("\n");
}

/**
 * Start the bounded loop. The window stays at its 1-minute minimum because the
 * loop only accepts whole minutes; each test stops the loop once it has
 * observed the behaviour under test.
 */
function startLoop({ logDir, intervalMinutes, agentCommand }) {
  // The loop is stopped by killing it, which leaves its interval `sleep` (and,
  // when stopped mid-cycle, a runner) running as an orphan. Attaching no pipes
  // keeps such orphans from holding the test runner's stdout open, which would
  // stall `node --test`. Assertions read the loop/runner log files instead of
  // captured output.
  const child = spawn(
    "bash",
    [
      LOOP_SCRIPT,
      "--log-dir",
      logDir,
      "--duration",
      "1",
      "--interval",
      String(intervalMinutes),
      "--",
      ...agentCommand,
    ],
    { cwd: REPO_ROOT, stdio: "ignore" }
  );

  return { child };
}

/** Log content used in assertion messages when a loop assertion fails. */
function diagnostics(logDir) {
  return [
    "--- loop log ---",
    readLogText(logDir, "loop-"),
    "--- runner log ---",
    readLogText(logDir, "run-"),
  ].join("\n");
}

async function waitFor(predicate, timeoutMs = CYCLE_WAIT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await sleep(POLL_INTERVAL_MS);
  }
  return false;
}

async function stopLoop(handle) {
  const { child } = handle;
  if (child.exitCode === null && child.signalCode === null) {
    child.kill();
  }
  const deadline = Date.now() + STOP_WAIT_MS;
  while (
    child.exitCode === null &&
    child.signalCode === null &&
    Date.now() < deadline
  ) {
    await sleep(POLL_INTERVAL_MS);
  }
  if (child.exitCode === null && child.signalCode === null) {
    assert.fail("bounded loop did not exit after being stopped");
  }
  // Let a runner stopped mid-cycle flush its run log before assertions read it.
  await sleep(300);
}

test("agent-loop.sh and agent-runner.sh syntax checks pass", () => {
  const loop = runBash(["-n", LOOP_SCRIPT]);
  assert.equal(loop.status, 0, loop.stderr);
  const runner = runBash(["-n", RUNNER_SCRIPT]);
  assert.equal(runner.status, 0, runner.stderr);
});

test("agent-loop.sh --help documents the runner-backed cycle", () => {
  const result = runBash([LOOP_SCRIPT, "--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /agent-runner\.sh/);
});

test("agent-loop.sh delegates each cycle to agent-runner.sh and preserves custom arguments", async () => {
  const logDir = makeLogDir();
  // The token lives in the probe file rather than in the command line, so seeing
  // it in the loop log would mean the loop duplicated agent output.
  const probePath = path.join(logDir, "agent-probe.cjs");
  fs.writeFileSync(
    probePath,
    `console.log(${JSON.stringify(AGENT_STDOUT_TOKEN)} + " " + JSON.stringify(process.argv.slice(2)));\n`,
    "utf8"
  );
  const agentCommand = [
    process.execPath,
    probePath,
    "alpha",
    "beta gamma",
    "delta=1",
  ];
  const handle = startLoop({ logDir, intervalMinutes: 1, agentCommand });

  try {
    const delegated = await waitFor(() =>
      readLogText(logDir, "loop-").includes("CYCLE 1 END runner_exit_code=0")
    );
    assert.ok(
      delegated,
      `the loop never recorded a completed delegated cycle; loop output:\n${diagnostics(logDir)}`
    );
    await stopLoop(handle);

    const runnerLogs = readLogs(logDir, "run-");
    assert.equal(
      runnerLogs.length,
      1,
      "the runner must own per-cycle run logging (exactly one run log for one cycle)"
    );

    const runnerLog = runnerLogs[0].content;
    assert.match(runnerLog, /START run_id=/);
    assert.match(runnerLog, /END exit_code=0 status=PASS/);
    assert.ok(
      runnerLog.includes(
        `${AGENT_STDOUT_TOKEN} ["alpha","beta gamma","delta=1"]`
      ),
      "custom command arguments must reach the agent unchanged"
    );

    const loopLog = readLogText(logDir, "loop-");
    assert.match(loopLog, /RUNNER=.*agent-runner\.sh/);
    assert.match(loopLog, /CYCLE 1 BEGIN/);
    assert.match(loopLog, /CYCLE 1 END runner_exit_code=0/);
    assert.ok(
      !loopLog.includes(AGENT_STDOUT_TOKEN),
      "agent output belongs to the runner log and must not be duplicated into the loop log"
    );
    assert.doesNotMatch(
      loopLog,
      /END exit_code=/,
      "the loop must not duplicate the runner's run logging"
    );
  } finally {
    await stopLoop(handle);
    await removeLogDir(logDir);
  }
});

test("agent-loop.sh surfaces the runner exit status at cycle level", async () => {
  const logDir = makeLogDir();
  const handle = startLoop({
    logDir,
    intervalMinutes: 1,
    agentCommand: [process.execPath, "-e", "process.exit(7)"],
  });

  try {
    const observed = await waitFor(() =>
      readLogText(logDir, "loop-").includes("CYCLE 1 END runner_exit_code=7")
    );
    assert.ok(
      observed,
      `the loop never recorded the runner exit code; loop output:\n${diagnostics(logDir)}`
    );
    await stopLoop(handle);

    const loopLog = readLogText(logDir, "loop-");
    assert.match(loopLog, /CYCLE 1 BEGIN/);
    assert.match(loopLog, /CYCLE 1 END runner_exit_code=7/);
    assert.match(readLogText(logDir, "run-"), /END exit_code=7 status=FAIL/);
  } finally {
    await stopLoop(handle);
    await removeLogDir(logDir);
  }
});

test("agent-loop.sh keeps cycles synchronous and never overlaps two invocations", async () => {
  const logDir = makeLogDir();
  const markerFile = path.join(logDir, "cycle-markers.txt");
  const handle = startLoop({
    logDir,
    intervalMinutes: 0,
    agentCommand: [
      process.execPath,
      "--input-type=commonjs",
      "-e",
      MARKER_SCRIPT,
      markerFile,
    ],
  });

  try {
    const ranCycles = await waitFor(() => {
      if (!fs.existsSync(markerFile)) return false;
      const ends = fs
        .readFileSync(markerFile, "utf8")
        .split("\n")
        .filter((line) => line === "END").length;
      return ends >= 2;
    });
    assert.ok(
      ranCycles,
      `two completed cycles were not observed; loop output:\n${diagnostics(logDir)}`
    );
    await stopLoop(handle);

    const markers = fs
      .readFileSync(markerFile, "utf8")
      .split("\n")
      .filter((line) => line.length > 0);
    assert.ok(
      markers.length >= 4,
      `expected at least two complete cycles, observed ${JSON.stringify(markers)}`
    );
    markers.forEach((marker, index) => {
      assert.equal(
        marker,
        index % 2 === 0 ? "BEGIN" : "END",
        `cycle markers must strictly alternate; a second BEGIN before an END means overlapping cycles: ${JSON.stringify(markers)}`
      );
    });

    const cycleBegins = readLogText(logDir, "loop-").match(/CYCLE \d+ BEGIN/g);
    assert.ok(
      cycleBegins && cycleBegins.length >= 2,
      "the loop log must record each delegated cycle"
    );
  } finally {
    await stopLoop(handle);
    await removeLogDir(logDir);
  }
});

test("agent-loop.sh keeps only scheduler duties and delegates execution", () => {
  const source = fs.readFileSync(LOOP_SCRIPT, "utf8");

  assert.match(
    source,
    /bash "\$RUNNER_SCRIPT" --log-dir "\$LOG_DIR" -- "\$@"/,
    "each cycle must invoke the canonical single-cycle runner"
  );
  assert.match(
    source,
    /STOP run_id=.*cycles=.*failed_cycles=.*last_runner_exit_code=/,
    "the loop must log its aggregate result"
  );
  assert.doesNotMatch(
    source,
    /\bflock\b/,
    "per-run locking belongs to the runner, not the loop"
  );
  assert.doesNotMatch(
    source,
    /\.runner\.lock/,
    "the loop must not manage the runner's lock"
  );
});

test("WS-006 backlog state and evidence satisfy protocol contracts", () => {
  const backlog = fs.readFileSync(
    path.join(REPO_ROOT, "docs", "BACKLOG.md"),
    "utf8"
  );
  const wsRow = backlog
    .split("\n")
    .find((line) => line.trim().startsWith("| WS-006"));

  assert.ok(wsRow, "docs/BACKLOG.md must contain a WS-006 row");
  assert.ok(
    wsRow.includes("EVIDENCE_COMPLETE") || wsRow.includes("DONE"),
    "WS-006 backlog row must be EVIDENCE_COMPLETE or reviewer-approved DONE"
  );

  const evidencePath = path.join(REPO_ROOT, "docs", "12-evidence", "WS-006.md");
  assert.ok(
    fs.existsSync(evidencePath),
    "docs/12-evidence/WS-006.md must exist"
  );

  const evidence = fs.readFileSync(evidencePath, "utf8");
  assert.ok(
    evidence.includes("scripts/agent-loop.sh"),
    "WS-006 evidence must reference the loop script"
  );
  assert.ok(
    evidence.includes("scripts/agent-runner.sh"),
    "WS-006 evidence must reference the runner script"
  );
  assert.ok(
    evidence.includes("docs/AGENT_LOOP_RUNBOOK.md"),
    "WS-006 evidence must reference the loop runbook"
  );
});
