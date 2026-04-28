import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_CARDS = 16;
export interface CardJamSettings { dummy: boolean; }
export interface CardJamState { rngSeed:number; cards:number[]; idx:number; jars:number[][]; score:number; phase:"playing"|"done"; }
export type CardJamAction = { type:"jam"; jar:number };
export function cardName(c:number):string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function suitOf(c:number):number { return Math.floor(c/13); }
function deal(rng:()=>number,n:number):number[]{ const used=new Set<number>(); const out:number[]=[]; while(out.length<n){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function initialState(seed:number,_s:CardJamSettings):CardJamState { const rng=mulberry32(seed); const cards=deal(rng,TOTAL_CARDS); return { rngSeed:Math.floor(rng()*2**31), cards, idx:0, jars:[[],[],[],[]], score:0, phase:"playing" }; }
export function reducer(state:CardJamState, action:CardJamAction):CardJamState {
  if(state.phase==="done")return state;
  if(action.type==="jam"){
    const card=state.cards[state.idx]!;
    const correct=suitOf(card)===action.jar;
    const jars=state.jars.map((j,i)=>i===action.jar?[...j,card]:j);
    const idx=state.idx+1;
    const phase=idx>=TOTAL_CARDS?"done":"playing";
    return { ...state, jars, idx, score:state.score+(correct?12:0), phase };
  }
  return state;
}
export function isTerminal(state:CardJamState){ return state.phase==="done"?{score:state.score}:null; }
