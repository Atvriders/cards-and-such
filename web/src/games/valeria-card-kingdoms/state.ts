import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const CARDS_PER_ROUND = 3;
export const DECK: { name: string; value: number }[] = [
  { name: "Peasant", value: 1 },
  { name: "Soldier", value: 2 },
  { name: "Knight", value: 3 },
  { name: "Mage", value: 4 },
  { name: "Priest", value: 5 },
  { name: "Noble", value: 6 },
  { name: "Royal", value: 7 },
];

export interface ValeriaCardKingdomsSettings { dummy: boolean; }
export interface ValeriaCardKingdomsState {
  rngSeed: number;
  round: number;
  hand: number[]; // indices into DECK
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type ValeriaCardKingdomsAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: ValeriaCardKingdomsSettings): ValeriaCardKingdomsState {
  return { rngSeed: seed, round: 1, hand: [], lastPts: 0, score: 0, phase: "drawing" };
}
export function scoreHand(hand: number[]): number {
  return hand.reduce((a,i) => a + (DECK[i]?.value ?? 0), 0);
}
export function reducer(state: ValeriaCardKingdomsState, action: ValeriaCardKingdomsAction): ValeriaCardKingdomsState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand: number[] = [];
    for (let i = 0; i < CARDS_PER_ROUND; i++) hand.push(Math.floor(rng() * DECK.length));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreHand(hand);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, lastPts: pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], lastPts: 0, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: ValeriaCardKingdomsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
