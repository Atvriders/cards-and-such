import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Beat {
  id: number;
  time: number; // absolute time (s) when it should be hit
  lane: number; // 0..3
  hit: boolean;
  missed: boolean;
}

export interface RhythmTapState {
  settings: { bpm: "60" | "90" | "120" };
  beats: Beat[];
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  elapsed: number;
  duration: number; // total song length seconds
  over: boolean;
  started: boolean;
  rngSeed: number;
}

export type RhythmTapAction =
  | { type: "tick"; dt: number }
  | { type: "tap"; lane: number }
  | { type: "start" };

const HIT_WINDOW = 0.18; // seconds either side
const MISS_WINDOW = 0.25;

function generateBeats(seed: number, bpm: number, duration: number): Beat[] {
  const rng = mulberry32(seed);
  const interval = 60 / bpm;
  const beats: Beat[] = [];
  let id = 0;
  let t = 1.0; // start after 1 second
  while (t < duration - 0.5) {
    const lane = Math.floor(rng() * 4);
    beats.push({ id: id++, time: t, lane, hit: false, missed: false });
    // sometimes add a double beat slightly offset
    if (rng() < 0.2 && t + interval / 2 < duration - 0.5) {
      const lane2 = (lane + 1 + Math.floor(rng() * 3)) % 4;
      beats.push({ id: id++, time: t + interval / 2, lane: lane2, hit: false, missed: false });
    }
    t += interval * (0.75 + rng() * 0.5);
  }
  return beats.sort((a, b) => a.time - b.time);
}

export function initialState(seed: number, s: { bpm: "60" | "90" | "120" }): RhythmTapState {
  const bpm = Number(s.bpm);
  const duration = 45;
  return {
    settings: s,
    beats: generateBeats(seed, bpm, duration),
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 5,
    elapsed: 0,
    duration,
    over: false,
    started: false,
    rngSeed: seed,
  };
}

export function reducer(state: RhythmTapState, action: RhythmTapAction): RhythmTapState {
  switch (action.type) {
    case "start":
      return { ...state, started: true };

    case "tap": {
      if (!state.started || state.over) return state;
      const { lane } = action;
      const t = state.elapsed;
      // Find earliest unhit beat in this lane within hit window
      const target = state.beats
        .filter((b) => !b.hit && !b.missed && b.lane === lane && Math.abs(b.time - t) <= HIT_WINDOW)
        .sort((a, b) => Math.abs(a.time - t) - Math.abs(b.time - t))[0];
      if (target) {
        const combo = state.combo + 1;
        const maxCombo = Math.max(state.maxCombo, combo);
        const bonus = combo >= 10 ? 20 : combo >= 5 ? 15 : 10;
        const beats = state.beats.map((b) => b.id === target.id ? { ...b, hit: true } : b);
        return { ...state, beats, score: state.score + bonus, combo, maxCombo };
      }
      return state;
    }

    case "tick": {
      if (!state.started || state.over) return state;
      const elapsed = state.elapsed + action.dt;

      // Mark beats as missed if past window
      let combo = state.combo;
      let lives = state.lives;
      const beats = state.beats.map((b) => {
        if (!b.hit && !b.missed && b.time + MISS_WINDOW < elapsed) {
          combo = 0;
          lives = Math.max(0, lives - 1);
          return { ...b, missed: true };
        }
        return b;
      });

      const over = lives <= 0 || elapsed >= state.duration;
      return { ...state, beats, elapsed, combo, lives, over };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RhythmTapState): { score: number } | null {
  if (state.over) return { score: state.score + state.maxCombo * 5 };
  return null;
}
