import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 9;
export const CARDS_PER_HAND = 3;
export interface GutsPokerSettings { dummy: boolean; }
export interface GutsPokerState { rngSeed: number; round: number; hand: number[]; rank: string; rankPts: number; score: number; phase: "deal" | "scored" | "done"; }
export type GutsPokerAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["S","H","D","C"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
function dealHand(rng:()=>number, n:number): number[] { const u=new Set<number>(); const out:number[]=[]; while(out.length<n){const c=Math.floor(rng()*52); if(!u.has(c)){u.add(c); out.push(c);}} return out; }

function rateThreeCards(hand: number[]): { rank: string; pts: number } {
  const ranks = hand.map(c=>c%13).sort((a,b)=>a-b);
  const suits = hand.map(c=>Math.floor(c/13));
  const counts: Record<number,number> = {}; for(const r of ranks) counts[r]=(counts[r]||0)+1;
  const cv = Object.values(counts).sort((a,b)=>b-a);
  const flush = suits.every(s=>s===suits[0]);
  let straight = true; for(let i=1;i<3;i++) if(ranks[i]!==ranks[i-1]!+1) straight=false;
  if(straight && flush) return { rank: "Straight Flush", pts: 150 };
  if(cv[0]===3) return { rank: "Three of a Kind", pts: 100 };
  if(straight) return { rank: "Straight", pts: 50 };
  if(flush) return { rank: "Flush", pts: 40 };
  if(cv[0]===2) return { rank: "Pair", pts: 20 };
  return { rank: "High Card", pts: 0 };
}

export function initialState(seed: number, _s: GutsPokerSettings): GutsPokerState { return { rngSeed: seed, round: 1, hand: [], rank: "", rankPts: 0, score: 0, phase: "deal" }; }
export function reducer(state: GutsPokerState, action: GutsPokerAction): GutsPokerState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "deal") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = dealHand(rng, CARDS_PER_HAND);
    const next = Math.floor(rng()*2**31);
    const r = rateThreeCards(hand);
    const gain = r.pts;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, hand, rank: r.rank, rankPts: gain, score: state.score + gain, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") { if (state.phase !== "scored") return state; return { ...state, round: state.round+1, hand:[], rank:"", rankPts:0, phase:"deal" }; }
  return state;
}
export function isTerminal(state: GutsPokerState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
