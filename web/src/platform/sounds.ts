/**
 * Global sound-effect system.
 *
 * Synthesizes short tones via the Web Audio API — no audio files needed.
 * Each sound is a 50–200 ms beep with a quick attack/decay envelope so
 * effects don't click. Honors the `cards-sound-on` localStorage flag
 * (defaults to ON) and silently no-ops in non-browser / SSR contexts.
 *
 * Volume is sourced from `cards-sound-volume` (0–100 integer, default 70)
 * and converted to a gain factor of `vol / 100 * 0.5` so the headroom is
 * deliberately low — Web Audio is loud and the recipes below were tuned
 * with a 0.5 ceiling in mind. Volume changes propagate live via the
 * window `storage` event so the Settings slider doesn't need a reload.
 *
 * `cards-mute-on-hidden` (default true) drops the gain factor to 0 while
 * the tab is hidden and restores it on visibilitychange.
 */

export type SoundName =
  | "card-deal"
  | "card-flip"
  | "card-place"
  | "card-shuffle"
  | "win-fanfare"
  | "dice-roll"
  | "button-click"
  | "win"
  | "lose"
  | "draw"
  | "achievement";

export const LS_SOUND_ON = "cards-sound-on";
export const LS_SOUND_VOLUME = "cards-sound-volume";
export const LS_MUTE_ON_HIDDEN = "cards-mute-on-hidden";

/** Default volume on the 0..100 slider scale. */
export const DEFAULT_VOLUME_PERCENT = 70;
/** Headroom multiplier — Web Audio is loud, keep things quiet by default. */
export const VOLUME_HEADROOM = 0.5;

let cachedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor: typeof AudioContext | undefined =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!cachedCtx) {
    try {
      cachedCtx = new Ctor();
    } catch {
      cachedCtx = null;
    }
  }
  // Some browsers start the context suspended until a user gesture.
  if (cachedCtx && cachedCtx.state === "suspended") {
    void cachedCtx.resume().catch(() => {});
  }
  return cachedCtx;
}

export function isSoundOn(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    // Both legacy ("cards-sound-enabled") and new key are honored; new wins.
    const v = localStorage.getItem(LS_SOUND_ON);
    if (v !== null) return v === "true";
    const legacy = localStorage.getItem("cards-sound-enabled");
    if (legacy !== null) return legacy === "true";
  } catch {
    return false;
  }
  return true; // default ON
}

export function setSoundOn(on: boolean): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LS_SOUND_ON, String(on));
    }
  } catch {
    /* ignore */
  }
}

/**
 * Read the persisted volume slider value and clamp to 0..100.
 *
 * Tolerant of both the documented 0–100 integer scale (what Settings now
 * writes) and the historical 0..1 float scale that an earlier draft of
 * the slider used — values <= 1 are treated as fractions and scaled up,
 * everything else is rounded and clamped. Falls back to 70 on any miss.
 */
export function readVolumePercent(): number {
  if (typeof localStorage === "undefined") return DEFAULT_VOLUME_PERCENT;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LS_SOUND_VOLUME);
  } catch {
    return DEFAULT_VOLUME_PERCENT;
  }
  if (raw === null || raw === "") return DEFAULT_VOLUME_PERCENT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_VOLUME_PERCENT;
  // Tolerate the legacy 0..1 float scale.
  const pct = n > 0 && n <= 1 ? n * 100 : n;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

export function readMuteOnHidden(): boolean {
  if (typeof localStorage === "undefined") return true;
  try {
    const v = localStorage.getItem(LS_MUTE_ON_HIDDEN);
    if (v === null) return true; // default ON
    return v === "true";
  } catch {
    return true;
  }
}

/**
 * Convert a 0..100 percent to the per-tone gain multiplier. The 0.5 cap
 * keeps the recipes (which top out around peak=0.26) within a comfortable
 * range — at vol=100 the loudest tone tops at ~0.13 absolute gain.
 */
export function volumeFactor(percent: number = readVolumePercent()): number {
  const clamped = Math.min(100, Math.max(0, percent));
  return (clamped / 100) * VOLUME_HEADROOM;
}

// ---------------------------------------------------------------------------
// Live state — kept in module scope so playSound() doesn't have to re-read
// localStorage on every tone, and so visibilitychange / storage listeners
// can mutate the effective gain in O(1).

let currentVolumePercent = readVolumePercent();
let muteOnHidden = readMuteOnHidden();
let hidden = false;

/**
 * The gain factor we actually multiply each tone by. Hidden + muteOnHidden
 * drives this to 0 regardless of slider position.
 */
function effectiveGainFactor(): number {
  if (muteOnHidden && hidden) return 0;
  return volumeFactor(currentVolumePercent);
}

/** Test/debug helper — re-pull every input from localStorage + document. */
export function _refreshAudioState(): void {
  currentVolumePercent = readVolumePercent();
  muteOnHidden = readMuteOnHidden();
  hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
}

/** Wire up storage + visibilitychange listeners exactly once. */
let listenersAttached = false;
function attachListenersOnce(): void {
  if (listenersAttached) return;
  if (typeof window === "undefined") return;
  listenersAttached = true;

  // Cross-tab + same-doc Settings updates. The browser fires `storage` on
  // *other* tabs only, so SettingsPage already triggers re-renders via its
  // own state — we still listen here so background tabs follow along.
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === LS_SOUND_VOLUME || e.key === null) {
      currentVolumePercent = readVolumePercent();
    }
    if (e.key === LS_MUTE_ON_HIDDEN || e.key === null) {
      muteOnHidden = readMuteOnHidden();
    }
  });

  if (typeof document !== "undefined") {
    hidden = document.visibilityState === "hidden";
    document.addEventListener("visibilitychange", () => {
      hidden = document.visibilityState === "hidden";
    });
  }
}

// Attach immediately at module load. Safe in SSR — guarded above.
attachListenersOnce();

interface Tone {
  freq: number;
  duration: number; // seconds
  type?: OscillatorType;
  /** Sweep target frequency (linear ramp). */
  to?: number;
  /** Peak gain (0..1). */
  gain?: number;
  /** Delay before this tone in seconds. */
  delay?: number;
}

const SOUND_RECIPES: Record<SoundName, Tone[]> = {
  "card-deal": [
    // Short whoosh — triangle sweep down with a softer tail.
    { freq: 520, to: 320, duration: 0.07, type: "triangle", gain: 0.18 },
  ],
  "card-flip": [
    // Light snap — high-to-mid square pop.
    { freq: 880, to: 660, duration: 0.06, type: "square", gain: 0.12 },
  ],
  "card-place": [
    // Soft thud — short low triangle bump.
    { freq: 240, to: 140, duration: 0.06, type: "triangle", gain: 0.16 },
  ],
  "card-shuffle": [
    // Riffle — three rapid sawtooth blips evoke flipping cards.
    { freq: 360, to: 220, duration: 0.04, type: "sawtooth", gain: 0.10 },
    { freq: 380, to: 240, duration: 0.04, type: "sawtooth", gain: 0.10, delay: 0.04 },
    { freq: 340, to: 200, duration: 0.04, type: "sawtooth", gain: 0.10, delay: 0.08 },
    { freq: 400, to: 260, duration: 0.04, type: "sawtooth", gain: 0.10, delay: 0.12 },
  ],
  "win-fanfare": [
    // Short victory — C5 → E5 → G5 → C6 arpeggio with a slight gain swell.
    { freq: 523.25, duration: 0.10, type: "triangle", gain: 0.20 }, // C5
    { freq: 659.25, duration: 0.10, type: "triangle", gain: 0.22, delay: 0.08 }, // E5
    { freq: 783.99, duration: 0.10, type: "triangle", gain: 0.24, delay: 0.16 }, // G5
    { freq: 1046.5, duration: 0.22, type: "triangle", gain: 0.26, delay: 0.24 }, // C6
  ],
  "dice-roll": [
    { freq: 200, to: 140, duration: 0.05, type: "square", gain: 0.18 },
    { freq: 240, to: 160, duration: 0.05, type: "square", gain: 0.18, delay: 0.06 },
    { freq: 180, to: 120, duration: 0.06, type: "square", gain: 0.18, delay: 0.13 },
  ],
  "button-click": [
    { freq: 760, duration: 0.05, type: "triangle", gain: 0.10 },
  ],
  win: [
    { freq: 523.25, duration: 0.10, type: "triangle", gain: 0.20 }, // C5
    { freq: 659.25, duration: 0.10, type: "triangle", gain: 0.20, delay: 0.10 }, // E5
    { freq: 783.99, duration: 0.16, type: "triangle", gain: 0.22, delay: 0.20 }, // G5
  ],
  lose: [
    { freq: 392.0, duration: 0.10, type: "sawtooth", gain: 0.18 }, // G4
    { freq: 311.13, duration: 0.18, type: "sawtooth", gain: 0.20, delay: 0.10 }, // Eb4
  ],
  draw: [
    { freq: 440, duration: 0.10, type: "sine", gain: 0.16 },
    { freq: 440, duration: 0.10, type: "sine", gain: 0.16, delay: 0.12 },
  ],
  achievement: [
    { freq: 659.25, duration: 0.09, type: "triangle", gain: 0.20 }, // E5
    { freq: 880.0, duration: 0.09, type: "triangle", gain: 0.20, delay: 0.09 }, // A5
    { freq: 1174.66, duration: 0.18, type: "triangle", gain: 0.22, delay: 0.18 }, // D6
  ],
};

function playTone(ctx: AudioContext, t: Tone, startAt: number, factor: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = t.type ?? "sine";
  osc.frequency.setValueAtTime(t.freq, startAt);
  if (typeof t.to === "number") {
    osc.frequency.linearRampToValueAtTime(t.to, startAt + t.duration);
  }
  // Apply the user's volume factor to the recipe's peak. exponentialRampTo
  // can't accept 0, so floor to a tiny epsilon when factor is 0 — the tone
  // will still be effectively silent.
  const recipePeak = t.gain ?? 0.18;
  const peak = Math.max(0.0001, recipePeak * factor);
  // Quick attack/decay envelope to avoid clicks.
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + t.duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + t.duration + 0.02);
}

/**
 * Play a named sound effect. Silent if the user has disabled sound
 * via `localStorage["cards-sound-on"] === "false"`, if the volume
 * slider is at 0, if the tab is hidden and mute-on-hidden is on, or
 * if Web Audio isn't available in the host environment.
 */
export function playSound(name: SoundName): void {
  if (!isSoundOn()) return;
  const factor = effectiveGainFactor();
  if (factor <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const recipe = SOUND_RECIPES[name];
  if (!recipe) return;
  const now = ctx.currentTime;
  for (const tone of recipe) {
    try {
      playTone(ctx, tone, now + (tone.delay ?? 0), factor);
    } catch {
      /* ignore individual tone failures */
    }
  }
}
