import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;

export interface DiceFortuneSettings { dummy: boolean; }

export interface DiceFortuneState {
  rngSeed: number;
  round: number;
  die: number | null;
  multiplier: number | null;
  score: number;
  phase: "spinning" | "result" | "done";
  lastPts: number;
}

export type DiceFortuneAction = { type: "spin" } | { type: "next" };

export function initialState(seed: number, _settings: DiceFortuneSettings): DiceFortuneState {
  return { rngSeed: seed, round: 1, die: null, multiplier: null, score: 0, phase: "spinning", lastPts: 0 };
}

export function reducer(state: DiceFortuneState, action: DiceFortuneAction): DiceFortuneState {
  if (state.phase === "done") return state;
  if (action.type === "spin") {
    if (state.phase !== "spinning") return state;
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng() * 6);
    const multiplier = 1 + Math.floor(rng() * 5);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = die * multiplier;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, die, multiplier, score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, die: null, multiplier: null, phase: "spinning", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceFortuneState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
