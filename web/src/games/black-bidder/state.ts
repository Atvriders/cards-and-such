import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Black Bidder: 10 rounds. Player predicts whether next card will be BLACK (spades/clubs).
// +10 per correct prediction.

export const TOTAL_ROUNDS = 10;

export interface BlackBidderSettings { dummy: boolean; }

export interface BlackBidderState {
  rngSeed: number;
  round: number;
  prediction: "black" | "red" | null;
  card: number | null;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
}

export type BlackBidderAction =
  | { type: "predict"; choice: "black" | "red" }
  | { type: "next" };

export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function isBlack(c: number): boolean { return !isRed(c); }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function initialState(seed: number, _settings: BlackBidderSettings): BlackBidderState {
  return { rngSeed: seed, round: 1, prediction: null, card: null, score: 0, phase: "predict", lastWin: false };
}

export function reducer(state: BlackBidderState, action: BlackBidderAction): BlackBidderState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const cardIsBlack = isBlack(c);
    const win = (action.choice === "black" && cardIsBlack) || (action.choice === "red" && !cardIsBlack);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, card: c, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, card: null, phase: "predict", lastWin: false };
  }
  return state;
}

export function isTerminal(state: BlackBidderState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
