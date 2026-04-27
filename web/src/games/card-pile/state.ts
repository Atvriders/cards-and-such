import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Pile: each round, draw cards onto a pile aiming for sum near target (15..25 random).
// Rank values: 2..10 face, J=11, Q=12, K=13, A=1. Hit "Stop" to score: 30 - |sum-target|*3 (min 0).
// Pile auto-stops if sum >= target+10 (bust). 8 rounds.

export const TOTAL_ROUNDS = 8;

export interface CardPileSettings { dummy: boolean; }

export interface CardPileState {
  rngSeed: number;
  round: number;
  target: number;
  pile: number[]; // card indices 0..51
  sum: number;
  score: number;
  phase: "drawing" | "scored" | "done";
  lastPts: number;
}

export type CardPileAction = { type: "draw" } | { type: "stop" } | { type: "next" };

export function rankValue(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2;
  if (r === 9) return 11;
  if (r === 10) return 12;
  if (r === 11) return 13;
  return 1;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function pickTarget(rng: () => number): number { return 15 + Math.floor(rng() * 11); }

export function initialState(seed: number, _settings: CardPileSettings): CardPileState {
  const rng = mulberry32(seed);
  const target = pickTarget(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, target, pile: [], sum: 0, score: 0, phase: "drawing", lastPts: 0 };
}

function score(sum: number, target: number): number {
  const diff = Math.abs(sum - target);
  return Math.max(0, 30 - diff * 3);
}

export function reducer(state: CardPileState, action: CardPileAction): CardPileState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pile = [...state.pile, c];
    const sum = state.sum + rankValue(c);
    const bust = sum >= state.target + 10;
    if (bust) {
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: nextSeed, pile, sum, phase: isLast ? "done" : "scored", lastPts: 0 };
    }
    return { ...state, rngSeed: nextSeed, pile, sum };
  }
  if (action.type === "stop") {
    if (state.phase !== "drawing") return state;
    const pts = score(state.sum, state.target);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed);
    const target = pickTarget(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, target, pile: [], sum: 0, phase: "drawing", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: CardPileState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
