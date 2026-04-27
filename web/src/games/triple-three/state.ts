import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Triple Three: Roll 3 dice each round; +50 bonus for triple threes; +5 per regular round (sum > 9 also bonus +10).
// 12 rounds.
export const TOTAL_ROUNDS = 12;
export interface TripleThreeSettings { dummy: boolean; }
export interface TripleThreeState {
  rngSeed: number;
  round: number;
  dice: [number, number, number] | null;
  score: number;
  phase: "ready" | "rolled" | "done";
  lastBonus: number;
}
export type TripleThreeAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: TripleThreeSettings): TripleThreeState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "ready", lastBonus: 0 };
}
export function reducer(state: TripleThreeState, action: TripleThreeAction): TripleThreeState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "ready") {
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let bonus = 5;
    if (a === 3 && b === 3 && c === 3) bonus = 50;
    else if (a + b + c >= 12) bonus = 15;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b, c], score: state.score + bonus, phase: isLast ? "done" : "rolled", lastBonus: bonus };
  }
  if (action.type === "next" && state.phase === "rolled") {
    return { ...state, round: state.round + 1, dice: null, phase: "ready", lastBonus: 0 };
  }
  return state;
}
export function isTerminal(state: TripleThreeState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
