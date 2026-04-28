import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_DRAWS = 12;
export interface CardSpiralSettings { dummy: boolean; }
export interface CardSpiralCard { rank: number; id: number; } // 1..13
export interface CardSpiralState {
  rngSeed: number;
  deck: CardSpiralCard[]; // remaining draws
  spiral: CardSpiralCard[]; // placed in ascending order
  drawn: CardSpiralCard | null;
  drew: number;
  score: number;
  phase: "playing" | "done";
}
export type CardSpiralAction = { type: "draw" } | { type: "keep" } | { type: "discard" };
function makeDeck(seed: number): CardSpiralCard[] {
  const rng = mulberry32(seed);
  const deck: CardSpiralCard[] = [];
  for (let i = 0; i < TOTAL_DRAWS + 4; i++) {
    deck.push({ rank: 1 + Math.floor(rng() * 13), id: i + 1 });
  }
  return deck;
}
export function initialState(seed: number, _s: CardSpiralSettings): CardSpiralState {
  return { rngSeed: seed, deck: makeDeck(seed), spiral: [], drawn: null, drew: 0, score: 0, phase: "playing" };
}
export function reducer(state: CardSpiralState, action: CardSpiralAction): CardSpiralState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.drawn) return state;
    if (state.drew >= TOTAL_DRAWS) return state;
    const next = state.deck[0] ?? null;
    const rest = state.deck.slice(1);
    return { ...state, drawn: next, deck: rest, drew: state.drew + 1 };
  }
  if (action.type === "keep") {
    if (!state.drawn) return state;
    const last = state.spiral[state.spiral.length - 1];
    const ok = !last || state.drawn.rank >= last.rank;
    const score = state.score + (ok ? 15 : -5);
    const spiral = ok ? [...state.spiral, state.drawn] : state.spiral;
    const phase = state.drew >= TOTAL_DRAWS ? "done" : "playing";
    return { ...state, drawn: null, score, spiral, phase };
  }
  if (action.type === "discard") {
    if (!state.drawn) return state;
    const phase = state.drew >= TOTAL_DRAWS ? "done" : "playing";
    return { ...state, drawn: null, phase };
  }
  return state;
}
export function isTerminal(state: CardSpiralState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
