import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface MiniBlackjackSettings { dummy: boolean; }
export interface MiniBlackjackState { rngSeed: number; round: number; hand: number[]; total: number; phase: "play" | "scored" | "done"; score: number; pts: number; result: string; }
export type MiniBlackjackAction = { type: "hit" } | { type: "stand" } | { type: "next" };
export function cardName(c:number):string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function bjValue(c:number):number { const r=c%13; if(r<=8) return r+2; if(r<=11) return 10; return 11; }
function handTotal(hand: number[]): number {
  let total = 0; let aces = 0;
  for (const c of hand) { const v = bjValue(c); total += v; if (c%13 === 12) aces++; }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng()*52); if (!used.has(c)) { used.add(c); return c; } }
}
export function initialState(seed: number, _s: MiniBlackjackSettings): MiniBlackjackState {
  const rng = mulberry32(seed); const used = new Set<number>(); const hand = [drawCard(rng, used), drawCard(rng, used)];
  const next = Math.floor(rng()*2**31);
  return { rngSeed: next, round: 1, hand, total: handTotal(hand), phase: "play", score: 0, pts: 0, result: "" };
}
export function reducer(state: MiniBlackjackState, action: MiniBlackjackAction): MiniBlackjackState {
  if (state.phase === "done") return state;
  if (action.type === "hit") {
    if (state.phase !== "play") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>(state.hand);
    const c = drawCard(rng, used); const next = Math.floor(rng()*2**31);
    const hand = [...state.hand, c]; const total = handTotal(hand);
    if (total > 21) {
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: next, hand, total, pts: 0, result: "Bust!", phase: isLast ? "done" : "scored" };
    }
    return { ...state, rngSeed: next, hand, total };
  }
  if (action.type === "stand") {
    if (state.phase !== "play") return state;
    let pts = 0; let result = "";
    if (state.total === 21) { pts = 30; result = "Twenty-one!"; }
    else if (state.total >= 18) { pts = 20; result = `Good (${state.total})`; }
    else if (state.total >= 14) { pts = 10; result = `Modest (${state.total})`; }
    else { pts = 0; result = `Low (${state.total})`; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>(); const hand = [drawCard(rng, used), drawCard(rng, used)];
    const next = Math.floor(rng()*2**31);
    return { ...state, rngSeed: next, round: state.round+1, hand, total: handTotal(hand), phase: "play", pts: 0, result: "" };
  }
  return state;
}
export function isTerminal(state: MiniBlackjackState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
