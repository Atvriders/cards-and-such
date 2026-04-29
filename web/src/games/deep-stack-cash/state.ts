import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const CARDS_PER_HAND = 7;
export interface DeepStackCashSettings { dummy: boolean; }
export interface DeepStackCashState { rngSeed: number; round: number; hand: number[]; rank: string; rankPts: number; score: number; phase: "deal" | "scored" | "done"; }
export type DeepStackCashAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["S","H","D","C"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
function dealHand(rng:()=>number, n:number): number[] { const u=new Set<number>(); const out:number[]=[]; while(out.length<n){const c=Math.floor(rng()*52); if(!u.has(c)){u.add(c); out.push(c);}} return out; }

function rateFiveCards(hand5: number[]): { rank: string; pts: number } {
  const ranks = hand5.map(c=>c%13);
  const suits = hand5.map(c=>Math.floor(c/13));
  const counts: Record<number,number> = {}; for(const r of ranks) counts[r]=(counts[r]||0)+1;
  const cv = Object.values(counts).sort((a,b)=>b-a);
  const flush = suits.every(s=>s===suits[0]);
  const sortedR = [...new Set(ranks)].sort((a,b)=>a-b);
  let straight = sortedR.length===5; if(straight) for(let i=1;i<5;i++) if(sortedR[i]!-sortedR[i-1]!!==1){straight=false;break;}
  if(!straight && sortedR.length===5 && sortedR[0]===0 && sortedR[1]===1 && sortedR[2]===2 && sortedR[3]===3 && sortedR[4]===12) straight=true;
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
function bestFiveOf(cards: number[]): { rank: string; pts: number } {
  if (cards.length <= 5) return rateFiveCards(cards.length === 5 ? cards : [...cards, ...Array(5-cards.length).fill(cards[0]||0)]);
  let best: { rank: string; pts: number } = { rank: "High Card", pts: 0 };
  const n = cards.length;
  for (let a=0;a<n-4;a++) for (let b=a+1;b<n-3;b++) for (let c=b+1;c<n-2;c++) for (let d=c+1;d<n-1;d++) for (let e=d+1;e<n;e++) {
    const r = rateFiveCards([cards[a]!,cards[b]!,cards[c]!,cards[d]!,cards[e]!]);
    if (r.pts > best.pts) best = r;
  }
  return best;
}

export function initialState(seed: number, _s: DeepStackCashSettings): DeepStackCashState { return { rngSeed: seed, round: 1, hand: [], rank: "", rankPts: 0, score: 0, phase: "deal" }; }
export function reducer(state: DeepStackCashState, action: DeepStackCashAction): DeepStackCashState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "deal") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = dealHand(rng, CARDS_PER_HAND);
    const next = Math.floor(rng()*2**31);
    const r = bestFiveOf(hand);
    const gain = r.pts;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, hand, rank: r.rank, rankPts: gain, score: state.score + gain, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") { if (state.phase !== "scored") return state; return { ...state, round: state.round+1, hand:[], rank:"", rankPts:0, phase:"deal" }; }
  return state;
}
export function isTerminal(state: DeepStackCashState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
