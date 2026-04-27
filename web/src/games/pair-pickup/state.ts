import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pair Pickup: 12 draws of 5 cards. Score per pair found in the hand.
// Score: 75 points per distinct pair (e.g., two 7s = 1 pair = 75. four 7s = 6 pairs = 450).

export const TOTAL_DRAWS = 12;
export const HAND_SIZE = 5;
export const PAIR_POINTS = 75;

export interface PairPickupSettings { dummy: boolean; }

export interface PairPickupState {
  rngSeed: number;
  draw: number;
  hand: number[];
  pairsFound: number;
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
}

export type PairPickupAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function countPairs(hand: number[]): number {
  const counts = new Map<number, number>();
  for (const c of hand) {
    const r = c % 13;
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  let pairs = 0;
  for (const n of counts.values()) {
    pairs += (n * (n - 1)) / 2; // C(n,2) pairs from n cards of same rank
  }
  return pairs;
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

export function initialState(seed: number, _settings: PairPickupSettings): PairPickupState {
  return { rngSeed: seed, draw: 1, hand: [], pairsFound: 0, score: 0, phase: "dealing", lastPts: 0 };
}

export function reducer(state: PairPickupState, action: PairPickupAction): PairPickupState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = dealHand(rng, HAND_SIZE);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pairs = countPairs(hand);
    const pts = pairs * PAIR_POINTS;
    const isLast = state.draw >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, hand, pairsFound: pairs, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, draw: state.draw + 1, hand: [], pairsFound: 0, phase: "dealing", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: PairPickupState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
