import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const CARDS_PER_ROUND = 3;
export const DECK: { name: string; value: number }[] = [
  { name: "Trinket", value: 1 },
  { name: "Gold", value: 3 },
  { name: "Gem", value: 5 },
  { name: "Clank", value: 0 },
  { name: "Clank", value: 0 },
];

export interface ClankDungeonLootSettings { dummy: boolean; }
export interface ClankDungeonLootState {
  rngSeed: number;
  round: number;
  hand: number[];
  clankCount: number;
  bonus: number;
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type ClankDungeonLootAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: ClankDungeonLootSettings): ClankDungeonLootState {
  return { rngSeed: seed, round: 1, hand: [], clankCount: 0, bonus: 0, lastPts: 0, score: 0, phase: "drawing" };
}
export function scoreHand(hand: number[]): { base: number; bonus: number; clanks: number } {
  let base = 0;
  let clanks = 0;
  for (const i of hand) {
    const c = DECK[i];
    if (!c) continue;
    if (c.name === "Clank") clanks++;
    else base += c.value;
  }
  const bonus = clanks === 0 ? 5 : 0;
  return { base, bonus, clanks };
}
export function reducer(state: ClankDungeonLootState, action: ClankDungeonLootAction): ClankDungeonLootState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand: number[] = [];
    for (let i = 0; i < CARDS_PER_ROUND; i++) hand.push(Math.floor(rng() * DECK.length));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { base, bonus, clanks } = scoreHand(hand);
    const total = base + bonus;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, clankCount: clanks, bonus, lastPts: total, score: state.score + total, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], clankCount: 0, bonus: 0, lastPts: 0, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: ClankDungeonLootState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
