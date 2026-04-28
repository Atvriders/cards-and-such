import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_CARDS = 16;
export const SUITS = ["S","H","D","C"] as const;
export type Suit = typeof SUITS[number];
export interface CardShovelSettings { dummy: boolean; }
export interface CardShovelCard { suit: Suit; rank: number; id: number; }
export interface CardShovelState {
  rngSeed: number;
  deck: CardShovelCard[]; // remaining
  current: CardShovelCard | null;
  buckets: Record<Suit, number>; // count placed
  played: number;
  errors: number;
  score: number;
  phase: "playing" | "done";
}
export type CardShovelAction = { type: "place"; suit: Suit };
function makeDeck(seed: number): CardShovelCard[] {
  const rng = mulberry32(seed);
  const deck: CardShovelCard[] = [];
  let id = 1;
  for (let i = 0; i < TOTAL_CARDS; i++) {
    const s = SUITS[Math.floor(rng() * 4)]!;
    const r = 1 + Math.floor(rng() * 13);
    deck.push({ suit: s, rank: r, id: id++ });
  }
  return deck;
}
export function initialState(seed: number, _s: CardShovelSettings): CardShovelState {
  const deck = makeDeck(seed);
  const current = deck[0] ?? null;
  return { rngSeed: seed, deck: deck.slice(1), current, buckets: { S:0,H:0,D:0,C:0 }, played: 0, errors: 0, score: 0, phase: current ? "playing" : "done" };
}
export function reducer(state: CardShovelState, action: CardShovelAction): CardShovelState {
  if (state.phase === "done") return state;
  if (action.type === "place") {
    if (!state.current) return state;
    const ok = state.current.suit === action.suit;
    const buckets = { ...state.buckets, [action.suit]: state.buckets[action.suit] + (ok ? 1 : 0) };
    const score = state.score + (ok ? 10 : -5);
    const errors = state.errors + (ok ? 0 : 1);
    const played = state.played + 1;
    const next = state.deck[0] ?? null;
    const rest = state.deck.slice(1);
    const phase = next ? "playing" : "done";
    return { ...state, current: next, deck: rest, buckets, score, errors, played, phase };
  }
  return state;
}
export function isTerminal(state: CardShovelState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
