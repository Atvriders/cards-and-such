import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_DRAWS = 18;
export const HAND_LIMIT = 6;
export interface CardTrioBuildSettings { dummy: boolean; }
export interface CardTrioCard { rank: number; id: number; }
export interface CardTrioBuildState {
  rngSeed: number;
  deck: CardTrioCard[];
  hand: CardTrioCard[];
  trios: number; // count of trios formed
  drew: number;
  score: number;
  phase: "playing" | "done";
}
export type CardTrioBuildAction = { type: "draw" } | { type: "build"; rank: number } | { type: "discard"; cardId: number };
function makeDeck(seed: number): CardTrioCard[] {
  const rng = mulberry32(seed);
  const deck: CardTrioCard[] = [];
  for (let i = 0; i < TOTAL_DRAWS + 5; i++) deck.push({ rank: 1 + Math.floor(rng() * 13), id: i + 1 });
  return deck;
}
export function initialState(seed: number, _s: CardTrioBuildSettings): CardTrioBuildState {
  return { rngSeed: seed, deck: makeDeck(seed), hand: [], trios: 0, drew: 0, score: 0, phase: "playing" };
}
function ensureDone(state: CardTrioBuildState): CardTrioBuildState {
  return state.drew >= TOTAL_DRAWS && state.deck.length === 0 ? { ...state, phase: "done" } : state;
}
export function reducer(state: CardTrioBuildState, action: CardTrioBuildAction): CardTrioBuildState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.drew >= TOTAL_DRAWS) return state;
    if (state.hand.length >= HAND_LIMIT) return state;
    const next = state.deck[0]; if (!next) return state;
    const hand = [...state.hand, next];
    const newState = { ...state, deck: state.deck.slice(1), hand, drew: state.drew + 1 };
    return ensureDone(newState);
  }
  if (action.type === "build") {
    const matches = state.hand.filter(c => c.rank === action.rank);
    if (matches.length < 3) return state;
    const ids = new Set(matches.slice(0, 3).map(c => c.id));
    const hand = state.hand.filter(c => !ids.has(c.id));
    const score = state.score + 30;
    const trios = state.trios + 1;
    const newState = { ...state, hand, score, trios };
    return ensureDone(newState);
  }
  if (action.type === "discard") {
    const idx = state.hand.findIndex(c => c.id === action.cardId);
    if (idx < 0) return state;
    const hand = [...state.hand]; hand.splice(idx, 1);
    const newState = { ...state, hand, score: state.score - 1 };
    return ensureDone(newState);
  }
  return state;
}
export function isTerminal(state: CardTrioBuildState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
