import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Step Bet: Roll a die each step. Bet accumulates. Choose to bank or continue. Over 6 = bust.
export interface DiceStepBetSettings { rounds: "5" | "10"; }

export interface DiceStepBetState {
  dieHistory: number[];
  runTotal: number;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "stepping" | "result" | "gameover";
  bust: boolean;
  lastBank: number;
  rngSeed: number;
}

export type DiceStepBetAction = { type: "step" } | { type: "bank" } | { type: "next" };

export function initialState(seed: number, settings: DiceStepBetSettings): DiceStepBetState {
  const rng = mulberry32(seed);
  return { dieHistory: [], runTotal: 0, coins: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "stepping", bust: false, lastBank: 0, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: DiceStepBetState, action: DiceStepBetAction): DiceStepBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "step") {
    if (state.phase !== "stepping") return state;
    const rng = mulberry32(state.rngSeed);
    const die = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newTotal = state.runTotal + die;
    if (newTotal > 21) {
      return { ...state, dieHistory: [...state.dieHistory, die], runTotal: newTotal, bust: true, lastBank: 0, phase: "result", rngSeed: nextSeed };
    }
    return { ...state, dieHistory: [...state.dieHistory, die], runTotal: newTotal, rngSeed: nextSeed };
  }
  if (action.type === "bank") {
    if (state.phase !== "stepping" || state.runTotal === 0) return state;
    const gain = state.runTotal;
    return { ...state, coins: state.coins + gain, lastBank: gain, bust: false, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const next = state.round + 1;
    const done = next > state.maxRounds;
    return { ...state, dieHistory: [], runTotal: 0, round: next, bust: false, lastBank: 0, phase: done ? "gameover" : "stepping" };
  }
  return state;
}

export function isTerminal(state: DiceStepBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
