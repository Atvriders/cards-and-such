import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface AndarBaharCasSettings { dummy: boolean; }
export interface AndarBaharCasState { rngSeed: number; round: number; joker: number | null; bet: "andar" | "bahar" | null; chain: number; matchSide: "andar" | "bahar" | null; phase: "bet" | "scored" | "done"; score: number; pts: number; result: string; }
export type AndarBaharCasAction = { type: "bet"; side: "andar" | "bahar" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["♠","♥","♦","♣"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function rankOf(c: number): number { return c % 13; }
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } }
}

export function initialState(seed: number, _s: AndarBaharCasSettings): AndarBaharCasState {
  return { rngSeed: seed, round: 1, joker: null, bet: null, chain: 0, matchSide: null, phase: "bet", score: 0, pts: 0, result: "" };
}
export function reducer(state: AndarBaharCasState, action: AndarBaharCasAction): AndarBaharCasState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "bet") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>();
    const joker = drawCard(rng, used);
    const target = rankOf(joker);
    let chain = 0; let matchSide: "andar" | "bahar" = "andar";
    let side: "andar" | "bahar" = "andar";
    while (chain < 50) {
      const c = drawCard(rng, used); chain++;
      if (rankOf(c) === target) { matchSide = side; break; }
      side = side === "andar" ? "bahar" : "andar";
    }
    let pts = 0;
    if (action.side === matchSide) {
      if (chain <= 3) pts = 12;
      else if (chain <= 6) pts = 16;
      else pts = 20;
    }
    const result = `Match on ${matchSide} after ${chain} cards — +${pts}`;
    const next = Math.floor(rng() * 2 ** 31);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, joker, bet: action.side, chain, matchSide, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, joker: null, bet: null, chain: 0, matchSide: null, pts: 0, result: "", phase: "bet" };
  }
  return state;
}
export function isTerminal(state: AndarBaharCasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
