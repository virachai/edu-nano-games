import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bestScoreFor,
  clearBestScores,
  loadBestScores,
  noopStorage,
  parseBestScores,
  saveBestScore,
  serializeBestScores,
  STORAGE_KEY,
} from "../shared/storage.js";

/** In-memory StorageLike recording writes for assertions. */
function memoryStore(initial = {}) {
  const map = new Map(Object.entries(initial));
  const writes = [];
  return {
    writes,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      writes.push([k, v]);
      map.set(k, v);
    },
    removeItem: (k) => map.delete(k),
  };
}

test("parseBestScores: null/empty/malformed → empty record", () => {
  assert.deepEqual(parseBestScores(null), {});
  assert.deepEqual(parseBestScores(""), {});
  assert.deepEqual(parseBestScores("not json"), {});
  assert.deepEqual(parseBestScores("[1,2]"), {});
  assert.deepEqual(parseBestScores("42"), {});
  assert.deepEqual(parseBestScores('{"a":null}'), {});
});

test("parseBestScores: keeps only non-negative integer scores", () => {
  const raw = JSON.stringify({ a: 10, b: -1, c: 1.5, d: "x", e: 0, "": 5 });
  assert.deepEqual(parseBestScores(raw), { a: 10, e: 0 });
});

test("serializeBestScores: sorted keys, stable round-trip", () => {
  const scores = { b: 2, a: 1 };
  assert.equal(serializeBestScores(scores), '{"a":1,"b":2}');
  assert.deepEqual(parseBestScores(serializeBestScores(scores)), scores);
});

test("saveBestScore: writes only when beating the best", () => {
  const store = memoryStore();
  const after1 = saveBestScore(store, "vocab-match", 100);
  assert.deepEqual(after1, { "vocab-match": 100 });
  assert.deepEqual(loadBestScores(store), { "vocab-match": 100 });
  assert.equal(store.writes.length, 1);

  saveBestScore(store, "vocab-match", 99);
  assert.deepEqual(loadBestScores(store), { "vocab-match": 100 });
  assert.equal(store.writes.length, 1, "lower score must not write");

  saveBestScore(store, "vocab-match", 200);
  assert.deepEqual(loadBestScores(store), { "vocab-match": 200 });
  assert.equal(store.writes.length, 2);
});

test("saveBestScore: rejects invalid scores", () => {
  const store = memoryStore();
  saveBestScore(store, "g", -5);
  saveBestScore(store, "g", 1.5);
  saveBestScore(store, "g", Number.NaN);
  assert.deepEqual(loadBestScores(store), {});
  assert.equal(store.writes.length, 0);
});

test("bestScoreFor: defaults to 0 for unknown games", () => {
  assert.equal(bestScoreFor({}, "nope"), 0);
  assert.equal(bestScoreFor({ vocab: 7 }, "vocab"), 7);
});

test("clearBestScores: removes the key", () => {
  const store = memoryStore({ [STORAGE_KEY]: '{"a":1}' });
  clearBestScores(store);
  assert.deepEqual(loadBestScores(store), {});
});

test("noopStorage: never persists", () => {
  saveBestScore(noopStorage, "g", 10);
  assert.deepEqual(loadBestScores(noopStorage), {});
});
