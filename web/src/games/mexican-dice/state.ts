import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Mexican Dice: 12 rounds. Roll 2 dice. Special scoring:
// 2+1 (Mexican / 21): 200 points (highest!)
// Doubles (1-1, 2-2, etc.): the value * 100 (so 6-6 = 600)
// Otherwise: just the sum of the two dice as points.

export const TOTAL_ROUNDS = 12;

export interface MexicanDiceSettings { dummy: boolean; }

export interface MexicanDiceState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null;
  totalScore: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
  lastTag: string;
}

export type MexicanDiceAction = { type: "roll" } | { type: "next" };

export function evalRoll(a: number, b: number): { points: number; tag: string } {
  const sorted = [a,b].sort((x,y)=>x-y);
  if (sorted[0] === 1 && sorted[1] === 2) return { points: 200, tag: "Mexican! (2-1)" };
  if (a === b) return { points: a * 100, tag: `Doubles ${a}-${a}` };
  return { points: a + b, tag: `Sum ${a + b}` };
}

export function initialState(seed: number, _settings: MexicanDiceSettings): MexicanDiceState {
  return { rngSeed: seed, round: 1, dice: null, totalScore: 0, phase: "rolling", lastPts: 0, lastTag: "" };
}

export function reducer(state: MexicanDiceState, action: MexicanDiceAction): MexicanDiceState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const ev = evalRoll(a, b);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a,b], totalScore: state.totalScore + ev.points, phase: isLast ? "done" : "scored", lastPts: ev.points, lastTag: ev.tag };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: null, phase: "rolling", lastPts: 0, lastTag: "" };
  }
  return state;
}

export function isTerminal(state: MexicanDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.totalScore } : null;
}
