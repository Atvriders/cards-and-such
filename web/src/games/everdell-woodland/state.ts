import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const CARDS_PER_ROUND = 3;
export const DECK: { name: string; value: number }[] = [
  { name: "Mouse", value: 1 },
  { name: "Rabbit", value: 2 },
  { name: "Fox", value: 3 },
  { name: "House", value: 4 },
  { name: "Bear", value: 5 },
  { name: "Tower", value: 7 },
];

export interface EverdellWoodlandSettings { dummy: boolean; }
export interface EverdellWoodlandState {
  rngSeed: number;
  round: number;
  hand: number[]; // indices into DECK
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type EverdellWoodlandAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: EverdellWoodlandSettings): EverdellWoodlandState {
  return { rngSeed: seed, round: 1, hand: [], lastPts: 0, score: 0, phase: "drawing" };
}
export function scoreHand(hand: number[]): number {
  return hand.reduce((a,i) => a + (DECK[i]?.value ?? 0), 0);
}
export function reducer(state: EverdellWoodlandState, action: EverdellWoodlandAction): EverdellWoodlandState {
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
export function isTerminal(state: EverdellWoodlandState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
