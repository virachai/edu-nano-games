import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createShell,
  formatScore,
  nextShellState,
  starsFor,
} from "../shared/shell.js";

test("nextShellState: legal start → playing → paused → playing", () => {
  assert.equal(nextShellState("start", "start"), "playing");
  assert.equal(nextShellState("playing", "pause"), "paused");
  assert.equal(nextShellState("paused", "resume"), "playing");
});

test("nextShellState: gameover restarts or quits to start", () => {
  assert.equal(nextShellState("gameover", "restart"), "playing");
  assert.equal(nextShellState("gameover", "quit"), "start");
});

test("nextShellState: illegal events are no-ops, never throw", () => {
  assert.equal(nextShellState("start", "pause"), "start");
  assert.equal(nextShellState("start", "gameOver"), "start");
  assert.equal(nextShellState("paused", "gameOver"), "paused");
  assert.equal(nextShellState("gameover", "pause"), "gameover");
});

test("shell: start event moves to playing and notifies subscribers", () => {
  const shell = createShell();
  const seen = [];
  shell.subscribe((s) => seen.push(s.state));
  shell.send("start");
  assert.equal(shell.snapshot.state, "playing");
  assert.deepEqual(seen, ["playing"]);
});

test("shell: score/streak/level updates clamp and notify", () => {
  const shell = createShell();
  let latest;
  shell.subscribe((s) => (latest = s));
  shell.addScore(10);
  shell.addScore(-3);
  assert.equal(shell.snapshot.score, 7);
  shell.setStreak(5);
  shell.setLevel(2);
  assert.equal(shell.snapshot.streak, 5);
  assert.equal(shell.snapshot.level, 2);
  shell.setStreak(-9);
  assert.equal(shell.snapshot.streak, 0);
  shell.setLevel(0);
  assert.equal(shell.snapshot.level, 1);
  assert.ok(latest.score === 7);
});

test("shell: no notification when values do not change", () => {
  const shell = createShell();
  let calls = 0;
  shell.subscribe(() => calls++);
  shell.addScore(0);
  shell.setMuted(false);
  shell.send("pause"); // illegal from "start" → no-op
  assert.equal(calls, 0);
});

test("shell: restart and quit reset counters; muted persists", () => {
  const shell = createShell({ muted: true });
  shell.send("start");
  shell.addScore(50);
  shell.setLevel(3);
  shell.setStreak(4);
  shell.send("gameOver");
  shell.send("restart");
  assert.equal(shell.snapshot.state, "playing");
  assert.equal(shell.snapshot.score, 0);
  assert.equal(shell.snapshot.streak, 0);
  assert.equal(shell.snapshot.level, 1);
  shell.send("gameOver");
  shell.send("quit");
  assert.equal(shell.snapshot.state, "start");
  assert.equal(shell.snapshot.muted, true);
});

test("shell: unsubscribe stops notifications", () => {
  const shell = createShell();
  let calls = 0;
  const off = shell.subscribe(() => calls++);
  shell.addScore(1);
  off();
  shell.addScore(1);
  assert.equal(calls, 1);
});

test("starsFor: thresholds 90/70/40 percent", () => {
  assert.equal(starsFor(90, 100), 3);
  assert.equal(starsFor(89, 100), 2);
  assert.equal(starsFor(70, 100), 2);
  assert.equal(starsFor(69, 100), 1);
  assert.equal(starsFor(40, 100), 1);
  assert.equal(starsFor(39, 100), 0);
  assert.equal(starsFor(0, 0), 3, "maxScore 0 → all stars");
  assert.equal(starsFor(-1, 100), 0);
});

test("formatScore: zero-padded, clamps negatives", () => {
  assert.equal(formatScore(0), "000000");
  assert.equal(formatScore(42), "000042");
  assert.equal(formatScore(123456), "123456");
  assert.equal(formatScore(1234567), "999999", "saturates at 999999");
  assert.equal(formatScore(-5), "000000");
});
