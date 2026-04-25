import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Lava Leap: Jump over lava gaps. A jump power meter fills - release at the right time to clear the gap.

export interface LavaLeapSettings { leaps: "5" | "8"; }

export interface LavaLeapState {
  power: number;       // 0-100
  gapSize: number;    // minimum power needed (30-70)
  leaps: number;
  maxLeaps: number;
  score: number;
  phase: "charging" | "result" | "gameover";
  lastClear: boolean | null;
  lastPoints: number;
  rngSeed: number;
  speed: number;
}

export type LavaLeapAction = { type: "jump" } | { type: "tick" } | { type: "next" };

export function initialState(seed: number, settings: LavaLeapSettings): LavaLeapState {
  const rng = mulberry32(seed);
  const speed = 4 + Math.floor(rng() * 4);
  const gapSize = 30 + Math.floor(rng() * 40);
  return { power: 0, gapSize, leaps: 0, maxLeaps: parseInt(settings.leaps, 10), score: 0, phase: "charging", lastClear: null, lastPoints: 0, rngSeed: Math.floor(rng() * 2 ** 31), speed };
}

export function reducer(state: LavaLeapState, action: LavaLeapAction): LavaLeapState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "charging") return state;
    return { ...state, power: Math.min(100, state.power + state.speed) };
  }
  if (action.type === "jump") {
    if (state.phase !== "charging") return state;
    const cleared = state.power >= state.gapSize;
    // overshoot also loses points (too much power = overshoots into next lava)
    const overshoot = state.power > state.gapSize + 25;
    const pts = cleared && !overshoot ? 100 : cleared ? 40 : 0;
    const newLeaps = state.leaps + 1;
    const phase = newLeaps >= state.maxLeaps ? "gameover" : "result";
    return { ...state, leaps: newLeaps, score: state.score + pts, lastClear: cleared, lastPoints: pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const speed = 4 + Math.floor(rng() * 4);
    const gapSize = 30 + Math.floor(rng() * 40);
    return { ...state, power: 0, gapSize, phase: "charging", lastClear: null, rngSeed: Math.floor(rng() * 2 ** 31), speed };
  }
  return state;
}

export function isTerminal(state: LavaLeapState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
