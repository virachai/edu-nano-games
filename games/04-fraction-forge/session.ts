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
  readonly question: FractionQuestion;
  readonly score: number;
  readonly lastResult: AnswerResult | null;
}

/** Starts a session at the first question of a non-empty bank. */
export function createSession(bank: readonly FractionQuestion[]): Session {
  if (bank.length === 0) {
    throw new RangeError("bank must be non-empty");
  }
  return {
    bank,
    index: 0,
    question: bank[0],
    score: 0,
    lastResult: null,
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
  };
}

/** Advances to the next question, cycling back to the start of the bank. */
export function advanceSession(session: Session): Session {
  const index = (session.index + 1) % session.bank.length;
  return {
    ...session,
    index,
    question: session.bank[index],
    lastResult: null,
  };
}
