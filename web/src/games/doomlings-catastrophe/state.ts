import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const CARDS_PER_ROUND = 3;
export const DECK: { name: string; value: number }[] = [
  { name: "Doomling", value: 2 },
  { name: "Doomling", value: 3 },
  { name: "Doomling", value: 4 },
  { name: "Doomling", value: 5 },
  { name: "Doomling", value: 6 },
  { name: "Doomling", value: 7 },
];

export const CATASTROPHES: { name: string; value: number }[] = [
  { name: "Mild", value: 1 },
  { name: "Storm", value: 2 },
  { name: "Quake", value: 3 },
  { name: "Plague", value: 4 },
  { name: "Eclipse", value: 5 },
  { name: "Apocalypse", value: 6 },
];

export interface DoomlingsCatastropheSettings { dummy: boolean; }
export interface DoomlingsCatastropheState {
  rngSeed: number;
  round: number;
  hand: number[];
  catastrophe: number;
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type DoomlingsCatastropheAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: DoomlingsCatastropheSettings): DoomlingsCatastropheState {
  return { rngSeed: seed, round: 1, hand: [], catastrophe: 0, lastPts: 0, score: 0, phase: "drawing" };
}
export function scoreHand(hand: number[], catastrophe: number): number {
  const base = hand.reduce((a, i) => a + (DECK[i]?.value ?? 0), 0);
  return Math.max(0, base - catastrophe);
}
export function reducer(state: DoomlingsCatastropheState, action: DoomlingsCatastropheAction): DoomlingsCatastropheState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand: number[] = [];
    for (let i = 0; i < CARDS_PER_ROUND; i++) hand.push(Math.floor(rng() * DECK.length));
    const cat = CATASTROPHES[Math.floor(rng() * CATASTROPHES.length)]!.value;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreHand(hand, cat);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, catastrophe: cat, lastPts: pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], catastrophe: 0, lastPts: 0, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: DoomlingsCatastropheState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
