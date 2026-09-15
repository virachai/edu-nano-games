import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createSfx,
  createWebAudioScheduler,
  SFX_PRESETS,
} from "../shared/audio.js";

/** Deterministic fake AudioContext — no audio hardware needed. */
function fakeContext() {
  const calls = [];
  const param = (value) => ({
    value,
    setValueAtTime: (v, t) => calls.push(["setValueAtTime", v, t]),
    exponentialRampToValueAtTime: (v, t) =>
      calls.push(["exponentialRamp", v, t]),
  });
  const ctx = {
    currentTime: 0,
    destination: { connect: () => {}, disconnect: () => {} },
    resume: async () => {},
    createOscillator: () => {
      const osc = {
        type: "sine",
        frequency: param(440),
        start: (t) => calls.push(["start", t]),
        stop: (t) => calls.push(["stop", t]),
        onended: null,
        connect: (dest) => {
          calls.push(["osc.connect"]);
          return dest;
        },
        disconnect: () => calls.push(["osc.disconnect"]),
      };
      return osc;
    },
    createGain: () => ({
      gain: param(1),
      connect: (dest) => {
        calls.push(["gain.connect"]);
        return dest;
      },
      disconnect: () => calls.push(["gain.disconnect"]),
    }),
  };
  return { ctx, calls };
}

test("presets: every SFX name has a sane spec", () => {
  const names = ["click", "correct", "wrong", "levelUp", "gameOver"];
  for (const name of names) {
    const spec = SFX_PRESETS[name];
    assert.ok(spec.freq > 0, `${name} freq > 0`);
    assert.ok(spec.durationMs > 0, `${name} duration > 0`);
    assert.ok(spec.volume > 0 && spec.volume <= 1, `${name} volume in (0,1]`);
  }
});

test("scheduler.tone: wires osc → gain → destination with envelope", () => {
  const { ctx, calls } = fakeContext();
  const scheduler = createWebAudioScheduler(() => ctx);
  scheduler.tone(SFX_PRESETS.correct, 5);
  assert.ok(calls.some(([op]) => op === "osc.connect"));
  assert.ok(calls.some(([op]) => op === "gain.connect"));
  // Envelope: silent attack → volume → silent release.
  assert.deepEqual(
    calls.filter(([op]) => op === "exponentialRamp").map(([, v]) => v),
    [SFX_PRESETS.correct.endFreq, SFX_PRESETS.correct.volume, 0.0001]
  );
  assert.ok(calls.some(([op, t]) => op === "start" && t === 5));
  assert.ok(
    calls.some(
      ([op, t]) =>
        op === "stop" && t === 5 + SFX_PRESETS.correct.durationMs / 1000
    )
  );
});

test("scheduler.tone: sweeping specs ramp frequency, plain specs do not", () => {
  const { ctx, calls } = fakeContext();
  const scheduler = createWebAudioScheduler(() => ctx);
  scheduler.tone(SFX_PRESETS.click, 0); // no endFreq → only gain envelope ramps
  assert.deepEqual(
    calls.filter(([op]) => op === "exponentialRamp").map(([, v]) => v),
    [SFX_PRESETS.click.volume, 0.0001]
  );
});

test("createSfx: play schedules a tone; muted play does not", () => {
  let tones = 0;
  const scheduler = { now: () => 1, tone: () => tones++ };
  const sfx = createSfx({ scheduler });
  sfx.play("correct");
  assert.equal(tones, 1);
  sfx.setMuted(true);
  assert.equal(sfx.isMuted, true);
  sfx.play("correct");
  assert.equal(tones, 1, "muted sfx must not schedule");
});

test("createSfx: starts lazily — construction creates no audio context", () => {
  let created = 0;
  const scheduler = createWebAudioScheduler(() => {
    created++;
    return fakeContext().ctx;
  });
  createSfx({ scheduler });
  assert.equal(created, 0, "no AudioContext until first sound");
});
