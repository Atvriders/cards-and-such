import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Royal Rumble: 10 rounds. Pull 5 cards. +50 per face card (J,Q,K).
export const TOTAL_ROUNDS = 10;
export interface RoyalRumbleSettings { dummy: boolean; }
export interface RoyalRumbleState { rngSeed: number; round: number; hand: number[]; faceCount: number; score: number; phase: "dealing" | "scored" | "done"; lastPts: number; }
export type RoyalRumbleAction = { type: "deal" } | { type: "next" };
export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function isFace(c: number): boolean { const r=c%13; return r===9||r===10||r===11; }
function deal5(rng: () => number): number[] { const used=new Set<number>(); const out:number[]=[]; while(out.length<5){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function initialState(seed: number, _s: RoyalRumbleSettings): RoyalRumbleState {
  return { rngSeed: seed, round: 1, hand: [], faceCount: 0, score: 0, phase: "dealing", lastPts: 0 };
}
export function reducer(state: RoyalRumbleState, action: RoyalRumbleAction): RoyalRumbleState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const fc = hand.filter(isFace).length;
    const pts = fc * 50;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, faceCount: fc, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], faceCount: 0, phase: "dealing", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: RoyalRumbleState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
