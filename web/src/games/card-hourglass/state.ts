import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const HAND_SIZE = 5;

export interface CardHourglassSettings { dummy: boolean; }

export interface CardHourglassState {
  rngSeed: number;
  round: number;
  hand: number[];
  score: number;
  lastPts: number;
  phase: "dealing" | "scored" | "done";
}

export type CardHourglassAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function scoreHand(cards: number[]): number {
  const ranks = cards.map(c => c % 13);
  // hourglass: down then up around middle index
  const mid = Math.floor(ranks.length / 2);
  for (let i = 1; i <= mid; i++) if (ranks[i]! > ranks[i - 1]!) return 0;
  for (let i = mid + 1; i < ranks.length; i++) if (ranks[i]! < ranks[i - 1]!) return 0;
  return 40;
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

export function initialState(seed: number, _settings: CardHourglassSettings): CardHourglassState {
  return { rngSeed: seed, round: 1, hand: [], score: 0, lastPts: 0, phase: "dealing" };
}

export function reducer(state: CardHourglassState, action: CardHourglassAction): CardHourglassState {
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

export function isTerminal(state: CardHourglassState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
