import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface CardTargetSumSettings { dummy: boolean; }
export interface CardTargetSumState { rngSeed: number; round: number; target: number; pool: number[]; selected: number[]; score: number; phase: "play" | "scored" | "done"; sum: number; pts: number; }
export type CardTargetSumAction = { type: "toggle"; idx: number } | { type: "submit" } | { type: "next" };
export function cardName(c:number):string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function pipValue(c:number):number { const r=c%13; if(r<=8) return r+2; if(r===9) return 11; if(r===10) return 12; if(r===11) return 13; return 1; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
function deal(rng:()=>number, n:number): number[] { const u=new Set<number>(); const out:number[]=[]; while(out.length<n){const c=Math.floor(rng()*52); if(!u.has(c)){u.add(c); out.push(c);}} return out; }
export function initialState(seed: number, _s: CardTargetSumSettings): CardTargetSumState {
  const rng = mulberry32(seed); const pool = deal(rng, 6); const target = 12 + Math.floor(rng()*15); const next = Math.floor(rng()*2**31);
  return { rngSeed: next, round: 1, target, pool, selected: [], score: 0, phase: "play", sum: 0, pts: 0 };
}
export function reducer(state: CardTargetSumState, action: CardTargetSumAction): CardTargetSumState {
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    if (state.phase !== "play") return state;
    if (state.selected.includes(action.idx)) return { ...state, selected: state.selected.filter(i=>i!==action.idx) };
    if (state.selected.length >= 3) return state;
    return { ...state, selected: [...state.selected, action.idx] };
  }
  if (action.type === "submit") {
    if (state.phase !== "play" || state.selected.length !== 3) return state;
    const sum = state.selected.reduce((a,i) => a + pipValue(state.pool[i]!), 0);
    const diff = Math.abs(sum - state.target);
    const pts = Math.max(0, 30 - diff * 5);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, sum, pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const pool = deal(rng, 6); const target = 12 + Math.floor(rng()*15); const next = Math.floor(rng()*2**31);
    return { ...state, rngSeed: next, round: state.round+1, target, pool, selected: [], phase: "play", sum: 0, pts: 0 };
  }
  return state;
}
export function isTerminal(state: CardTargetSumState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
