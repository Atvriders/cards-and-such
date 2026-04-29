import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const CARDS_PER_ROUND = 3;
export const DECK: { name: string; value: number }[] = [
  { name: "Imp", value: 2 },
  { name: "Trap", value: 4 },
  { name: "Monster", value: 5 },
  { name: "Tunnel", value: 3 },
  { name: "Boss", value: 6 },
];

export interface DungeonLordsTrapSettings { dummy: boolean; }
export interface DungeonLordsTrapState {
  rngSeed: number;
  round: number;
  hand: number[];
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type DungeonLordsTrapAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: DungeonLordsTrapSettings): DungeonLordsTrapState {
  return { rngSeed: seed, round: 1, hand: [], lastPts: 0, score: 0, phase: "drawing" };
}
export function scoreHand(hand: number[]): number {
  return hand.reduce((a,i) => a + (DECK[i]?.value ?? 0), 0);
}
export function reducer(state: DungeonLordsTrapState, action: DungeonLordsTrapAction): DungeonLordsTrapState {
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
export function isTerminal(state: DungeonLordsTrapState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
