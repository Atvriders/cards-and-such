import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Triad Tower: Each round, deal 3 cards. If all 3 share a suit, score +30. 8 rounds.
export const TOTAL_ROUNDS = 8;
export interface TriadTowerSettings { dummy: boolean; }
export interface TriadTowerState { rngSeed: number; round: number; hand: number[]; matched: boolean; score: number; phase: "dealing" | "scored" | "done"; lastPts: number; }
export type TriadTowerAction = { type: "deal" } | { type: "next" };
export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
function deal3(rng: () => number): number[] { const used=new Set<number>(); const out:number[]=[]; while(out.length<3){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function initialState(seed: number, _s: TriadTowerSettings): TriadTowerState {
  return { rngSeed: seed, round: 1, hand: [], matched: false, score: 0, phase: "dealing", lastPts: 0 };
}
export function reducer(state: TriadTowerState, action: TriadTowerAction): TriadTowerState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal3(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const suits = hand.map(c => Math.floor(c / 13));
    const matched = suits[0] === suits[1] && suits[1] === suits[2];
    const pts = matched ? 30 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, matched, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], matched: false, phase: "dealing", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: TriadTowerState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
