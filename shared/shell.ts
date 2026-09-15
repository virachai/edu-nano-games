/**
 * Shared game shell — pure state machine and HUD helpers.
 *
 * UI-independent on purpose: everything here runs under `node --test`
 * with no DOM. See shell-dom.ts for the browser wiring.
 */

export type ShellState = "start" | "playing" | "paused" | "gameover";

export type ShellEventType =
  "start" | "pause" | "resume" | "restart" | "quit" | "gameOver";

/**
 * Legal transitions. Events not listed for a state are no-ops
 * (the state machine never throws on unexpected input).
 */
const TRANSITIONS: Readonly<
  Record<ShellState, Readonly<Partial<Record<ShellEventType, ShellState>>>>
> = {
  start: { start: "playing" },
  playing: { pause: "paused", gameOver: "gameover", quit: "start" },
  paused: { resume: "playing", restart: "playing", quit: "start" },
  gameover: { restart: "playing", quit: "start" },
};

export function nextShellState(
  state: ShellState,
  event: ShellEventType
): ShellState {
  return TRANSITIONS[state][event] ?? state;
}

export interface ShellSnapshot {
  state: ShellState;
  score: number;
  streak: number;
  level: number;
  muted: boolean;
}

export type ShellListener = (snapshot: ShellSnapshot) => void;

/** Counters that reset on "restart" / "quit"; muted persists across runs. */
const RESETTABLE: ReadonlyArray<"score" | "streak" | "level"> = [
  "score",
  "streak",
  "level",
];

export interface Shell {
  readonly snapshot: ShellSnapshot;
  send(event: ShellEventType): void;
  addScore(delta: number): void;
  setStreak(value: number): void;
  setLevel(value: number): void;
  setMuted(value: boolean): void;
  subscribe(listener: ShellListener): () => void;
}

export function createShell(initial: Partial<ShellSnapshot> = {}): Shell {
  let snapshot: ShellSnapshot = {
    state: "start",
    score: 0,
    streak: 0,
    level: 1,
    muted: false,
    ...initial,
  };

  const listeners = new Set<ShellListener>();

  const update = (patch: Partial<ShellSnapshot>): void => {
    const next = { ...snapshot, ...patch };
    const changed =
      next.state !== snapshot.state ||
      next.score !== snapshot.score ||
      next.streak !== snapshot.streak ||
      next.level !== snapshot.level ||
      next.muted !== snapshot.muted;
    if (!changed) return;
    snapshot = next;
    for (const listener of listeners) listener(snapshot);
  };

  return {
    get snapshot(): ShellSnapshot {
      return snapshot;
    },
    send(event: ShellEventType): void {
      const state = nextShellState(snapshot.state, event);
      const resets =
        state !== snapshot.state && (event === "restart" || event === "quit");
      update({
        state,
        ...(resets ? { score: 0, streak: 0, level: 1 } : {}),
      });
    },
    addScore(delta: number): void {
      update({ score: Math.max(0, snapshot.score + delta) });
    },
    setStreak(value: number): void {
      update({ streak: Math.max(0, Math.trunc(value)) });
    },
    setLevel(value: number): void {
      update({ level: Math.max(1, Math.trunc(value)) });
    },
    setMuted(value: boolean): void {
      update({ muted: value });
    },
    subscribe(listener: ShellListener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Star rating for the game-over screen. A maxScore of 0 earns all three. */
export function starsFor(score: number, maxScore: number): 0 | 1 | 2 | 3 {
  const ratio = maxScore > 0 ? score / maxScore : 1;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
}

/** Zero-padded score for the HUD (retro style, locale-independent).
 * Saturates at 999999 so long runs can't break the HUD layout. */
export function formatScore(score: number): string {
  const clamped = Math.min(Math.max(0, Math.trunc(score)), 999999);
  return String(clamped).padStart(6, "0");
}

export { RESETTABLE };
