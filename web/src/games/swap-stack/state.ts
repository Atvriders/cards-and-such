import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Swap Stack: 10 rounds. Each round draw a card. Decide to KEEP (score = rank - 1) or SWAP for a new card.
// If you swap, you must keep the swapped card. Encourages swapping low cards.

export const TOTAL_ROUNDS = 10;

export interface SwapStackSettings { dummy: boolean; }

export interface SwapStackState {
  rngSeed: number;
  round: number;
  card: number | null;
  swapped: boolean;
  pts: number;
  score: number;
  phase: "decide" | "scored" | "done";
}

export type SwapStackAction =
  | { type: "deal" }
  | { type: "keep" }
  | { type: "swap" }
  | { type: "next" };

export function rankOf(c: number): number { return (c % 13) + 2; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function drawOne(rng: () => number): number { return Math.floor(rng() * 52); }

export function initialState(seed: number, _settings: SwapStackSettings): SwapStackState {
  const rng = mulberry32(seed);
  const card = drawOne(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, card, swapped: false, pts: 0, score: 0, phase: "decide" };
}

export function reducer(state: SwapStackState, action: SwapStackAction): SwapStackState {
  if (state.phase === "done") return state;
  if (action.type === "keep" || action.type === "swap") {
    if (state.phase !== "decide" || state.card === null) return state;
    let card = state.card;
    let swapped = false;
    let nextSeed = state.rngSeed;
    if (action.type === "swap") {
      const rng = mulberry32(state.rngSeed);
      card = drawOne(rng);
      nextSeed = Math.floor(rng() * 2 ** 31);
      swapped = true;
    }
    const pts = Math.max(0, rankOf(card) - 1);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, card, swapped, pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed);
    const card = drawOne(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, card, swapped: false, pts: 0, phase: "decide" };
  }
  return state;
}

export function isTerminal(state: SwapStackState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
