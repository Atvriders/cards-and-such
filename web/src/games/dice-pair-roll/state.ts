import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Pair Roll: Roll 2 dice, score = sum. Doubles = bonus.
export interface DicePairRollSettings { rounds: "10" | "20"; }

export interface DicePairRollState {
  dice: [number, number] | null;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "rolling" | "result" | "gameover";
  lastGain: number;
  rngSeed: number;
}

export type DicePairRollAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, settings: DicePairRollSettings): DicePairRollState {
  const rng = mulberry32(seed);
  return { dice: null, coins: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "rolling", lastGain: 0, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: DicePairRollState, action: DicePairRollAction): DicePairRollState {
  if (state.phase === "gameover") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = Math.floor(rng() * 6) + 1;
    const d2 = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isDouble = d1 === d2;
    const gain = isDouble ? (d1 + d2) * 2 : d1 + d2;
    return { ...state, dice: [d1, d2], lastGain: gain, coins: state.coins + gain, phase: "result", rngSeed: nextSeed };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const next = state.round + 1;
    const done = next > state.maxRounds;
    return { ...state, dice: null, round: next, lastGain: 0, phase: done ? "gameover" : "rolling" };
  }
  return state;
}

export function isTerminal(state: DicePairRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
