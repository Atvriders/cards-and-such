import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_DRAWS = 12;
export interface CardPetShopSettings { dummy: boolean; }
export interface CardPetShopState {
  rngSeed: number;
  drawCount: number;
  card: number | null;
  lastPts: number;
  score: number;
  history: number[];
  phase: "drawing" | "scored" | "done";
}
export type CardPetShopAction = { type: "draw" } | { type: "next" };
export function rankValue(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2;
  if (r === 9) return 11;
  if (r === 10) return 12;
  if (r === 11) return 13;
  return 14;
}
export function suitOf(c: number): number { return Math.floor(c / 13); }
export function isFace(c: number): boolean { const r = c % 13; return r >= 9 && r <= 11; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function initialState(seed: number, _settings: CardPetShopSettings): CardPetShopState {
  return { rngSeed: seed, drawCount: 0, card: null, lastPts: 0, score: 0, history: [], phase: "drawing" };
}
export function reducer(state: CardPetShopState, action: CardPetShopAction): CardPetShopState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const card = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = rankValue(card);
    
    if (isFace(card)) pts += 10;
    
    const newCount = state.drawCount + 1;
    const isLast = newCount >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, card, drawCount: newCount, lastPts: pts, score: state.score + pts, history: [...state.history, card], phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, card: null, lastPts: 0, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: CardPetShopState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
