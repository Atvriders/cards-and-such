import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Stadium: 12 rounds of 3-die roll. Sum is base score.
// Player picks crowd cheer level before roll: low(+0), mid(*1.5 if sum>=10), high(*2 if sum>=14).
// Stadium scoring: bigger risks, bigger rewards.

export const TOTAL_ROUNDS = 12;

export interface DiceStadiumSettings { dummy: boolean; }

export type Cheer = "low" | "mid" | "high";

export interface DiceStadiumState {
  rngSeed: number;
  round: number;
  cheer: Cheer | null;
  dice: [number, number, number] | null;
  score: number;
  phase: "cheering" | "result" | "done";
  lastPts: number;
}

export type DiceStadiumAction = { type: "cheer"; level: Cheer } | { type: "next" };

export function initialState(seed: number, _settings: DiceStadiumSettings): DiceStadiumState {
  return { rngSeed: seed, round: 1, cheer: null, dice: null, score: 0, phase: "cheering", lastPts: 0 };
}

export function reducer(state: DiceStadiumState, action: DiceStadiumAction): DiceStadiumState {
  if (state.phase === "done") return state;
  if (action.type === "cheer") {
    if (state.phase !== "cheering") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b + c;
    let pts = sum;
    if (action.level === "mid") pts = sum >= 10 ? Math.floor(sum * 1.5) : 0;
    else if (action.level === "high") pts = sum >= 14 ? sum * 2 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, cheer: action.level, dice: [a, b, c], score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, cheer: null, dice: null, phase: "cheering", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceStadiumState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
