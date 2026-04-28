import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export const DEAL_COUNT = 4;
export interface CardMeteorSettings { dummy: boolean; }
export interface CardMeteorState {
  rngSeed: number;
  round: number;
  cards: number[];
  picked: number | null;
  score: number;
  phase: "picking" | "scored" | "done";
  lastPts: number;
  target: number;
}
export type CardMeteorAction = { type: "pick"; index: number } | { type: "next" } | { type: "deal" };
export function rankOf(c: number): number { return c % 13; }
export function suitOf(c: number): number { return Math.floor(c / 13); }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function dealUnique(rng: () => number, n: number): number[] {
  const used = new Set<number>(); const out: number[] = [];
  while (out.length < n) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); out.push(c); } }
  return out;
}
export function initialState(seed: number, _settings: CardMeteorSettings): CardMeteorState {
  const rng = mulberry32(seed);
  const cards = dealUnique(rng, DEAL_COUNT);
  const target = Math.floor(rng() * 4);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, cards, picked: null, score: 0, phase: "picking", lastPts: 0, target };
}
export function scoreFor(c: number, _cards: number[], target: number): number {
  const r = c % 13;
    const lowness = 12 - r;
    return lowness * 3;
}
export function reducer(state: CardMeteorState, action: CardMeteorAction): CardMeteorState {
  if (state.phase === "done") return state;
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    if (action.index < 0 || action.index >= state.cards.length) return state;
    const card = state.cards[action.index]!;
    const pts = scoreFor(card, state.cards, state.target);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, picked: card, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next" || action.type === "deal") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed);
    const cards = dealUnique(rng, DEAL_COUNT);
    const target = Math.floor(rng() * 4);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, cards, picked: null, phase: "picking", lastPts: 0, target };
  }
  return state;
}
export function isTerminal(state: CardMeteorState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
