import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createFractionQuestion,
  evaluateAnswer,
  expectedFraction,
  validateAnswer,
} from "../games/04-fraction-forge/game.js";

test("createFractionQuestion: rejects non-positive source denominator", () => {
  assert.throws(() => createFractionQuestion(1, 0, 4, [{ numerator: 4, denominator: 4 }]));
  assert.throws(() => createFractionQuestion(1, -2, 4, [{ numerator: 4, denominator: 4 }]));
});

test("createFractionQuestion: rejects non-positive target denominator", () => {
  assert.throws(() => createFractionQuestion(1, 2, 0, [{ numerator: 4, denominator: 4 }]));
  assert.throws(() => createFractionQuestion(1, 2, -4, [{ numerator: 4, denominator: 4 }]));
});

test("createFractionQuestion: rejects target denominator not a multiple of source", () => {
  assert.throws(() => createFractionQuestion(1, 3, 4, [{ numerator: 4, denominator: 4 }]));
});

test("createFractionQuestion: rejects empty choices", () => {
  assert.throws(() => createFractionQuestion(1, 2, 4, []));
});

test("createFractionQuestion: rejects choices with no correct choice", () => {
  assert.throws(() => createFractionQuestion(1, 2, 4, [{ numerator: 1, denominator: 4 }]), RangeError);
});

test("createFractionQuestion: rejects choices with more than one correct choice", () => {
  const dup = { numerator: 2, denominator: 4 };
  assert.throws(() => createFractionQuestion(1, 2, 4, [dup, { ...dup }]), RangeError);
});

test("expectedFraction: derives numerator via multiplier k = target/source", () => {
  const q = createFractionQuestion(1, 2, 6, [{ numerator: 3, denominator: 6 }]);
  assert.deepEqual(expectedFraction(q), { numerator: 3, denominator: 6 });
});

test("expectedFraction: multiplier of 1 is the identity conversion", () => {
  const q = createFractionQuestion(5, 8, 8, [{ numerator: 5, denominator: 8 }]);
  assert.deepEqual(expectedFraction(q), { numerator: 5, denominator: 8 });
});

test("validateAnswer: exact numerator and denominator match is correct", () => {
  const q = createFractionQuestion(1, 2, 6, [{ numerator: 3, denominator: 6 }]);
  assert.equal(validateAnswer(q, { numerator: 3, denominator: 6 }), true);
});

test("validateAnswer: numerator match with denominator mismatch is incorrect", () => {
  const q = createFractionQuestion(1, 2, 6, [{ numerator: 3, denominator: 6 }]);
  assert.equal(validateAnswer(q, { numerator: 3, denominator: 4 }), false);
});

test("validateAnswer: denominator match with numerator mismatch is incorrect", () => {
  const q = createFractionQuestion(1, 2, 6, [{ numerator: 3, denominator: 6 }]);
  assert.equal(validateAnswer(q, { numerator: 2, denominator: 6 }), false);
});

test("validateAnswer: wholly incorrect answer is incorrect", () => {
  const q = createFractionQuestion(1, 2, 6, [{ numerator: 3, denominator: 6 }]);
  assert.equal(validateAnswer(q, { numerator: 1, denominator: 2 }), false);
});

test("evaluateAnswer: correct answer yields outcome=correct and scoreDelta=1", () => {
  const q = createFractionQuestion(2, 3, 9, [{ numerator: 6, denominator: 9 }]);
  const result = evaluateAnswer(q, { numerator: 6, denominator: 9 });
  assert.equal(result.outcome, "correct");
  assert.equal(result.scoreDelta, 1);
  assert.deepEqual(result.expected, { numerator: 6, denominator: 9 });
});

test("evaluateAnswer: incorrect answer yields outcome=incorrect and scoreDelta=0", () => {
  const q = createFractionQuestion(2, 3, 9, [{ numerator: 6, denominator: 9 }]);
  const result = evaluateAnswer(q, { numerator: 5, denominator: 9 });
  assert.equal(result.outcome, "incorrect");
  assert.equal(result.scoreDelta, 0);
});
