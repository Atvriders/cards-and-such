import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface CardFanSettings { dummy: boolean; }
export interface CardFanState { rngSeed:number; round:number; hand:number[]; pick:number|null; score:number; phase:"choose"|"result"|"done"; lastWin:boolean; }
export type CardFanAction = { type:"pick"; index:number } | { type:"next" };
export function cardName(c:number):string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function rankOf(c:number):number { return c%13; }
function dealN(rng:()=>number, n:number):number[]{ const used=new Set<number>(); const out:number[]=[]; while(out.length<n){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function initialState(seed:number,_s:CardFanSettings):CardFanState { const rng=mulberry32(seed); const hand=dealN(rng,5); return { rngSeed:Math.floor(rng()*2**31), round:1, hand, pick:null, score:0, phase:"choose", lastWin:false }; }
export function reducer(state:CardFanState, action:CardFanAction):CardFanState {
  if(state.phase==="done")return state;
  if(action.type==="pick"){
    if(state.phase!=="choose")return state;
    let bestI=0; for(let i=1;i<state.hand.length;i++) if(rankOf(state.hand[i]!)>rankOf(state.hand[bestI]!)) bestI=i;
    const win=action.index===bestI;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, pick:action.index, score:state.score+(win?30:0), lastWin:win, phase:last?"done":"result" };
  }
  if(action.type==="next"){
    if(state.phase!=="result")return state;
    const rng=mulberry32(state.rngSeed); const hand=dealN(rng,5);
    return { ...state, rngSeed:Math.floor(rng()*2**31), round:state.round+1, hand, pick:null, phase:"choose", lastWin:false };
  }
  return state;
}
export function isTerminal(state:CardFanState){ return state.phase==="done"?{score:state.score}:null; }
