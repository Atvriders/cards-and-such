import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardPopBetSettings { rounds: "10" | "20"; }
export interface CardPopBetState {
  rngSeed: number; coins: number; round: number; maxRounds: number;
  phase: "betting" | "result" | "gameover";
  card: number | null; bet: number; choice: "hi" | "lo" | null; lastWin: boolean | null;
}
export type CardPopBetAction = { type: "bet"; amount: number; side: "hi" | "lo" } | { type: "next" };

export function rankOf(c: number): number { return c % 13; }
export function rankName(c: number): string { return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]!; }
export function suitName(c: number): string { return ["♠","♥","♦","♣"][Math.floor(c / 13)]!; }

export function initialState(seed: number, settings: CardPopBetSettings): CardPopBetState {
  const rng = mulberry32(seed);
  return { rngSeed: Math.floor(rng() * 2 ** 31), coins: 100, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "betting", card: null, bet: 0, choice: null, lastWin: null };
}

export function reducer(state: CardPopBetState, action: CardPopBetAction): CardPopBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const card = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rank = rankOf(card);
    const amount = Math.max(1, Math.min(action.amount, state.coins));
    const win = (action.side === "hi") ? (rank >= 6) : (rank < 6);
    const newCoins = state.coins + (win ? amount : -amount);
    const done = state.round >= state.maxRounds || newCoins <= 0;
    return { ...state, card, bet: amount, choice: action.side, lastWin: win, coins: Math.max(0, newCoins), rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, card: null, round: state.round + 1, choice: null, lastWin: null, phase: "betting" };
  }
  return state;
}

export function isTerminal(state: CardPopBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
