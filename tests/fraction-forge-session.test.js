import assert from "node:assert/strict";
import { test } from "node:test";
import { createFractionQuestion } from "../games/04-fraction-forge/game.js";
import {
  advanceSession,
  createSession,
  shuffleChoices,
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
  assert.equal(session.question.sourceNumerator, bank[0].sourceNumerator);
  assert.equal(session.question.sourceDenominator, bank[0].sourceDenominator);
  assert.equal(session.question.targetDenominator, bank[0].targetDenominator);
  assert.deepEqual(
    [...session.question.choices].sort((a, b) => a.numerator - b.numerator),
    [...bank[0].choices].sort((a, b) => a.numerator - b.numerator),
  );
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

test("submitAnswer: records the exact submitted choice as lastSubmitted", () => {
  const session = createSession(bank);
  const submitted = { numerator: 1, denominator: 4 };
  const next = submitAnswer(session, submitted);
  assert.deepEqual(next.lastSubmitted, submitted);
});

test("createSession and advanceSession: lastSubmitted starts and resets to null", () => {
  const session = createSession(bank);
  assert.equal(session.lastSubmitted, null);
  const answered = submitAnswer(session, { numerator: 2, denominator: 4 });
  assert.notEqual(answered.lastSubmitted, null);
  const next = advanceSession(answered, () => 0.5);
  assert.equal(next.lastSubmitted, null);
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
    assert.equal(next.question.sourceNumerator, bank[0].sourceNumerator);
    assert.equal(next.question.sourceDenominator, bank[0].sourceDenominator);
    assert.equal(next.question.targetDenominator, bank[0].targetDenominator);
    assert.deepEqual(
      [...next.question.choices].sort((a, b) => a.numerator - b.numerator),
      [...bank[0].choices].sort((a, b) => a.numerator - b.numerator),
    );
});

test("shuffleChoices: deterministic randomizer produces a known permutation", () => {
  const choices = [
    { numerator: 1, denominator: 4 },
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
  ];
  // Fisher-Yates with a constant 0 always swaps i with index 0.
  const result = shuffleChoices(choices, () => 0);
  assert.deepEqual(result, [
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
    { numerator: 1, denominator: 4 },
  ]);
});

test("shuffleChoices: a different randomizer produces a different order", () => {
  const choices = [
    { numerator: 1, denominator: 4 },
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
  ];
  const a = shuffleChoices(choices, () => 0);
  const b = shuffleChoices(choices, () => 0.99);
  assert.notDeepEqual(a, b);
});

test("shuffleChoices: preserves the same choice set (order-independent)", () => {
  const choices = [
    { numerator: 1, denominator: 4 },
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
  ];
  const result = shuffleChoices(choices, () => 0.42);
  assert.deepEqual(
    [...result].sort((a, b) => a.numerator - b.numerator),
    [...choices].sort((a, b) => a.numerator - b.numerator),
  );
});

test("shuffleChoices: does not mutate the source array", () => {
  const choices = [
    { numerator: 1, denominator: 4 },
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
  ];
  const original = [...choices];
  shuffleChoices(choices, () => 0);
  assert.deepEqual(choices, original);
});

test("shuffleChoices: single-choice bank is a valid no-op", () => {
  const choices = [{ numerator: 2, denominator: 4 }];
  const result = shuffleChoices(choices, () => 0.5);
  assert.deepEqual(result, choices);
});

test("shuffleChoices: two-choice bank preserves both values", () => {
  const choices = [
    { numerator: 1, denominator: 4 },
    { numerator: 2, denominator: 4 },
  ];
  const result = shuffleChoices(choices, () => 0.99);
  assert.deepEqual(
    [...result].sort((a, b) => a.numerator - b.numerator),
    choices,
  );
});

test("createSession: shuffles the initial question's choices without mutating the bank", () => {
  const originalChoices = bank[0].choices.map((c) => ({ ...c }));
  const session = createSession(bank, () => 0);
  assert.notDeepEqual(session.question.choices, bank[0].choices);
  assert.deepEqual(bank[0].choices, originalChoices);
  assert.deepEqual(
    [...session.question.choices].sort((a, b) => a.numerator - b.numerator),
    [...bank[0].choices].sort((a, b) => a.numerator - b.numerator),
  );
  // Non-choice fields are preserved exactly.
  assert.equal(session.question.sourceNumerator, bank[0].sourceNumerator);
  assert.equal(session.question.targetDenominator, bank[0].targetDenominator);
});

test("createSession: default randomizer still yields a valid session (choices set unchanged)", () => {
  const session = createSession(bank);
  assert.deepEqual(
    [...session.question.choices].sort((a, b) => a.numerator - b.numerator),
    [...bank[0].choices].sort((a, b) => a.numerator - b.numerator),
  );
});

test("advanceSession: shuffles the new question's choices via an injectable choiceRandomizer without mutating the bank", () => {
  const session = createSession(bank, () => 0);
  const next = advanceSession(session, () => 0.5, () => 0);
  const targetBankQuestion = bank[next.index];
  const originalChoices = targetBankQuestion.choices.map((c) => ({ ...c }));
  assert.deepEqual(
    [...next.question.choices].sort((a, b) => a.numerator - b.numerator),
    [...originalChoices].sort((a, b) => a.numerator - b.numerator),
  );
  assert.deepEqual(targetBankQuestion.choices, originalChoices);
});

test("advanceSession: exactly one correct choice remains after shuffling", () => {
  const session = createSession(bank, () => 0.5);
  const next = advanceSession(session, () => 0.5, () => 0.9);
  const correct = next.question.choices.filter((choice) =>
    submitAnswer(next, choice).lastResult.outcome === "correct",
  );
  assert.equal(correct.length, 1);
});

test("submitAnswer: score and lastSubmitted behavior still correct with shuffled choice order", () => {
  const session = createSession(bank, () => 0);
  const correctChoice = session.question.choices.find(
    (choice) => submitAnswer(session, choice).lastResult.outcome === "correct",
  );
  const next = submitAnswer(session, correctChoice);
  assert.equal(next.score, 1);
  assert.equal(next.lastResult.outcome, "correct");
  assert.deepEqual(next.lastSubmitted, correctChoice);
});

test("advanceSession: still avoids consecutive question repeats with choice shuffling enabled", () => {
  let session = createSession(bank, () => 0);
  for (let i = 0; i < 10; i += 1) {
    const previousQuestionShape = {
      sourceNumerator: session.question.sourceNumerator,
      sourceDenominator: session.question.sourceDenominator,
      targetDenominator: session.question.targetDenominator,
    };
    session = advanceSession(session, undefined, () => 0.5);
    assert.notDeepEqual(
      {
        sourceNumerator: session.question.sourceNumerator,
        sourceDenominator: session.question.sourceDenominator,
        targetDenominator: session.question.targetDenominator,
      },
      previousQuestionShape,
    );
  }
});

test("QUESTION_BANK: is a non-empty, semantically valid fixed question bank playable via session/advance", () => {
  assert.ok(QUESTION_BANK.length > 1);
  let session = createSession(QUESTION_BANK);
  assert.equal(session.question.sourceNumerator, QUESTION_BANK[0].sourceNumerator);
  assert.equal(session.question.sourceDenominator, QUESTION_BANK[0].sourceDenominator);
  assert.equal(session.question.targetDenominator, QUESTION_BANK[0].targetDenominator);
  for (let i = 0; i < 10; i += 1) {
    const previousQuestion = session.question;
    session = advanceSession(session);
    assert.notDeepEqual(session.question, previousQuestion);
  }
});
