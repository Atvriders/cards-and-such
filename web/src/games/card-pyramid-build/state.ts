import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Pyramid Build: build a 4-row pyramid (1+2+3+4=10 cards). Each row needs strict sum order.
// Score: each card placed = 5 points base. Bonus 25 if total pyramid sum descends row-by-row.

export const TOTAL_CARDS = 10;

export interface CardPyramidBuildSettings { dummy: boolean; }

export interface CardPyramidBuildState {
  rngSeed: number;
  hand: number[]; // remaining draw pile
  pyramid: (number | null)[]; // 10 slots, top to bottom
  current: number; // next index to fill 0..9
  score: number;
  phase: "playing" | "done";
}

export type CardPyramidBuildAction = { type: "draw" } | { type: "place"; slot: number } | { type: "skip" };

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

function buildDeck(rng: () => number): number[] {
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export function initialState(seed: number, _settings: CardPyramidBuildSettings): CardPyramidBuildState {
  const rng = mulberry32(seed);
  const deck = buildDeck(rng);
  return { rngSeed: Math.floor(rng() * 2 ** 31), hand: deck, pyramid: Array(TOTAL_CARDS).fill(null), current: 0, score: 0, phase: "playing" };
}

function rowSums(pyramid: (number | null)[]): number[] {
  const rows = [[0], [1,2], [3,4,5], [6,7,8,9]];
  return rows.map(idxs => idxs.reduce((acc, i) => acc + (pyramid[i] !== null ? rankValue(pyramid[i] as number) : 0), 0));
}

export function reducer(state: CardPyramidBuildState, action: CardPyramidBuildAction): CardPyramidBuildState {
  if (state.phase === "done") return state;
  if (action.type === "place") {
    if (action.slot !== state.current) return state;
    if (state.hand.length === 0) return state;
    const card = state.hand[0]!;
    const pyramid = [...state.pyramid];
    pyramid[state.current] = card;
    const newCurrent = state.current + 1;
    const newScore = state.score + 5;
    if (newCurrent >= TOTAL_CARDS) {
      const sums = rowSums(pyramid);
      const descending = sums[0]! >= sums[1]!/2 && sums[1]! <= sums[2]! && sums[2]! <= sums[3]!;
      const bonus = descending ? 25 : 0;
      return { ...state, hand: state.hand.slice(1), pyramid, current: newCurrent, score: newScore + bonus, phase: "done" };
    }
    return { ...state, hand: state.hand.slice(1), pyramid, current: newCurrent, score: newScore };
  }
  if (action.type === "skip") {
    if (state.hand.length <= 1) return state;
    return { ...state, hand: state.hand.slice(1) };
  }
  return state;
}

export function isTerminal(state: CardPyramidBuildState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
