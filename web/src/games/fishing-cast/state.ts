import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Fishing Cast: A power meter fills up. Release at the right power to land in the target zone.

export interface FishingCastSettings { casts: "5" | "8"; }

export interface FishingCastState {
  power: number;         // 0-100
  casts: number;
  maxCasts: number;
  score: number;
  targetMin: number;
  targetMax: number;
  phase: "casting" | "result" | "gameover";
  lastPoints: number;
  rngSeed: number;
  speed: number;
}

export type FishingCastAction = { type: "release" } | { type: "tick" } | { type: "next" };

export function initialState(seed: number, settings: FishingCastSettings): FishingCastState {
  const rng = mulberry32(seed);
  const speed = 3 + Math.floor(rng() * 4);
  const tMin = 30 + Math.floor(rng() * 30);
  const tMax = tMin + 15 + Math.floor(rng() * 15);
  return { power: 0, casts: 0, maxCasts: parseInt(settings.casts, 10), score: 0, targetMin: tMin, targetMax: Math.min(tMax, 95), phase: "casting", lastPoints: 0, rngSeed: Math.floor(rng() * 2 ** 31), speed };
}

export function reducer(state: FishingCastState, action: FishingCastAction): FishingCastState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "casting") return state;
    const newPower = (state.power + state.speed) % 101;
    return { ...state, power: newPower };
  }
  if (action.type === "release") {
    if (state.phase !== "casting") return state;
    const inZone = state.power >= state.targetMin && state.power <= state.targetMax;
    const pts = inZone ? 100 : Math.max(0, 30 - Math.min(Math.abs(state.power - state.targetMin), Math.abs(state.power - state.targetMax)));
    const newCasts = state.casts + 1;
    const phase = newCasts >= state.maxCasts ? "gameover" : "result";
    return { ...state, casts: newCasts, score: state.score + pts, lastPoints: pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const speed = 3 + Math.floor(rng() * 4);
    const tMin = 30 + Math.floor(rng() * 30);
    const tMax = Math.min(tMin + 15 + Math.floor(rng() * 15), 95);
    return { ...state, power: 0, phase: "casting", targetMin: tMin, targetMax: tMax, rngSeed: Math.floor(rng() * 2 ** 31), speed };
  }
  return state;
}

export function isTerminal(state: FishingCastState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
