import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardMidPickSettings { rounds: "10" | "20"; }
export interface CardMidPickState {
  rngSeed: number; hand: number[]; picked: number | null; score: number;
  round: number; maxRounds: number; phase: "picking" | "result" | "gameover"; lastPts: number;
}
export type CardMidPickAction = { type: "pick"; index: number } | { type: "next" };

export function rankName(c: number): string { return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]!; }
export function suitName(c: number): string { return ["♠","♥","♦","♣"][Math.floor(c / 13)]!; }

export function initialState(seed: number, settings: CardMidPickSettings): CardMidPickState {
  const rng = mulberry32(seed);
  const hand = Array.from({ length: 5 }, () => Math.floor(rng() * 52));
  return { rngSeed: Math.floor(rng() * 2 ** 31), hand, picked: null, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "picking", lastPts: 0 };
}

export function reducer(state: CardMidPickState, action: CardMidPickAction): CardMidPickState {
  if (state.phase === "gameover") return state;
  if (action.type === "pick" && state.phase === "picking") {
    const picked = state.hand[action.index]!;
    const sorted = [...state.hand].sort((a, b) => (a % 13) - (b % 13));
    const midRank = (sorted[2]! % 13);
    const diff = Math.abs((picked % 13) - midRank);
    const pts = Math.max(0, 30 - diff * 6);
    const rng = mulberry32(state.rngSeed);
    const newHand = Array.from({ length: 5 }, () => Math.floor(rng() * 52));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const done = state.round >= state.maxRounds;
    return { ...state, picked: action.index, lastPts: pts, score: state.score + pts, hand: newHand, rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, picked: null, round: state.round + 1, phase: "picking" };
  }
  return state;
}

export function isTerminal(state: CardMidPickState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
