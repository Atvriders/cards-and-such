import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Pip Pyramid: 6 rounds. Deal 5 cards in order. Score +50 if pip values are strictly ascending.
// Each subsequent valid jump (consecutive ascending pair) earns +20.
export const TOTAL_ROUNDS = 6;
export interface PipPyramidSettings { dummy: boolean; }
export interface PipPyramidState { rngSeed: number; round: number; hand: number[]; ascending: boolean; jumps: number; score: number; phase: "dealing" | "scored" | "done"; lastPts: number; }
export type PipPyramidAction = { type: "deal" } | { type: "next" };
export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function pipValue(c: number): number { const r=c%13; if(r<=8) return r+2; if(r===9) return 11; if(r===10) return 12; if(r===11) return 13; return 14; }
function deal5(rng: () => number): number[] { const used=new Set<number>(); const out:number[]=[]; while(out.length<5){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function initialState(seed: number, _s: PipPyramidSettings): PipPyramidState {
  return { rngSeed: seed, round: 1, hand: [], ascending: false, jumps: 0, score: 0, phase: "dealing", lastPts: 0 };
}
export function reducer(state: PipPyramidState, action: PipPyramidAction): PipPyramidState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let jumps = 0; let bonus = 0; let prev = pipValue(hand[0]!);
    for (let i = 1; i < hand.length; i++) {
      const v = pipValue(hand[i]!);
      if (v > prev) { jumps++; bonus += 20; }
      prev = v;
    }
    const ascending = jumps === 4;
    const pts = (ascending ? 50 : 0) + bonus;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, ascending, jumps, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], ascending: false, jumps: 0, phase: "dealing", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: PipPyramidState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
