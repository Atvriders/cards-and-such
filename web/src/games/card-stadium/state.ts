import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_CARDS = 12;
export interface CardStadiumSettings { dummy: boolean; }
export interface CardStadiumState { rngSeed: number; deck: number[]; drawn: number[]; score: number; phase: "drawing" | "done"; }
export type CardStadiumAction = { type: "draw" } | { type: "reset" };
export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
function shuffle(rng:()=>number):number[]{const a=Array.from({length:52},(_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a;}
export function scoreCard(c: number): number {
  return Math.floor(c/13)===1?10:0;
}
export function initialState(seed: number, _settings: CardStadiumSettings): CardStadiumState {
  const rng=mulberry32(seed); const deck=shuffle(rng);
  return { rngSeed: seed, deck, drawn: [], score: 0, phase: "drawing" };
}
export function reducer(state: CardStadiumState, action: CardStadiumAction): CardStadiumState {
  if (state.phase === "done" && action.type !== "reset") return state;
  if (action.type === "draw") {
    if (state.drawn.length >= TOTAL_CARDS) return state;
    const c=state.deck[state.drawn.length]!;
    const drawn=[...state.drawn, c];
    const score=state.score + scoreCard(c);
    const phase: "drawing"|"done" = drawn.length>=TOTAL_CARDS ? "done" : "drawing";
    return { ...state, drawn, score, phase };
  }
  if (action.type === "reset") {
    return initialState(state.rngSeed, { dummy:false });
  }
  return state;
}
export function isTerminal(state: CardStadiumState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
