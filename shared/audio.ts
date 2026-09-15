/**
 * Tiny Web Audio SFX synth (no audio files, zero bytes downloaded).
 * Presets and scheduling logic are pure; the Web Audio backend is
 * created lazily on first sound so importing this module never throws
 * in environments without AudioContext (node --test).
 */

export type SfxName = "click" | "correct" | "wrong" | "levelUp" | "gameOver";

export interface SfxSpec {
  freq: number;
  /** Optional sweep target in Hz (exponential ramp from freq). */
  endFreq?: number;
  durationMs: number;
  type: OscillatorType;
  volume: number;
}

export const SFX_PRESETS: Readonly<Record<SfxName, SfxSpec>> = {
  click: { freq: 660, durationMs: 60, type: "square", volume: 0.15 },
  correct: {
    freq: 523,
    endFreq: 1046,
    durationMs: 180,
    type: "sine",
    volume: 0.25,
  },
  wrong: {
    freq: 220,
    endFreq: 110,
    durationMs: 220,
    type: "sawtooth",
    volume: 0.2,
  },
  levelUp: {
    freq: 659,
    endFreq: 1318,
    durationMs: 260,
    type: "triangle",
    volume: 0.25,
  },
  gameOver: {
    freq: 392,
    endFreq: 98,
    durationMs: 500,
    type: "triangle",
    volume: 0.25,
  },
};

// --- Structural audio types (real AudioContext satisfies these) -----------

export interface AudioParamLike {
  value: number;
  setValueAtTime(value: number, startTime: number): void;
  exponentialRampToValueAtTime(value: number, endTime: number): void;
}

export interface AudioNodeLike {
  connect(destination: AudioNodeLike): AudioNodeLike;
  disconnect(): void;
}

export interface GainNodeLike extends AudioNodeLike {
  gain: AudioParamLike;
}

export interface OscillatorNodeLike extends AudioNodeLike {
  type: OscillatorType;
  frequency: AudioParamLike;
  start(when: number): void;
  stop(when: number): void;
}

export interface AudioContextLike {
  currentTime: number;
  destination: AudioNodeLike;
  resume(): Promise<void>;
  createOscillator(): OscillatorNodeLike;
  createGain(): GainNodeLike;
}

const defaultContextFactory = (): AudioContextLike => new AudioContext();

export interface SfxScheduler {
  /** Current scheduler time in seconds. */
  now(): number;
  /** Schedule one tone from its spec; `when` is in seconds. */
  tone(spec: SfxSpec, when: number): void;
}

export function createWebAudioScheduler(
  contextFactory: () => AudioContextLike = defaultContextFactory
): SfxScheduler {
  let ctx: AudioContextLike | null = null;
  const ensure = (): AudioContextLike => (ctx ??= contextFactory());
  return {
    now: () => ensure().currentTime,
    tone(spec: SfxSpec, when: number): void {
      const context = ensure();
      const durationSec = spec.durationMs / 1000;
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.freq, when);
      if (spec.endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, spec.endFreq),
          when + durationSec
        );
      }

      // Fast attack/decay envelope so notes don't click.
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(spec.volume, when + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + durationSec);

      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(when);
      osc.stop(when + durationSec);
      // No manual disconnect: per Web Audio spec, oscillator nodes are
      // garbage-collected once stopped and unreferenced.
    },
  };
}

export interface Sfx {
  play(name: SfxName): void;
  setMuted(value: boolean): void;
  readonly isMuted: boolean;
}

export function createSfx(
  options: { scheduler?: SfxScheduler; muted?: boolean } = {}
): Sfx {
  const scheduler = options.scheduler ?? createWebAudioScheduler();
  let muted = options.muted ?? false;
  return {
    play(name: SfxName): void {
      if (muted) return;
      scheduler.tone(SFX_PRESETS[name], scheduler.now() + 0.01);
    },
    setMuted(value: boolean): void {
      muted = value;
    },
    get isMuted(): boolean {
      return muted;
    },
  };
}
