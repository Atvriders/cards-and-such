import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface CardYankSettings { dummy: boolean; }
export interface CardYankState { rngSeed:number; round:number; hand:number[]; targetSuit:number; matches:number; score:number; phase:"dealing"|"scored"|"done"; lastPts:number; }
export type CardYankAction = { type:"yank" } | { type:"next" };
export function cardName(c:number):string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function suitOf(c:number):number { return Math.floor(c/13); }
function dealN(rng:()=>number, n:number):number[]{ const used=new Set<number>(); const out:number[]=[]; while(out.length<n){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function initialState(seed:number,_s:CardYankSettings):CardYankState { return { rngSeed:seed, round:1, hand:[], targetSuit:0, matches:0, score:0, phase:"dealing", lastPts:0 }; }
export function reducer(state:CardYankState, action:CardYankAction):CardYankState {
  if(state.phase==="done")return state;
  if(action.type==="yank"){
    if(state.phase!=="dealing")return state;
    const rng=mulberry32(state.rngSeed);
    const hand=dealN(rng,7);
    const targetSuit=Math.floor(rng()*4);
    const ns=Math.floor(rng()*2**31);
    const matches=hand.filter(c=>suitOf(c)===targetSuit).length;
    const pts=matches*10;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, rngSeed:ns, hand, targetSuit, matches, score:state.score+pts, lastPts:pts, phase:last?"done":"scored" };
  }
  if(action.type==="next"){ if(state.phase!=="scored")return state; return { ...state, round:state.round+1, hand:[], matches:0, phase:"dealing", lastPts:0 }; }
  return state;
}
export function isTerminal(state:CardYankState){ return state.phase==="done"?{score:state.score}:null; }
