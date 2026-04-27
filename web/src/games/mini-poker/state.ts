import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface MiniPokerSettings { dummy: boolean; }
export interface MiniPokerState { rngSeed: number; round: number; hand: number[]; rank: string; rankPts: number; score: number; phase: "deal" | "scored" | "done"; }
export type MiniPokerAction = { type: "deal" } | { type: "next" };
export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
function deal5(rng:()=>number): number[] { const u=new Set<number>(); const out:number[]=[]; while(out.length<5){const c=Math.floor(rng()*52); if(!u.has(c)){u.add(c); out.push(c);}} return out; }
function rate(hand: number[]): { rank: string; pts: number } {
  const ranks = hand.map(c=>c%13).sort((a,b)=>a-b);
  const suits = hand.map(c=>Math.floor(c/13));
  const counts: Record<number,number> = {}; for(const r of ranks) counts[r]=(counts[r]||0)+1;
  const cv = Object.values(counts).sort((a,b)=>b-a);
  const flush = suits.every(s=>s===suits[0]);
  let straight = true; for(let i=1;i<5;i++) if(ranks[i]!==ranks[i-1]!+1) straight=false;
  // ace-low straight: 0,1,2,3,12 (A treated as 1) — special case
  if(!straight && ranks[0]===0 && ranks[1]===1 && ranks[2]===2 && ranks[3]===3 && ranks[4]===12) straight=true;
  if(straight && flush) return { rank: "Straight Flush", pts: 200 };
  if(cv[0]===4) return { rank: "Four of a Kind", pts: 150 };
  if(cv[0]===3 && cv[1]===2) return { rank: "Full House", pts: 100 };
  if(flush) return { rank: "Flush", pts: 80 };
  if(straight) return { rank: "Straight", pts: 70 };
  if(cv[0]===3) return { rank: "Three of a Kind", pts: 50 };
  if(cv[0]===2 && cv[1]===2) return { rank: "Two Pair", pts: 30 };
  if(cv[0]===2) return { rank: "Pair", pts: 10 };
  return { rank: "High Card", pts: 0 };
}
export function initialState(seed: number, _s: MiniPokerSettings): MiniPokerState { return { rngSeed: seed, round: 1, hand: [], rank: "", rankPts: 0, score: 0, phase: "deal" }; }
export function reducer(state: MiniPokerState, action: MiniPokerAction): MiniPokerState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "deal") return state;
    const rng = mulberry32(state.rngSeed); const hand = deal5(rng); const next = Math.floor(rng()*2**31);
    const r = rate(hand); const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, hand, rank: r.rank, rankPts: r.pts, score: state.score + r.pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") { if (state.phase !== "scored") return state; return { ...state, round: state.round+1, hand:[], rank:"", rankPts:0, phase:"deal" }; }
  return state;
}
export function isTerminal(state: MiniPokerState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
