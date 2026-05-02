/**
 * Global sound-effect system.
 *
 * Synthesizes short tones via the Web Audio API — no audio files needed.
 * Each sound is a 50–200 ms beep with a quick attack/decay envelope so
 * effects don't click. Honors the `cards-sound-on` localStorage flag
 * (defaults to ON) and silently no-ops in non-browser / SSR contexts.
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

function playTone(ctx: AudioContext, t: Tone, startAt: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = t.type ?? "sine";
  osc.frequency.setValueAtTime(t.freq, startAt);
  if (typeof t.to === "number") {
    osc.frequency.linearRampToValueAtTime(t.to, startAt + t.duration);
  }
  const peak = t.gain ?? 0.18;
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
 * via `localStorage["cards-sound-on"] === "false"`, or if Web Audio
 * isn't available in the host environment.
 */
export function playSound(name: SoundName): void {
  if (!isSoundOn()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const recipe = SOUND_RECIPES[name];
  if (!recipe) return;
  const now = ctx.currentTime;
  for (const tone of recipe) {
    try {
      playTone(ctx, tone, now + (tone.delay ?? 0));
    } catch {
      /* ignore individual tone failures */
    }
  }
}
