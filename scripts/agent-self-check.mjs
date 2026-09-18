#!/usr/bin/env node
/**
 * Agent self-validation gate (WS-004).
 *
 * Read-only pre-handoff check. It validates that the authoritative lifecycle
 * state (`docs/BACKLOG.md`), the task specification, and the evidence record
 * agree with each other. It never repairs state: an inconsistency is reported
 * so the executing agent can correct it and rerun the gate.
 *
 * Usage:
 *   node scripts/agent-self-check.mjs [TASK-ID] [--root <dir>]
 *
 * Exit codes:
 *   0 — SELF-CHECK: PASS
 *   1 — SELF-CHECK: FAIL
 *   2 — usage error
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const BACKLOG_RELATIVE_PATH = "docs/BACKLOG.md";

/** Protocol states from `docs/BACKLOG.md` §2. */
export const PROTOCOL_STATES = [
  "PLANNED",
  "READY",
  "IN_PROGRESS",
  "IMPLEMENTED",
  "VERIFIED",
  "EVIDENCE_COMPLETE",
  "DONE",
  "BLOCKED",
  "CANCELLED",
];

/** Ordered progress rank. Exclusive states (BLOCKED, CANCELLED) are absent. */
const STATE_RANK = {
  PLANNED: 0,
  READY: 1,
  IN_PROGRESS: 2,
  IMPLEMENTED: 3,
  VERIFIED: 4,
  EVIDENCE_COMPLETE: 5,
  DONE: 6,
};

/** Backlog states whose row must be backed by an existing evidence record. */
const STATES_REQUIRING_EVIDENCE_FILE = ["EVIDENCE_COMPLETE", "DONE"];

/** States in which an incomplete dependency does not block (yet). */
const STATES_WITHOUT_DEPENDENCY_DEMAND = ["PLANNED", "BLOCKED", "CANCELLED"];

/** Evidence fields required by `docs/tasks/WS-004.md` §3. */
const REQUIRED_EVIDENCE_SECTIONS = [
  { label: "changed files", names: ["Changed Files"] },
  { label: "commands executed", names: ["Commands Executed", "Commands"] },
  {
    label: "verification results",
    names: ["Verification Results", "Verification"],
  },
  { label: "artifacts/evidence", names: ["Artifacts", "Evidence Artifacts"] },
  {
    label: "blockers/follow-up",
    names: [
      "Blocker Record",
      "Blockers",
      "Follow-Up",
      "Follow Up",
      "Known Limitations / Risks",
      "Known Limitations/Risks",
    ],
  },
];

const EMPTY_CELL = /^(—|–|-)$/;

function stripBackticks(value) {
  return String(value ?? "")
    .replace(/`/g, "")
    .trim();
}

function isEmptyCell(value) {
  const cleaned = stripBackticks(value);
  return cleaned === "" || EMPTY_CELL.test(cleaned);
}

function toDisplay(root, absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}

/**
 * Resolve a backlog-referenced path. Backlog cells are relative to `docs/`
 * (`tasks/x.md`), but a repository-root-relative form is accepted too.
 */
function resolveRepoPath(root, relativePath) {
  const cleaned = stripBackticks(relativePath).replace(/^\.\//, "");
  const candidates = [
    path.resolve(root, cleaned),
    path.resolve(root, "docs", cleaned),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return {
        absolute: candidate,
        display: toDisplay(root, candidate),
        exists: true,
      };
    }
  }
  const expected = candidates[1];
  return {
    absolute: expected,
    display: toDisplay(root, expected),
    exists: false,
  };
}

function splitTableRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return null;
  return trimmed
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function isSeparatorRow(cells) {
  return cells.every((cell) => /^:?-{2,}:?$/.test(cell.replace(/\s+/g, "")));
}

function parseDependsOn(value) {
  if (isEmptyCell(value)) return [];
  return stripBackticks(value)
    .split(",")
    .map((entry) => entry.trim().toUpperCase())
    .filter((entry) => entry !== "" && !EMPTY_CELL.test(entry));
}

function toRow(cells, lineNumber) {
  const [id, status, priority, dependsOn, taskSpec, summary, owner, evidence] =
    cells.map(stripBackticks);
  return {
    id: id.toUpperCase(),
    status: status.toUpperCase(),
    priority: priority.toUpperCase(),
    dependsOn: parseDependsOn(dependsOn),
    taskSpec: isEmptyCell(taskSpec) ? null : taskSpec,
    summary,
    owner,
    evidence: isEmptyCell(evidence) ? null : evidence,
    line: lineNumber,
  };
}

/** Parse the authoritative task table from `docs/BACKLOG.md` §14. */
export function parseBacklog(markdown) {
  const lines = String(markdown).split(/\r?\n/);
  const headingIndex = lines.findIndex((line) =>
    /^##\s+\d*\.?\s*Active Backlog\s*$/i.test(line.trim())
  );
  if (headingIndex === -1) {
    return { found: false, rows: [], malformed: [] };
  }

  const rows = [];
  const malformed = [];
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##\s/.test(line.trim())) break;
    const cells = splitTableRow(line);
    if (!cells || isSeparatorRow(cells)) continue;
    if (stripBackticks(cells[0]).toUpperCase() === "ID") continue;
    if (cells.length !== 8) {
      malformed.push({ line: index + 1, text: line.trim() });
      continue;
    }
    rows.push(toRow(cells, index + 1));
  }
  return { found: true, rows, malformed };
}

function extractState(value) {
  if (!value || value.includes("<")) return null;
  const upper = String(value).toUpperCase();
  return (
    PROTOCOL_STATES.find((state) => new RegExp(`\\b${state}\\b`).test(upper)) ??
    null
  );
}

function findFieldValue(lines, field) {
  const pattern = new RegExp(
    `^\\s*[-*]?\\s*\\*\\*${field}:\\*\\*\\s*(.*)$`,
    "i"
  );
  for (const line of lines) {
    const match = pattern.exec(line);
    if (match) return stripBackticks(match[1]);
  }
  return null;
}

function sectionIsEmpty(body) {
  return !body.some((line) => {
    const trimmed = line.trim();
    return trimmed !== "" && !/^[-*_\s]+$/.test(trimmed);
  });
}

function findSection(sections, names) {
  for (const name of names) {
    const body = sections.get(name.toLowerCase());
    if (body) return { name, body };
  }
  return null;
}

/** Parse an evidence record: header fields plus `##` sections. */
export function parseEvidence(markdown) {
  const text = String(markdown);
  const lines = text.split(/\r?\n/);
  const sections = new Map();
  let currentSection = null;

  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      currentSection = heading[1].trim();
      const key = currentSection.toLowerCase();
      if (!sections.has(key)) sections.set(key, []);
      continue;
    }
    if (currentSection) {
      sections.get(currentSection.toLowerCase()).push(line);
    }
  }

  const statusValue = findFieldValue(lines, "Status");
  const assessmentSection = findSection(sections, ["Final Assessment"]);
  const assessmentValue =
    (assessmentSection &&
      findFieldValue(assessmentSection.body, "Assessment")) ??
    findFieldValue(lines, "Assessment");

  return {
    task: findFieldValue(lines, "Task"),
    status: extractState(statusValue),
    rawStatus: statusValue,
    reviewer: findFieldValue(lines, "Reviewer"),
    assessment: extractState(assessmentValue),
    sections,
  };
}

function checkEvidenceFields(evidence, taskId, display, failures) {
  if (!evidence.task) {
    failures.push(`${display} is missing the required **Task:** field`);
  } else if (evidence.task.includes("<")) {
    failures.push(
      `${display} still contains template placeholders in **Task:**`
    );
  } else if (evidence.task.toUpperCase() !== taskId) {
    failures.push(
      `${display} records task ${evidence.task} but the gate was run for ${taskId}`
    );
  }

  if (!evidence.status) {
    failures.push(
      `${display} is missing the required **Status:** field (one of: ${PROTOCOL_STATES.join(", ")})`
    );
  }

  for (const requirement of REQUIRED_EVIDENCE_SECTIONS) {
    const section = findSection(evidence.sections, requirement.names);
    if (!section) {
      failures.push(
        `${display} is missing the required ${requirement.label} section (expected one of: ${requirement.names
          .map((name) => `## ${name}`)
          .join(", ")})`
      );
      continue;
    }
    if (sectionIsEmpty(section.body)) {
      failures.push(
        `${display} has an empty "## ${section.name}" section; ${requirement.label} must be recorded`
      );
    }
  }
}

function checkRowStructure(
  root,
  row,
  failures,
  { requireEvidenceReference = false } = {}
) {
  if (!PROTOCOL_STATES.includes(row.status)) {
    failures.push(
      `backlog row ${row.id} has invalid status "${row.status}" (allowed: ${PROTOCOL_STATES.join(", ")})`
    );
  }

  if (!row.taskSpec) {
    failures.push(
      `backlog row ${row.id} does not reference a task specification path`
    );
  } else {
    const taskSpec = resolveRepoPath(root, row.taskSpec);
    if (!taskSpec.exists) {
      failures.push(
        `backlog row ${row.id} references a missing task file ${taskSpec.display}`
      );
    }
  }

  if (STATES_REQUIRING_EVIDENCE_FILE.includes(row.status) && row.evidence) {
    const evidence = resolveRepoPath(root, row.evidence);
    if (!evidence.exists) {
      failures.push(
        `backlog row ${row.id} is ${row.status} but its evidence record ${evidence.display} does not exist`
      );
    }
  } else if (
    STATES_REQUIRING_EVIDENCE_FILE.includes(row.status) &&
    !row.evidence &&
    requireEvidenceReference
  ) {
    failures.push(
      `backlog row ${row.id} is ${row.status} but does not reference an evidence record`
    );
  }
}

function checkDependencies(backlog, row, failures) {
  if (STATES_WITHOUT_DEPENDENCY_DEMAND.includes(row.status)) return;
  for (const dependency of row.dependsOn) {
    const dependencyRow = backlog.rows.find(
      (candidate) => candidate.id === dependency
    );
    if (!dependencyRow) {
      failures.push(
        `backlog row ${row.id} depends on ${dependency}, which has no row in the authoritative table`
      );
      continue;
    }
    if (dependencyRow.status !== "DONE") {
      failures.push(
        `backlog row ${row.id} is ${row.status} but its dependency ${dependency} is ${dependencyRow.status}; a task must not advance past READY while a dependency is incomplete`
      );
    }
  }
}

function checkTaskMode(root, backlog, taskId, failures, notes) {
  const row = backlog.rows.find((candidate) => candidate.id === taskId);
  if (!row) {
    failures.push(
      `no backlog row found for task ${taskId} in ${BACKLOG_RELATIVE_PATH}`
    );
    return {};
  }

  checkRowStructure(root, row, failures, { requireEvidenceReference: true });
  checkDependencies(backlog, row, failures);

  const taskSpec = row.taskSpec ? resolveRepoPath(root, row.taskSpec) : null;
  if (taskSpec?.exists) {
    const declared = findFieldValue(
      fs.readFileSync(taskSpec.absolute, "utf8").split(/\r?\n/),
      "Status"
    );
    const declaredState = extractState(declared);
    if (declaredState && declaredState !== row.status) {
      notes.push(
        `task file ${taskSpec.display} declares Status: ${declaredState} while the authoritative backlog row is ${row.status}; task-file status is planning metadata, not runtime state (non-fatal)`
      );
    }
  }

  const evidence = row.evidence ? resolveRepoPath(root, row.evidence) : null;
  if (evidence?.exists) {
    const record = parseEvidence(fs.readFileSync(evidence.absolute, "utf8"));
    checkEvidenceFields(record, taskId, evidence.display, failures);

    if (record.status && record.status !== row.status) {
      const recordedRank = STATE_RANK[record.status];
      const rowRank = STATE_RANK[row.status];
      if (
        recordedRank !== undefined &&
        rowRank !== undefined &&
        recordedRank > rowRank
      ) {
        failures.push(
          `backlog row ${row.id} is ${row.status} but ${evidence.display} records ${record.status}; the backlog is unreconciled with its own evidence record (reconcile the row explicitly; this gate never repairs state)`
        );
      } else {
        failures.push(
          `backlog row ${row.id} is ${row.status} but ${evidence.display} records ${record.status}; backlog state and evidence state must agree`
        );
      }
    }

    if (row.status === "DONE") {
      const corroborated =
        record.status === "DONE" || record.assessment === "DONE";
      if (!corroborated) {
        failures.push(
          `backlog row ${row.id} is DONE but ${evidence.display} records no DONE status or DONE assessment; a local agent must not mark a task DONE without corroborating evidence (DWB105 review is required)`
        );
      }
      if (record.reviewer && /pending/i.test(record.reviewer)) {
        notes.push(
          `${evidence.display} records "Reviewer: ${record.reviewer}" while the backlog row is DONE; confirm reviewer acceptance before treating the task as closed (non-fatal)`
        );
      }
    }
  } else if (row.status === "BLOCKED") {
    notes.push(
      `backlog row ${row.id} is BLOCKED without an evidence record; capture the blocker per the runbook failure protocol (non-fatal)`
    );
  }

  return {
    backlogStatus: row.status,
    taskSpec: taskSpec?.display ?? null,
    evidence: evidence?.display ?? null,
  };
}

function checkDuplicateIds(backlog, failures) {
  const seen = new Map();
  for (const row of backlog.rows) {
    if (seen.has(row.id)) {
      failures.push(
        `duplicate backlog row id ${row.id} at ${BACKLOG_RELATIVE_PATH}:${row.line} and line ${seen.get(row.id)}`
      );
    } else {
      seen.set(row.id, row.line);
    }
  }
}

/** Run the gate. Pure with respect to the filesystem: reads only. */
export function runSelfCheck({ root = process.cwd(), taskId = null } = {}) {
  const failures = [];
  const notes = [];
  const normalizedTaskId = taskId ? String(taskId).trim().toUpperCase() : null;
  const backlogPath = path.resolve(root, BACKLOG_RELATIVE_PATH);
  const backlogDisplay = toDisplay(root, backlogPath);

  if (!fs.existsSync(backlogPath)) {
    failures.push(
      `${backlogDisplay} does not exist; docs/BACKLOG.md is the authoritative lifecycle state`
    );
    return finalize(normalizedTaskId, failures, notes, {});
  }

  const backlog = parseBacklog(fs.readFileSync(backlogPath, "utf8"));
  if (!backlog.found) {
    failures.push(
      `could not locate the authoritative "## 14. Active Backlog" table in ${backlogDisplay}`
    );
  }
  for (const row of backlog.malformed) {
    failures.push(
      `malformed backlog row at ${backlogDisplay}:${row.line} (expected 8 columns): ${row.text}`
    );
  }
  if (backlog.rows.length === 0) {
    failures.push(
      `no task rows found in the authoritative backlog table (${backlogDisplay})`
    );
  }

  let details = {};
  if (normalizedTaskId) {
    details = checkTaskMode(root, backlog, normalizedTaskId, failures, notes);
  } else {
    checkDuplicateIds(backlog, failures);
    for (const row of backlog.rows) {
      checkRowStructure(root, row, failures);
      if (
        STATES_REQUIRING_EVIDENCE_FILE.includes(row.status) &&
        !row.evidence
      ) {
        notes.push(
          `backlog row ${row.id} is ${row.status} without a referenced evidence record (pre-existing state; not a failure in whole-backlog mode)`
        );
      }
    }
  }

  return finalize(normalizedTaskId, failures, notes, details);
}

function finalize(taskId, failures, notes, details) {
  return {
    ok: failures.length === 0,
    mode: taskId ? "task" : "backlog",
    taskId,
    failures,
    notes,
    ...details,
  };
}

/** Render the human-readable gate report. */
export function formatReport(result) {
  const lines = [result.ok ? "SELF-CHECK: PASS" : "SELF-CHECK: FAIL"];
  lines.push(
    result.mode === "task"
      ? `mode: task (${result.taskId})`
      : "mode: backlog (all rows, structural)"
  );
  if (result.backlogStatus)
    lines.push(`backlog status: ${result.backlogStatus}`);
  if (result.taskSpec) lines.push(`task file: ${result.taskSpec}`);
  if (result.evidence) lines.push(`evidence: ${result.evidence}`);
  if (result.failures.length > 0) {
    lines.push("failures:");
    for (const failure of result.failures) lines.push(`- ${failure}`);
  }
  if (result.notes.length > 0) {
    lines.push("notes (non-fatal):");
    for (const note of result.notes) lines.push(`- ${note}`);
  }
  return lines.join("\n");
}

const USAGE = [
  "Usage: node scripts/agent-self-check.mjs [TASK-ID] [--root <dir>]",
  "",
  "  TASK-ID     validate this task's backlog row, task file, and evidence record",
  "  --root      repository root to validate (default: current working directory)",
  "",
  "Exit codes: 0 = SELF-CHECK: PASS, 1 = SELF-CHECK: FAIL, 2 = usage error",
].join("\n");

function parseArgs(argv) {
  const args = argv.filter((arg) => arg !== "--");
  const options = { taskId: null, root: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--root") {
      const value = args[index + 1];
      if (!value) return { error: "--root requires a directory argument" };
      options.root = value;
      index += 1;
    } else if (arg.startsWith("--root=")) {
      options.root = arg.slice("--root=".length);
    } else if (arg === "--help" || arg === "-h") {
      return { help: true };
    } else if (arg.startsWith("-")) {
      return { error: `unknown option: ${arg}` };
    } else if (options.taskId === null) {
      options.taskId = arg;
    } else {
      return { error: `unexpected argument: ${arg}` };
    }
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.error) {
    process.stderr.write(`${options.error}\n\n${USAGE}\n`);
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }

  const root = path.resolve(options.root ?? process.cwd());
  const result = runSelfCheck({ root, taskId: options.taskId });
  process.stdout.write(`${formatReport(result)}\n`);
  process.exitCode = result.ok ? 0 : 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (
  invokedPath.toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()
) {
  main();
}
