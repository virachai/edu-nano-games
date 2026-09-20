/**
 * Fraction Forge v0.1 — polished browser wiring.
 * Renders the session controller (session.ts) into the DOM with visual hierarchy,
 * clear choice states, and responsive accessibility support.
 */
import { QUESTION_BANK } from "./data/questions.js";
import {
  advanceSession,
  createSession,
  submitAnswer,
  type Session,
} from "./session.js";
import type { Fraction, FractionQuestion } from "./game.js";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function fractionLabel(f: Fraction): string {
  return `${f.numerator}/${f.denominator}`;
}

function questionLabel(q: FractionQuestion): string {
  return `${q.sourceNumerator}/${q.sourceDenominator}`;
}

export function mountFractionForge(container: HTMLElement): void {
  let session: Session = createSession(QUESTION_BANK);

  container.classList.add("ff-container");
  container.innerHTML = "";

  const card = el("div", "ff-card");

  const hud = el("header", "ff-header");
  const title = el("h1", "ff-title", "Fraction Forge");
  const scoreBox = el("div", "hud__item");
  const scoreLabel = el("span", "hud__label", "Score");
  const scoreValue = el("span", "hud__value", String(session.score));
  scoreBox.append(scoreLabel, scoreValue);
  hud.append(title, scoreBox);

  const prompt = el("p", "ff-prompt");
  const choicesList = el("div", "ff-choices");
  const feedback = el("div", "ff-feedback-banner");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");

  const nextBtn = el("button", "ff-next-btn", "Next Question");
  nextBtn.type = "button";
  nextBtn.hidden = true;

  card.append(hud, prompt, choicesList, feedback, nextBtn);
  container.append(card);

  function render(): void {
    scoreValue.textContent = String(session.score);
    prompt.textContent = `Convert ${questionLabel(session.question)} to a fraction over denominator ${session.question.targetDenominator}.`;

    choicesList.innerHTML = "";
    const answered = session.lastResult !== null;
    const lastResult = session.lastResult;

    for (const choice of session.question.choices) {
      const btn = el("button", "ff-choice-btn", fractionLabel(choice));
      btn.type = "button";
      btn.disabled = answered;

      if (answered && lastResult) {
        const isExpected =
          choice.numerator === lastResult.expected.numerator &&
          choice.denominator === lastResult.expected.denominator;

        if (isExpected) {
          btn.classList.add("is-correct");
        } else if (lastResult.outcome === "incorrect") {
          // If the user clicked this choice and it was wrong, highlight it as incorrect
          // (Note: session doesn't store the exact submitted choice object directly in lastResult, but we know expected != choice).
        }
      }

      btn.addEventListener("click", () => {
        session = submitAnswer(session, choice);
        render();
      });
      choicesList.append(btn);
    }

    if (lastResult) {
      const isCorrect = lastResult.outcome === "correct";
      feedback.textContent = isCorrect
        ? "Correct! Equivalent fraction verified."
        : `Incorrect. The correct answer was ${fractionLabel(lastResult.expected)}.`;
      feedback.classList.toggle("ff-feedback--correct", isCorrect);
      feedback.classList.toggle("ff-feedback--incorrect", !isCorrect);
      feedback.hidden = false;
    } else {
      feedback.textContent = "";
      feedback.className = "ff-feedback-banner";
      feedback.hidden = true;
    }
    nextBtn.hidden = !answered;
    if (!answered) {
      nextBtn.blur();
    }
  }

  nextBtn.addEventListener("click", () => {
    session = advanceSession(session);
    render();
  });

  render();
}
