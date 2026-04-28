import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const CARDS_PER_ROUND = 4;
export const DECK: { name: string; value: number }[] = [
  { name: "Earth", value: 2 },
  { name: "Air", value: 3 },
  { name: "Fire", value: 4 },
  { name: "Water", value: 5 },
  { name: "Spirit", value: 6 },
];

export interface MysticValeCraftSettings { dummy: boolean; }
export interface MysticValeCraftState {
  rngSeed: number;
  round: number;
  hand: number[];
  lastPts: number;
  bonus: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type MysticValeCraftAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: MysticValeCraftSettings): MysticValeCraftState {
  return { rngSeed: seed, round: 1, hand: [], lastPts: 0, bonus: 0, score: 0, phase: "drawing" };
}
export function scoreHand(hand: number[]): { base: number; bonus: number } {
  const base = hand.reduce((a, i) => a + (DECK[i]?.value ?? 0), 0);
  const counts = new Map<number, number>();
  for (const i of hand) counts.set(i, (counts.get(i) ?? 0) + 1);
  let bonus = 0;
  for (const c of counts.values()) {
    if (c >= 4) bonus += 12; else if (c >= 3) bonus += 8; else if (c >= 2) bonus += 4;
  }
  return { base, bonus };
}
export function reducer(state: MysticValeCraftState, action: MysticValeCraftAction): MysticValeCraftState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand: number[] = [];
    for (let i = 0; i < CARDS_PER_ROUND; i++) hand.push(Math.floor(rng() * DECK.length));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { base, bonus } = scoreHand(hand);
    const total = base + bonus;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, lastPts: total, bonus, score: state.score + total, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], lastPts: 0, bonus: 0, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: MysticValeCraftState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
