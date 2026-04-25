import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Coin Bet: Roll a die and bet heads or tails on a virtual coin toss each round.
// Actually: bet on whether the die result is odd or even.

export interface DiceCoinBetSettings { rounds: "10" | "20"; }

export interface DiceCoinBetState {
  coins: number;
  round: number;
  maxRounds: number;
  dieResult: number | null;
  bid: number;
  phase: "betting" | "rolled" | "gameover";
  lastWin: boolean | null;
  rngSeed: number;
}

export type DiceCoinBetAction =
  | { type: "bet"; amount: number; side: "odd" | "even" }
  | { type: "next" };

export function initialState(seed: number, settings: DiceCoinBetSettings): DiceCoinBetState {
  const rng = mulberry32(seed);
  return { coins: 100, round: 1, maxRounds: parseInt(settings.rounds, 10), dieResult: null, bid: 0, phase: "betting", lastWin: null, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: DiceCoinBetState, action: DiceCoinBetAction): DiceCoinBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const die = Math.floor(rng() * 6) + 1;
    const amount = Math.max(1, Math.min(action.amount, state.coins));
    const win = (action.side === "odd") === (die % 2 === 1);
    const newCoins = Math.max(0, state.coins + (win ? amount : -amount));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const phase = (state.round >= state.maxRounds || newCoins <= 0) ? "gameover" : "rolled";
    return { ...state, dieResult: die, bid: amount, lastWin: win, coins: newCoins, phase, rngSeed: nextSeed };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, dieResult: null, round: state.round + 1, phase: "betting", lastWin: null };
  }
  return state;
}

export function isTerminal(state: DiceCoinBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
