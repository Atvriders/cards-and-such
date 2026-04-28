import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_PLAYS = 12;
export interface CardDominoSettings { dummy: boolean; }
export interface CardDominoCard { rank: number; id: number; }
export interface CardDominoState {
  rngSeed: number;
  hand: CardDominoCard[];
  chain: CardDominoCard[]; // played sequence; each must match prev rank ±1 or equal
  played: number;
  score: number;
  phase: "playing" | "done";
}
export type CardDominoAction = { type: "play"; cardId: number } | { type: "skip" };
function makeHand(seed: number): CardDominoCard[] {
  const rng = mulberry32(seed);
  const cards: CardDominoCard[] = [];
  for (let i = 0; i < TOTAL_PLAYS + 4; i++) cards.push({ rank: 1 + Math.floor(rng() * 13), id: i + 1 });
  return cards;
}
export function initialState(seed: number, _s: CardDominoSettings): CardDominoState {
  return { rngSeed: seed, hand: makeHand(seed), chain: [], played: 0, score: 0, phase: "playing" };
}
function canPlay(prev: CardDominoCard | undefined, c: CardDominoCard): boolean {
  if (!prev) return true;
  const d = Math.abs(prev.rank - c.rank);
  return d <= 1; // equal or off by 1
}
export function reducer(state: CardDominoState, action: CardDominoAction): CardDominoState {
  if (state.phase === "done") return state;
  if (action.type === "skip") {
    const played = state.played + 1;
    const phase = played >= TOTAL_PLAYS ? "done" : "playing";
    return { ...state, played, score: state.score - 2, phase };
  }
  if (action.type === "play") {
    const idx = state.hand.findIndex(c => c.id === action.cardId);
    if (idx < 0) return state;
    const card = state.hand[idx]!;
    const last = state.chain[state.chain.length - 1];
    const ok = canPlay(last, card);
    const hand = [...state.hand]; hand.splice(idx, 1);
    const chain = ok ? [...state.chain, card] : state.chain;
    const score = state.score + (ok ? 12 : -3);
    const played = state.played + 1;
    const phase = played >= TOTAL_PLAYS ? "done" : "playing";
    return { ...state, hand, chain, played, score, phase };
  }
  return state;
}
export function isTerminal(state: CardDominoState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
