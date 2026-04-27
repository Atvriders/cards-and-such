import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Flush Five: 8 rounds. Each round, deal 5 cards. Score by longest matching-suit chain in the hand:
// 5-of-a-suit = 60 pts, 4 = 30 pts, 3 = 10 pts, else 0.
export const TOTAL_ROUNDS = 8;
export interface FlushFiveSettings { dummy: boolean; }
export interface FlushFiveState {
  rngSeed: number;
  round: number;
  hand: number[];
  bestSuitCount: number;
  bestSuit: number;
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
}
export type FlushFiveAction = { type: "deal" } | { type: "next" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
function deal5(rng: () => number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 5) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}
export function initialState(seed: number, _settings: FlushFiveSettings): FlushFiveState {
  return { rngSeed: seed, round: 1, hand: [], bestSuitCount: 0, bestSuit: 0, score: 0, phase: "dealing", lastPts: 0 };
}
export function reducer(state: FlushFiveState, action: FlushFiveAction): FlushFiveState {
  if (state.phase === "done") return state;
  if (action.type === "deal" && state.phase === "dealing") {
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const counts = [0, 0, 0, 0];
    hand.forEach(c => { counts[Math.floor(c / 13)]! += 1; });
    let bestSuit = 0; let bestCount = counts[0]!;
    for (let i = 1; i < 4; i++) if (counts[i]! > bestCount) { bestCount = counts[i]!; bestSuit = i; }
    let pts = 0;
    if (bestCount === 5) pts = 60;
    else if (bestCount === 4) pts = 30;
    else if (bestCount === 3) pts = 10;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, bestSuitCount: bestCount, bestSuit, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, round: state.round + 1, hand: [], bestSuitCount: 0, bestSuit: 0, phase: "dealing", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: FlushFiveState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
