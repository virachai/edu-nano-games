/**
 * Browser wiring for the shared shell: mounts the HUD + overlays into a
 * container and drives them from the pure state machine in shell.ts.
 *
 * NOTE: intentionally NOT typechecked (root tsconfigs cover only the pure
 * logic modules) and NOT unit-tested — verified in-browser per the plan
 * ("game logic stays UI-independent and testable without a browser").
 *
 * Import from a game's game.ts:
 *   import { mountShell } from "../../shared/shell-dom.js";
 *   const shell = mountShell(document.querySelector("#app")!, gameHooks);
 */

import {
  createShell,
  formatScore,
  starsFor,
  type Shell,
  type ShellEventType,
  type ShellSnapshot,
} from "./shell.js";
import { createSfx, type Sfx, type SfxName } from "./audio.js";
import { getStorage, saveBestScore, type StorageLike } from "./storage.js";

/** Hooks a game implements so the shell can drive its lifecycle. */
export interface GameHooks {
  /** Called on every state change; show/hide your play area here. */
  onStateChange?(snapshot: ShellSnapshot): void;
  /** Called when a run starts (including restarts from game over). */
  onStart?(): void;
}

export interface ShellDom {
  shell: Shell;
  sfx: Sfx;
  announce(message: string): void;
  destroy(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Translate a UI event into shell state changes, persisting the best
 * score when a run ends.
 */
function handleUiEvent(
  shell: Shell,
  sfx: Sfx,
  event: ShellEventType,
  hooks: GameHooks,
  store: StorageLike,
  gameId: string
): void {
  if (event === "start" || event === "restart") {
    hooks.onStart?.();
  }
  if (event === "gameOver") {
    saveBestScore(store, gameId, shell.snapshot.score);
    sfx.play("gameOver");
  }
  shell.send(event);
}

export function mountShell(
  container: HTMLElement,
  hooks: GameHooks,
  options: { gameId?: string; sfx?: Sfx; store?: StorageLike } = {}
): ShellDom {
  const gameId = options.gameId ?? "default";
  const sfx = options.sfx ?? createSfx();
  const store = options.store ?? getStorage();
  const shell = createShell();

  container.classList.add("shell-root");
  container.innerHTML = "";

  // HUD ---------------------------------------------------------------------
  const hud = el("header", "hud");
  const scoreValue = el("span", "hud__value", formatScore(0));
  const streakValue = el("span", "hud__value", "0");
  const levelValue = el("span", "hud__value", "1");
  const item = (label: string, value: HTMLElement) => {
    const box = el("div", "hud__item");
    box.append(el("span", "hud__label", label), value);
    return box;
  };
  const muteBtn = el("button", "btn btn--secondary", "🔊");
  muteBtn.type = "button";
  muteBtn.setAttribute("aria-pressed", "false");
  muteBtn.setAttribute("aria-label", "Toggle sound");
  hud.append(
    item("Score", scoreValue),
    item("Streak", streakValue),
    item("Level", levelValue),
    muteBtn
  );

  // Screen-reader announcer (ARIA live region for game state changes).
  const announcer = el("p", "announcer");
  announcer.setAttribute("role", "status");
  announcer.setAttribute("aria-live", "polite");

  // Overlays ----------------------------------------------------------------
  const startOverlay = el("section", "overlay");
  startOverlay.append(
    el("h2", "overlay__title", "Ready to play?"),
    el("p", undefined, "Press Start — or press Enter.")
  );
  const startBtn = el("button", "btn", "Start");
  startBtn.type = "button";
  startOverlay.append(startBtn);

  const pausedOverlay = el("section", "overlay");
  pausedOverlay.append(el("h2", "overlay__title", "Paused"));
  const resumeBtn = el("button", "btn", "Resume");
  resumeBtn.type = "button";
  pausedOverlay.append(resumeBtn);

  const gameoverOverlay = el("section", "overlay");
  const starsNode = el("p", "overlay__stars");
  const finalScoreNode = el("p");
  const againBtn = el("button", "btn", "Try again");
  againBtn.type = "button";
  const hubBtn = el("button", "btn btn--secondary", "Back to hub");
  hubBtn.type = "button";
  const actions = el("div", "overlay__actions");
  actions.append(againBtn, hubBtn);
  gameoverOverlay.append(
    el("h2", "overlay__title", "Game over"),
    starsNode,
    finalScoreNode,
    actions
  );

  container.append(
    hud,
    announcer,
    startOverlay,
    pausedOverlay,
    gameoverOverlay
  );

  const overlays: Record<ShellSnapshot["state"], HTMLElement | null> = {
    start: startOverlay,
    playing: null,
    paused: pausedOverlay,
    gameover: gameoverOverlay,
  };

  // Wire events -------------------------------------------------------------
  const fire = (event: ShellEventType) =>
    handleUiEvent(shell, sfx, event, hooks, store, gameId);

  startBtn.addEventListener("click", () => fire("start"));
  againBtn.addEventListener("click", () => fire("restart"));
  resumeBtn.addEventListener("click", () => fire("resume"));
  muteBtn.addEventListener("click", () =>
    shell.setMuted(!shell.snapshot.muted)
  );

  const onKeydown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const { state } = shell.snapshot;
    if (state === "start" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      fire("start");
    } else if (
      (state === "playing" || state === "paused") &&
      (e.key === "Escape" || e.key === "p" || e.key === "P")
    ) {
      e.preventDefault();
      fire(state === "playing" ? "pause" : "resume");
    } else if (state === "gameover" && e.key === "Enter") {
      e.preventDefault();
      fire("restart");
    }
  };
  document.addEventListener("keydown", onKeydown);

  hubBtn.addEventListener("click", () => {
    // Hub lives at the site root; relative link keeps subpath deploys working.
    window.location.href = "../../index.html";
  });

  // Render loop -------------------------------------------------------------
  const render = (snapshot: ShellSnapshot) => {
    scoreValue.textContent = formatScore(snapshot.score);
    streakValue.textContent = String(snapshot.streak);
    levelValue.textContent = String(snapshot.level);

    const target = overlays[snapshot.state] ?? null;
    for (const overlay of Object.values(overlays)) {
      if (overlay) overlay.hidden = overlay !== target;
    }

    muteBtn.textContent = snapshot.muted ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", String(snapshot.muted));
    sfx.setMuted(snapshot.muted);

    if (snapshot.state === "gameover") {
      const stars = starsFor(snapshot.score, Math.max(1, snapshot.score));
      starsNode.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
      finalScoreNode.textContent = `Score: ${formatScore(snapshot.score)}`;
    }

    announcer.textContent = `Game state: ${snapshot.state}`;
    hooks.onStateChange?.(snapshot);
  };
  const unsubscribe = shell.subscribe(render);
  render(shell.snapshot);

  return {
    shell,
    sfx,
    announce(message: string) {
      announcer.textContent = message;
    },
    destroy() {
      unsubscribe();
      document.removeEventListener("keydown", onKeydown);
      container.innerHTML = "";
    },
  };
}

export type { SfxName };
