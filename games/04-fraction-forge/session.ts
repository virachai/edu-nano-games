/**
 * Fraction Forge v0.1 — pure session controller.
 * Framework-independent session state (current question, score, last
 * result) built on top of the GAME-001.2 semantic model. No DOM, timers,
 * persistence, or progression beyond the session score contract.
 */
import {
  evaluateAnswer,
  type AnswerResult,
  type Fraction,
  type FractionQuestion,
} from "./game.js";

export interface Session {
  readonly bank: readonly FractionQuestion[];
  readonly index: number;
  readonly previousIndex: number;
  readonly question: FractionQuestion;
  readonly score: number;
  readonly lastResult: AnswerResult | null;
  /** The exact choice the user submitted for lastResult, so the UI can
   * distinguish the submitted wrong choice from the expected correct one.
   * Not part of the GAME-001.2 semantic contract; UI-facing only. */
  readonly lastSubmitted: Fraction | null;
}

/**
 * Returns a new array containing the same choice values in a randomized
 * order, via an injectable Fisher-Yates shuffle. Never mutates the input.
 */
export function shuffleChoices(
  choices: readonly Fraction[],
  randomizer: () => number = Math.random,
): Fraction[] {
  const result = [...choices];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomizer() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Returns a copy of the question with its choices in randomized order; the bank entry itself is never mutated. */
function withShuffledChoices(
  question: FractionQuestion,
  randomizer: () => number,
): FractionQuestion {
  return { ...question, choices: shuffleChoices(question.choices, randomizer) };
}

/** Starts a session at the first question of a non-empty bank, with its choices shuffled. */
export function createSession(
  bank: readonly FractionQuestion[],
  choiceRandomizer: () => number = Math.random,
): Session {
  if (bank.length === 0) {
    throw new RangeError("bank must be non-empty");
  }
  return {
    bank,
    index: 0,
    previousIndex: -1,
    question: withShuffledChoices(bank[0], choiceRandomizer),
    score: 0,
    lastResult: null,
    lastSubmitted: null,
  };
}

/**
 * Submits an answer for the session's current question, updating the score
 * by the semantic scoreDelta and recording the result for UI feedback.
 * The question does not advance; call advanceSession for Next Question.
 */
export function submitAnswer(session: Session, submitted: Fraction): Session {
  const result = evaluateAnswer(session.question, submitted);
  return {
    ...session,
    score: session.score + result.scoreDelta,
    lastResult: result,
    lastSubmitted: submitted,
  };
}

/**
 * Advances to the next question, using an injectable randomizer to select a
 * different question and a separately injectable randomizer to shuffle that
 * question's choice order.
 */
export function advanceSession(
  session: Session,
  randomizer: () => number = Math.random,
  choiceRandomizer: () => number = Math.random,
): Session {
  let newIndex = session.index;
  if (session.bank.length > 1) {
    // With only two questions, the previous index and the only valid
    // alternative can coincide, so previousIndex exclusion is only
    // enforceable (without looping forever) when a third option exists.
    const excludePrevious = session.bank.length > 2;
    do {
      newIndex = Math.floor(randomizer() * session.bank.length);
    } while (newIndex === session.index || (excludePrevious && newIndex === session.previousIndex));
  }
  return {
    ...session,
    index: newIndex,
    previousIndex: session.index,
    question: withShuffledChoices(session.bank[newIndex], choiceRandomizer),
    lastResult: null,
    lastSubmitted: null,
  };
}
