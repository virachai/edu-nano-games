/**
 * Fraction Forge v0.1 — browser wiring.
 * Renders the session controller (session.ts) into the DOM. No fraction
 * math or scoring logic lives here; it only reads Session state and
 * forwards user choices to submitAnswer/advanceSession.
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

  container.classList.add("shell-root");
  container.innerHTML = "";

  const hud = el("header", "hud");
  const scoreValue = el("span", "hud__value", String(session.score));
  const scoreBox = el("div", "hud__item");
  scoreBox.append(el("span", "hud__label", "Score"), scoreValue);
  hud.append(scoreBox);

  const prompt = el("p", "ff-prompt");
  const choicesList = el("div", "ff-choices");
  const feedback = el("p", "announcer");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");

  const nextBtn = el("button", "btn", "Next question");
  nextBtn.type = "button";
  nextBtn.hidden = true;

  container.append(hud, prompt, choicesList, feedback, nextBtn);

  function render(): void {
    scoreValue.textContent = String(session.score);
    prompt.textContent = `Convert ${questionLabel(session.question)} to a fraction over ${session.question.targetDenominator}.`;

    choicesList.innerHTML = "";
    const answered = session.lastResult !== null;
    for (const choice of session.question.choices) {
      const btn = el("button", "btn btn--secondary", fractionLabel(choice));
      btn.type = "button";
      btn.disabled = answered;
      btn.addEventListener("click", () => {
        session = submitAnswer(session, choice);
        render();
      });
      choicesList.append(btn);
    }

    if (session.lastResult) {
      feedback.textContent =
        session.lastResult.outcome === "correct" ? "Correct!" : "Incorrect.";
      feedback.classList.toggle(
        "ff-feedback--correct",
        session.lastResult.outcome === "correct",
      );
      feedback.classList.toggle(
        "ff-feedback--incorrect",
        session.lastResult.outcome === "incorrect",
      );
    } else {
      feedback.textContent = "";
      feedback.classList.remove("ff-feedback--correct", "ff-feedback--incorrect");
    }
    nextBtn.hidden = !answered;
  }

  nextBtn.addEventListener("click", () => {
    session = advanceSession(session);
    render();
  });

  render();
}
