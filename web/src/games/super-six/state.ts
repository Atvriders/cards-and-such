import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Super Six: Roll 3 dice each round. +30 per six. Triple 1s = lose all accumulated points.
// 10 rounds.
export const TOTAL_ROUNDS = 10;
export interface SuperSixSettings { dummy: boolean; }
export interface SuperSixState {
  rngSeed: number;
  round: number;
  dice: [number, number, number] | null;
  score: number;
  phase: "ready" | "rolled" | "done";
  lastBonus: number;
  busted: boolean;
}
export type SuperSixAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: SuperSixSettings): SuperSixState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "ready", lastBonus: 0, busted: false };
}
export function reducer(state: SuperSixState, action: SuperSixAction): SuperSixState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "ready") {
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let bonus = 0;
    let busted = false;
    let newScore = state.score;
    if (a === 1 && b === 1 && c === 1) { busted = true; newScore = 0; bonus = 0; }
    else {
      const sixes = [a, b, c].filter(d => d === 6).length;
      bonus = sixes * 30;
      newScore += bonus;
    }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b, c], score: newScore, phase: isLast ? "done" : "rolled", lastBonus: bonus, busted };
  }
  if (action.type === "next" && state.phase === "rolled") {
    return { ...state, round: state.round + 1, dice: null, phase: "ready", lastBonus: 0, busted: false };
  }
  return state;
}
export function isTerminal(state: SuperSixState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
