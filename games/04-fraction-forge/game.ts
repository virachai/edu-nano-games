/**
 * Game 4 — Fraction Forge (semantic model).
 * Framework-independent equivalent-fraction question model and answer
 * validation for v0.1, per docs/tasks/GAME-001.1.md and GAME-001.2.md.
 * No browser rendering, UI, timers, persistence, or scoring beyond the
 * minimal session-score contract may be introduced here.
 */

export const GAME_ID = "fraction-forge" as const;

/** A fraction expressed as an integer numerator/denominator pair. */
export interface Fraction {
  readonly numerator: number;
  readonly denominator: number;
}

/** A single Fraction Forge question: convert a/b to an equivalent fraction over targetDenominator. */
export interface FractionQuestion {
  readonly sourceNumerator: number;
  readonly sourceDenominator: number;
  readonly targetDenominator: number;
  readonly choices: readonly Fraction[];
}

export type QuestionOutcome = "correct" | "incorrect";

export interface AnswerResult {
  readonly outcome: QuestionOutcome;
  readonly expected: Fraction;
  readonly scoreDelta: 0 | 1;
}

/**
 * Builds a question, validating the GAME-001.1 semantic contract:
 * sourceDenominator > 0, targetDenominator > 0, and targetDenominator must be
 * a positive integer multiple of sourceDenominator.
 */
export function createFractionQuestion(
  sourceNumerator: number,
  sourceDenominator: number,
  targetDenominator: number,
  choices: readonly Fraction[],
): FractionQuestion {
  if (!Number.isInteger(sourceDenominator) || sourceDenominator <= 0) {
    throw new RangeError("sourceDenominator must be a positive integer");
  }
  if (!Number.isInteger(targetDenominator) || targetDenominator <= 0) {
    throw new RangeError("targetDenominator must be a positive integer");
  }
  if (targetDenominator % sourceDenominator !== 0) {
    throw new RangeError(
      "targetDenominator must be a positive integer multiple of sourceDenominator",
    );
  }
  if (choices.length === 0) {
    throw new RangeError("choices must be non-empty");
  }
  const question: FractionQuestion = {
    sourceNumerator,
    sourceDenominator,
    targetDenominator,
    choices,
  };
  const correctCount = choices.filter((c) => validateAnswer(question, c)).length;
  if (correctCount !== 1) {
    throw new RangeError("choices must contain exactly one correct choice");
  }
  return question;
}

/** Deterministically derives the expected equivalent fraction for a question. */
export function expectedFraction(question: FractionQuestion): Fraction {
  const multiplier = question.targetDenominator / question.sourceDenominator;
  return {
    numerator: question.sourceNumerator * multiplier,
    denominator: question.targetDenominator,
  };
}

/**
 * Validates a submitted answer against the question's expected fraction.
 * Correct requires exact numerator AND denominator equality; a numerator
 * match with a denominator mismatch is incorrect.
 */
export function validateAnswer(
  question: FractionQuestion,
  submitted: Fraction,
): boolean {
  const expected = expectedFraction(question);
  return (
    submitted.numerator === expected.numerator &&
    submitted.denominator === expected.denominator
  );
}

/**
 * Evaluates a submitted answer and returns the deterministic outcome plus
 * the session-score contribution defined by GAME-001.1 (correct: 1, incorrect: 0).
 */
export function evaluateAnswer(
  question: FractionQuestion,
  submitted: Fraction,
): AnswerResult {
  const isCorrect = validateAnswer(question, submitted);
  return {
    outcome: isCorrect ? "correct" : "incorrect",
    expected: expectedFraction(question),
    scoreDelta: isCorrect ? 1 : 0,
  };
}
