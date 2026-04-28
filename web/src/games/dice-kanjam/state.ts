import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DIE_COUNT = 3;

export interface DiceKanjamSettings { dummy: boolean; }

export interface DiceKanjamState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  score: number;
  lastPts: number;
  jackpot: boolean;
  phase: "rolling" | "rolled" | "done";
}

export type DiceKanjamAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceKanjamSettings): DiceKanjamState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, lastPts: 0, jackpot: false, phase: "rolling" };
}

export function reducer(state: DiceKanjamState, action: DiceKanjamAction): DiceKanjamState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let jackpot = false;
    if (dice.every(d => d === 6)) { pts = 21; jackpot = true; }
    else {
      const sixes = dice.filter(d => d === 6).length;
      const fives = dice.filter(d => d === 5).length;
      if (sixes >= 1 && fives >= 1) pts += 2;
      else if (sixes >= 1) pts += 1;
    }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, lastPts: pts, jackpot, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, jackpot: false, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceKanjamState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
