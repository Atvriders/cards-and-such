import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Color Bet: Roll 2 dice. Bet on Red (sum odd) or Blue (sum even). Win = +bet. Lose = -bet.
export interface DiceColorBetSettings { rounds: "10" | "20"; }

export interface DiceColorBetState {
  dice: [number, number] | null;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "betting" | "result" | "gameover";
  bet: number;
  choice: "red" | "blue" | null;
  lastWin: boolean | null;
  rngSeed: number;
}

export type DiceColorBetAction = { type: "bet"; amount: number; color: "red" | "blue" } | { type: "next" };

export function initialState(seed: number, settings: DiceColorBetSettings): DiceColorBetState {
  const rng = mulberry32(seed);
  return { dice: null, coins: 100, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "betting", bet: 0, choice: null, lastWin: null, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: DiceColorBetState, action: DiceColorBetAction): DiceColorBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = Math.floor(rng() * 6) + 1;
    const d2 = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = d1 + d2;
    const amount = Math.max(1, Math.min(action.amount, state.coins));
    const win = (action.color === "red") === (sum % 2 === 1);
    const newCoins = Math.max(0, state.coins + (win ? amount : -amount));
    const done = state.round >= state.maxRounds || newCoins <= 0;
    return { ...state, dice: [d1, d2], coins: newCoins, bet: amount, choice: action.color, lastWin: win, phase: done ? "gameover" : "result", rngSeed: nextSeed };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, dice: null, round: state.round + 1, choice: null, lastWin: null, phase: "betting" };
  }
  return state;
}

export function isTerminal(state: DiceColorBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
