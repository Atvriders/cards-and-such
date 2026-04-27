import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Cut the Deck: 12 rounds. Predict if cut card rank (2..14) is OVER 7 or UNDER 7.
// Rank == 7 -> push (no points). Correct call -> +10 points.

export const TOTAL_ROUNDS = 12;

export interface CutTheDeckSettings { dummy: boolean; }

export interface CutTheDeckState {
  rngSeed: number;
  round: number;
  prediction: "over" | "under" | null;
  card: number | null;
  rank: number; // 2..14
  push: boolean;
  lastWin: boolean;
  score: number;
  phase: "predict" | "result" | "done";
}

export type CutTheDeckAction =
  | { type: "predict"; choice: "over" | "under" }
  | { type: "next" };

export function rankOf(c: number): number { return (c % 13) + 2; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, _settings: CutTheDeckSettings): CutTheDeckState {
  return { rngSeed: seed, round: 1, prediction: null, card: null, rank: 0, push: false, lastWin: false, score: 0, phase: "predict" };
}

export function reducer(state: CutTheDeckState, action: CutTheDeckAction): CutTheDeckState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const r = rankOf(c);
    let push = false; let win = false;
    if (r === 7) push = true;
    else if (action.choice === "over") win = r > 7;
    else win = r < 7;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, card: c, rank: r, push, lastWin: win, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, card: null, rank: 0, push: false, lastWin: false, phase: "predict" };
  }
  return state;
}

export function isTerminal(state: CutTheDeckState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
