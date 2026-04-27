import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Red Roulette: 10 rounds. Player predicts whether next card will be RED (hearts/diamonds).
// +10 per correct prediction.

export const TOTAL_ROUNDS = 10;

export interface RedRouletteSettings { dummy: boolean; }

export interface RedRouletteState {
  rngSeed: number;
  round: number;
  prediction: "red" | "black" | null;
  card: number | null;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
}

export type RedRouletteAction =
  | { type: "predict"; choice: "red" | "black" }
  | { type: "next" };

export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function initialState(seed: number, _settings: RedRouletteSettings): RedRouletteState {
  return { rngSeed: seed, round: 1, prediction: null, card: null, score: 0, phase: "predict", lastWin: false };
}

export function reducer(state: RedRouletteState, action: RedRouletteAction): RedRouletteState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const cardIsRed = isRed(c);
    const win = (action.choice === "red" && cardIsRed) || (action.choice === "black" && !cardIsRed);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, card: c, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, card: null, phase: "predict", lastWin: false };
  }
  return state;
}

export function isTerminal(state: RedRouletteState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
