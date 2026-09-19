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

test("advanceSession: moves to the next question and clears lastResult", () => {
  const session = submitAnswer(createSession(bank), {
    numerator: 2,
    denominator: 4,
  });
  const next = advanceSession(session);
  assert.equal(next.index, 1);
  assert.deepEqual(next.question, bank[1]);
  assert.equal(next.lastResult, null);
  assert.equal(next.score, session.score);
});

test("advanceSession: cycles back to the first question at the end of the bank", () => {
  let session = createSession(bank);
  session = advanceSession(session);
  session = advanceSession(session);
  assert.equal(session.index, 0);
  assert.deepEqual(session.question, bank[0]);
});

test("QUESTION_BANK: is a non-empty, semantically valid fixed question bank", () => {
  assert.ok(QUESTION_BANK.length > 0);
  const session = createSession(QUESTION_BANK);
  assert.deepEqual(session.question, QUESTION_BANK[0]);
});
