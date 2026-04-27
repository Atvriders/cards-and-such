import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface CardCollectFlushSettings { dummy: boolean; }
export interface CardCollectFlushState { rngSeed: number; round: number; hand: number[]; score: number; phase: "playing" | "scored" | "done"; lastPts: number; }
export type CardCollectFlushAction = { type: "deal" } | { type: "next" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function suitOf(c: number): number { return Math.floor(c/13); }
export function bestSuitCount(hand: number[]): number { const counts=[0,0,0,0]; for(const c of hand) counts[suitOf(c)]!++; return Math.max(...counts); }
function deal5(rng: () => number): number[] { const used=new Set<number>(); const out: number[]=[]; while(out.length<5){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function initialState(seed: number, _s: CardCollectFlushSettings): CardCollectFlushState {
  return { rngSeed: seed, round: 1, hand: [], score: 0, phase: "playing", lastPts: 0 };
}
export function reducer(state: CardCollectFlushState, action: CardCollectFlushAction): CardCollectFlushState {
  if (state.phase === "done") return state;
  if (action.type === "deal" && state.phase === "playing") {
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng()*2**31);
    const top = bestSuitCount(hand);
    const pts = top === 5 ? 100 : top === 4 ? 50 : top === 3 ? 20 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, round: state.round + 1, hand: [], phase: "playing", lastPts: 0 };
  }
  return state;
}
export function isTerminal(s: CardCollectFlushState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
