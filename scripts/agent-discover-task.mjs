#!/usr/bin/env node
/**
 * Agent task discovery (WS-005).
 *
 * Discovers the next executable READY task from `docs/BACKLOG.md` per the protocol.
 * If no executable READY task exists, outputs `NO EXECUTABLE TASK` and exits 0.
 *
 * Usage:
 *   node scripts/agent-discover-task.mjs [--root <dir>]
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseBacklog } from "./agent-self-check.mjs";

const BACKLOG_RELATIVE_PATH = "docs/BACKLOG.md";

/**
 * Discover the first executable READY task from the backlog table.
 * Respects dependency rule: all dependencies in dependsOn must be DONE.
 */
export function discoverReadyTask({ root = process.cwd() } = {}) {
  const backlogPath = path.resolve(root, BACKLOG_RELATIVE_PATH);
  if (!fs.existsSync(backlogPath)) {
    return { task: null, reason: "missing_backlog" };
  }

  const backlog = parseBacklog(fs.readFileSync(backlogPath, "utf8"));
  if (!backlog.found || backlog.rows.length === 0) {
    return { task: null, reason: "empty_or_missing_table" };
  }

  const stateById = new Map();
  for (const row of backlog.rows) {
    stateById.set(row.id, row.status);
  }

  for (const row of backlog.rows) {
    if (row.status === "READY") {
      const depsSatisfied = row.dependsOn.every(
        (depId) => stateById.get(depId) === "DONE"
      );
      if (depsSatisfied) {
        return { task: row, reason: null };
      }
    }
  }

  return { task: null, reason: "no_ready_task" };
}

function parseCliArgs(argv) {
  const args = { root: process.cwd() };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--root" && i + 1 < argv.length) {
      args.root = path.resolve(argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { root } = parseCliArgs(process.argv);
  const { task } = discoverReadyTask({ root });
  if (task) {
    console.log(`READY_TASK: ${task.id}`);
    process.exit(0);
  } else {
    console.log("NO EXECUTABLE TASK");
    process.exit(0);
  }
}
