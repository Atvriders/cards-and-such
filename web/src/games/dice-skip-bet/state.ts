import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Skip Bet: Roll a die. If it matches a "skip" number you chose, lose bet. Otherwise win bet.
export interface DiceSkipBetSettings { rounds: "10" | "20"; }

export interface DiceSkipBetState {
  die: number | null;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "betting" | "result" | "gameover";
  skipNumber: number;
  bet: number;
  lastWin: boolean | null;
  rngSeed: number;
}

export type DiceSkipBetAction = { type: "bet"; amount: number; skip: number } | { type: "next" };

export function initialState(seed: number, settings: DiceSkipBetSettings): DiceSkipBetState {
  const rng = mulberry32(seed);
  return { die: null, coins: 100, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "betting", skipNumber: 0, bet: 0, lastWin: null, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: DiceSkipBetState, action: DiceSkipBetAction): DiceSkipBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const die = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const amount = Math.max(1, Math.min(action.amount, state.coins));
    const skip = Math.max(1, Math.min(6, action.skip));
    const win = die !== skip;
    const newCoins = Math.max(0, state.coins + (win ? amount : -amount * 5));
    const done = state.round >= state.maxRounds || newCoins <= 0;
    return { ...state, die, coins: newCoins, bet: amount, skipNumber: skip, lastWin: win, phase: done ? "gameover" : "result", rngSeed: nextSeed };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, die: null, round: state.round + 1, lastWin: null, phase: "betting" };
  }
  return state;
}

export function isTerminal(state: DiceSkipBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
