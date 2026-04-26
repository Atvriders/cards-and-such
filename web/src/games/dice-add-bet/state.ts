import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Add Bet: Bet on whether the sum of 3 dice will be above or below 10.5 (hi/lo).
export interface DiceAddBetSettings { rounds: "10" | "20"; }

export interface DiceAddBetState {
  dice: [number,number,number] | null;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "betting" | "result" | "gameover";
  bet: number;
  choice: "hi" | "lo" | null;
  lastWin: boolean | null;
  rngSeed: number;
}

export type DiceAddBetAction = { type:"bet"; amount:number; side:"hi"|"lo" } | { type:"next" };

export function initialState(seed: number, settings: DiceAddBetSettings): DiceAddBetState {
  const rng = mulberry32(seed);
  return { dice: null, coins: 100, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "betting", bet: 0, choice: null, lastWin: null, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: DiceAddBetState, action: DiceAddBetAction): DiceAddBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = Math.floor(rng() * 6) + 1;
    const d2 = Math.floor(rng() * 6) + 1;
    const d3 = Math.floor(rng() * 6) + 1;
    const sum = d1 + d2 + d3;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const amount = Math.max(1, Math.min(action.amount, state.coins));
    const win = (action.side === "hi") === (sum > 10);
    const newCoins = Math.max(0, state.coins + (win ? amount : -amount));
    const done = (state.round >= state.maxRounds || newCoins <= 0);
    return { ...state, dice: [d1,d2,d3], coins: newCoins, bet: amount, choice: action.side, lastWin: win, phase: done ? "gameover" : "result", rngSeed: nextSeed };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, dice: null, round: state.round + 1, choice: null, lastWin: null, phase: "betting" };
  }
  return state;
}

export function isTerminal(state: DiceAddBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
