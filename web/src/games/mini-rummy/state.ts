import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 6;
export interface MiniRummySettings { dummy: boolean; }
export interface MiniRummyState { rngSeed: number; round: number; hand: number[]; phase: "play" | "scored" | "done"; melds: number[][]; score: number; pts: number; }
export type MiniRummyAction = { type: "score" } | { type: "next" };
export function cardName(c:number):string { const r=["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
function deal7(rng:()=>number): number[] { const u=new Set<number>(); const out:number[]=[]; while(out.length<7){const c=Math.floor(rng()*52); if(!u.has(c)){u.add(c); out.push(c);}} return out; }
// Auto-detect best melds: sets (3+ same rank) and runs (3+ consecutive same suit). Greedy auto-meld.
function autoMeld(hand: number[]): { melds: number[][]; remaining: number[] } {
  const cards = [...hand];
  const melds: number[][] = [];
  // first try sets: group by rank
  const byRank: Record<number, number[]> = {};
  for (const c of cards) { const r = c % 13; (byRank[r] = byRank[r] || []).push(c); }
  for (const r of Object.keys(byRank)) {
    const arr = byRank[parseInt(r)]!;
    if (arr.length >= 3) { melds.push(arr); for (const c of arr) cards.splice(cards.indexOf(c), 1); }
  }
  // runs: by suit
  const bySuit: Record<number, number[]> = {};
  for (const c of cards) { const s = Math.floor(c / 13); (bySuit[s] = bySuit[s] || []).push(c); }
  for (const s of Object.keys(bySuit)) {
    const arr = bySuit[parseInt(s)]!.sort((a,b)=>(a%13)-(b%13));
    let run: number[] = [];
    for (const c of arr) {
      if (run.length === 0 || c % 13 === run[run.length-1]! % 13 + 1) run.push(c);
      else { if (run.length >= 3) { melds.push([...run]); for (const x of run) cards.splice(cards.indexOf(x), 1); } run = [c]; }
    }
    if (run.length >= 3) { melds.push([...run]); for (const x of run) cards.splice(cards.indexOf(x), 1); }
  }
  return { melds, remaining: cards };
}
export function initialState(seed: number, _s: MiniRummySettings): MiniRummyState {
  const rng = mulberry32(seed); const hand = deal7(rng); const next = Math.floor(rng()*2**31);
  return { rngSeed: next, round: 1, hand, phase: "play", melds: [], score: 0, pts: 0 };
}
export function reducer(state: MiniRummyState, action: MiniRummyAction): MiniRummyState {
  if (state.phase === "done") return state;
  if (action.type === "score") {
    if (state.phase !== "play") return state;
    const { melds, remaining } = autoMeld(state.hand);
    let pts = 0;
    for (const m of melds) pts += 20 + (m.length - 3) * 10; // 20 base + 10 per extra card
    pts -= remaining.length; // small penalty for unmelded cards
    if (pts < 0) pts = 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, melds, pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const hand = deal7(rng); const next = Math.floor(rng()*2**31);
    return { ...state, rngSeed: next, round: state.round+1, hand, melds: [], pts: 0, phase: "play" };
  }
  return state;
}
export function isTerminal(state: MiniRummyState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
