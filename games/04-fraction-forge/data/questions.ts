/**
 * Fraction Forge v0.1 — fixed question bank.
 * Content lives here, separate from game logic, per the repo's data/*.ts
 * convention. Each entry is built through createFractionQuestion so the
 * GAME-001.1 exactly-one-correct-choice and denominator-multiple invariants
 * are enforced at module load time.
 */
import { createFractionQuestion, type FractionQuestion } from "../game.js";

export const QUESTION_BANK: readonly FractionQuestion[] = [
  createFractionQuestion(1, 2, 4, [
    { numerator: 1, denominator: 4 },
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
  ]),
  createFractionQuestion(1, 3, 6, [
    { numerator: 1, denominator: 6 },
    { numerator: 2, denominator: 6 },
    { numerator: 4, denominator: 6 },
  ]),
  createFractionQuestion(2, 3, 9, [
    { numerator: 5, denominator: 9 },
    { numerator: 6, denominator: 9 },
    { numerator: 7, denominator: 9 },
  ]),
  createFractionQuestion(3, 4, 8, [
    { numerator: 5, denominator: 8 },
    { numerator: 6, denominator: 8 },
    { numerator: 7, denominator: 8 },
  ]),
  createFractionQuestion(1, 5, 10, [
    { numerator: 1, denominator: 10 },
    { numerator: 2, denominator: 10 },
    { numerator: 3, denominator: 10 },
  ]),
];
