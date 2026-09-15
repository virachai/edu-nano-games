/**
 * Best-score persistence. Zero data collection: everything stays in
 * localStorage under one namespaced key, and a noop storage makes it
 * trivial to run in "no data saved" mode (classrooms).
 */

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STORAGE_KEY = "nano-games:best-scores";

/** Discarding storage — use when persistence is disabled. */
export const noopStorage: StorageLike = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/** localStorage when available (browser), noop otherwise (node, blocked). */
export function getStorage(): StorageLike {
  const maybe = (globalThis as { localStorage?: StorageLike }).localStorage;
  return maybe ?? noopStorage;
}

export type BestScores = Record<string, number>;

/**
 * Parse persisted JSON defensively. Only non-negative integer scores
 * survive; anything malformed yields an empty record, never a throw.
 */
export function parseBestScores(raw: string | null): BestScores {
  if (raw === null) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  const scores: BestScores = {};
  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 0 &&
      id.length > 0
    ) {
      scores[id] = value;
    }
  }
  return scores;
}

export function serializeBestScores(scores: BestScores): string {
  const sorted = Object.keys(scores)
    .sort()
    .map((id) => [id, scores[id]] as const);
  return JSON.stringify(Object.fromEntries(sorted));
}

export function bestScoreFor(scores: BestScores, gameId: string): number {
  return scores[gameId] ?? 0;
}

export function loadBestScores(
  store: StorageLike,
  key = STORAGE_KEY
): BestScores {
  return parseBestScores(store.getItem(key));
}

/** Store `score` if it beats the current best; returns the updated record. */
export function saveBestScore(
  store: StorageLike,
  gameId: string,
  score: number,
  key = STORAGE_KEY
): BestScores {
  const scores = loadBestScores(store, key);
  if (!Number.isInteger(score) || score < 0) return scores;
  if (score <= bestScoreFor(scores, gameId)) return scores;
  scores[gameId] = score;
  store.setItem(key, serializeBestScores(scores));
  return scores;
}

export function clearBestScores(store: StorageLike, key = STORAGE_KEY): void {
  store.removeItem(key);
}
