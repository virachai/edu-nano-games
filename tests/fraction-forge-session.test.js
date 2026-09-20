import assert from "node:assert/strict";
import { test } from "node:test";
import { createFractionQuestion } from "../games/04-fraction-forge/game.js";
import {
  advanceSession,
  createSession,
  submitAnswer,
} from "../games/04-fraction-forge/session.js";
import { QUESTION_BANK } from "../games/04-fraction-forge/data/questions.js";

const bank = [
  createFractionQuestion(1, 2, 4, [
    { numerator: 1, denominator: 4 },
    { numerator: 2, denominator: 4 },
  ]),
  createFractionQuestion(1, 3, 6, [
    { numerator: 1, denominator: 6 },
    { numerator: 2, denominator: 6 },
  ]),
  createFractionQuestion(1, 4, 8, [
    { numerator: 1, denominator: 8 },
    { numerator: 2, denominator: 8 },
  ]),
];

test("createSession: rejects an empty bank", () => {
  assert.throws(() => createSession([]), RangeError);
});

test("createSession: starts at the first question with score 0 and no result", () => {
  const session = createSession(bank);
  assert.equal(session.index, 0);
  assert.deepEqual(session.question, bank[0]);
  assert.equal(session.score, 0);
  assert.equal(session.lastResult, null);
  assert.equal(session.previousIndex, -1);
});

test("submitAnswer: correct choice increments score by 1 and records the result", () => {
  const session = createSession(bank);
  const next = submitAnswer(session, { numerator: 2, denominator: 4 });
  assert.equal(next.score, 1);
  assert.equal(next.lastResult.outcome, "correct");
  assert.equal(next.index, session.index);
  assert.deepEqual(next.question, session.question);
});

test("submitAnswer: incorrect choice leaves score unchanged and records the result", () => {
  const session = createSession(bank);
  const next = submitAnswer(session, { numerator: 1, denominator: 4 });
  assert.equal(next.score, 0);
  assert.equal(next.lastResult.outcome, "incorrect");
});

test("submitAnswer: does not mutate the original session", () => {
  const session = createSession(bank);
  submitAnswer(session, { numerator: 2, denominator: 4 });
  assert.equal(session.score, 0);
  assert.equal(session.lastResult, null);
});

test("advanceSession: clears lastResult, preserves score, and does not mutate the original", () => {
  const answered = submitAnswer(createSession(bank), {
    numerator: 2,
    denominator: 4,
  });
  const next = advanceSession(answered, () => 0.5);
  assert.equal(next.lastResult, null);
  assert.equal(next.score, answered.score);
  assert.notEqual(next.index, answered.index);
  assert.equal(answered.score, 1);
  assert.equal(answered.lastResult.outcome, "correct");
  assert.equal(answered.index, 0);
});

test("advanceSession: selects a new question and avoids consecutive repeats", () => {
  const session = createSession(bank);
  // Force index 1
  let next = advanceSession(session, () => 0.5); // Math.floor(0.5 * 3) = 1
  assert.equal(next.index, 1);
  assert.equal(next.previousIndex, 0);

  // Force index 2
  next = advanceSession(next, () => 0.7); // Math.floor(0.7 * 3) = 2
  assert.equal(next.index, 2);
  assert.equal(next.previousIndex, 1);
});

test("advanceSession: handles small bank correctly", () => {
    const smallBank = [bank[0], bank[1]];
    const session = createSession(smallBank);

    // index 0 -> 1
    const next = advanceSession(session, () => 0.9); // force 1
    assert.equal(next.index, 1);

    // index 1 -> 0 (cannot stay 1, cannot be previous 0 if possible, but 0 is only option)
    const next2 = advanceSession(next, () => 0.1); // force 0
    assert.equal(next2.index, 0);
});

test("advanceSession: keeps same question for single-item bank", () => {
    const singleBank = [bank[0]];
    const session = createSession(singleBank);
    const next = advanceSession(session);
    assert.equal(next.index, 0);
    assert.deepEqual(next.question, bank[0]);
});

test("QUESTION_BANK: is a non-empty, semantically valid fixed question bank playable via session/advance", () => {
  assert.ok(QUESTION_BANK.length > 1);
  let session = createSession(QUESTION_BANK);
  assert.deepEqual(session.question, QUESTION_BANK[0]);
  for (let i = 0; i < 10; i += 1) {
    const previousQuestion = session.question;
    session = advanceSession(session);
    assert.notDeepEqual(session.question, previousQuestion);
  }
});
