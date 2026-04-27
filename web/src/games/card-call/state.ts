import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Call: Predict color (Red/Black) of the next card. 16 rounds. +10 per correct call.

export const TOTAL_ROUNDS = 16;

export interface CardCallSettings { dummy: boolean; }

export interface CardCallState {
  rngSeed: number;
  round: number;
  prediction: "red" | "black" | null;
  card: number | null; // 0..51 or null
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
}

export type CardCallAction = { type: "predict"; choice: "red" | "black" } | { type: "next" };

export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function initialState(seed: number, _settings: CardCallSettings): CardCallState {
  return { rngSeed: seed, round: 1, prediction: null, card: null, score: 0, phase: "predict", lastWin: false };
}

export function reducer(state: CardCallState, action: CardCallAction): CardCallState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const card = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = (action.choice === "red") === isRed(card);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, card, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, card: null, phase: "predict", lastWin: false };
  }
  return state;
}

export function isTerminal(state: CardCallState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
