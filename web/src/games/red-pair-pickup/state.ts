import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 14;
export const HAND_SIZE = 2;

export interface RedPairPickupSettings { dummy: boolean; }

export interface RedPairPickupState {
  rngSeed: number;
  round: number;
  hand: number[];
  score: number;
  lastPts: number;
  phase: "dealing" | "scored" | "done";
}

export type RedPairPickupAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function scoreHand(cards: number[]): number {
  if (cards.length < 2) return 0;
  const isRed = (c: number) => { const s = Math.floor(c / 13); return s === 1 || s === 2; };
  return cards.every(isRed) ? 30 : 0;
}

function dealHand(rng: () => number, n: number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < n) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: RedPairPickupSettings): RedPairPickupState {
  return { rngSeed: seed, round: 1, hand: [], score: 0, lastPts: 0, phase: "dealing" };
}

export function reducer(state: RedPairPickupState, action: RedPairPickupAction): RedPairPickupState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = dealHand(rng, HAND_SIZE);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreHand(hand);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], lastPts: 0, phase: "dealing" };
  }
  return state;
}

export function isTerminal(state: RedPairPickupState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
