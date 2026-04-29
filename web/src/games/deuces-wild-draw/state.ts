import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface DeucesWildDrawSettings { dummy: boolean; }
export interface DeucesWildDrawState { rngSeed: number; round: number; hand: number[]; phase: "deal" | "scored" | "done"; score: number; pts: number; result: string; rank: string; }
export type DeucesWildDrawAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["♠","♥","♦","♣"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function rankOf(c: number): number { return c % 13; }
function suitOf(c: number): number { return Math.floor(c / 13); }
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } }
}
function classify(cards: number[]): { tier: number; name: string } {
  const ranks = cards.map(rankOf).sort((a, b) => a - b);
  const suits = cards.map(suitOf);
  const counts: Record<number, number> = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const cv = Object.values(counts).sort((a, b) => b - a);
  const flush = suits.every(s => s === suits[0]);
  let straight = ranks.every((r, i) => i === 0 || r === ranks[i - 1]! + 1);
  // wheel A-2-3-4-5
  if (!straight && ranks.join(",") === "0,1,2,3,12") straight = true;
  if (straight && flush && ranks[0] === 8) return { tier: 9, name: "Royal Flush" };
  if (straight && flush) return { tier: 8, name: "Straight Flush" };
  if (cv[0] === 4) return { tier: 7, name: "Four of a Kind" };
  if (cv[0] === 3 && cv[1] === 2) return { tier: 6, name: "Full House" };
  if (flush) return { tier: 5, name: "Flush" };
  if (straight) return { tier: 4, name: "Straight" };
  if (cv[0] === 3) return { tier: 3, name: "Three of a Kind" };
  if (cv[0] === 2 && cv[1] === 2) return { tier: 2, name: "Two Pair" };
  // pair of jacks-or-better varies; here generic pair
  if (cv[0] === 2) {
    const pairRank = parseInt(Object.keys(counts).find(k => counts[parseInt(k)] === 2)!);
    if (pairRank >= 10 || pairRank === 0) return { tier: 1, name: "High Pair" };
    return { tier: 0, name: "Low Pair" };
  }
  return { tier: -1, name: "No Pay" };
}

export function initialState(seed: number, _s: DeucesWildDrawSettings): DeucesWildDrawState {
  return { rngSeed: seed, round: 1, hand: [], phase: "deal", score: 0, pts: 0, result: "", rank: "" };
}
export function reducer(state: DeucesWildDrawState, action: DeucesWildDrawAction): DeucesWildDrawState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "deal") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>();
    const hand = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
    const cls = classify(hand);
    const payTable: Record<number, number> = { 9: 250, 8: 50, 7: 25, 6: 9, 5: 6, 4: 4, 3: 3, 2: 2, 1: 1, 0: 0, [-1]: 0 };
    const pts = payTable[cls.tier] ?? 0;
    const next = Math.floor(rng() * 2 ** 31);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, hand, pts, result: cls.name, rank: cls.name, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], pts: 0, result: "", rank: "", phase: "deal" };
  }
  return state;
}
export function isTerminal(state: DeucesWildDrawState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
