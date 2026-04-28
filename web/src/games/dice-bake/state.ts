import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 6;
export interface DiceBakeSettings { dummy: boolean; }
export interface DiceBakeState { rngSeed:number; round:number; dice:number[]; sum:number; prevSum:number; score:number; phase:"rolling"|"scored"|"done"; lastPts:number; }
export type DiceBakeAction = { type:"roll" } | { type:"next" };
function rollN(rng:()=>number, n:number):number[] { const out:number[]=[]; for(let i=0;i<n;i++) out.push(1+Math.floor(rng()*6)); return out; }
export function initialState(seed:number,_s:DiceBakeSettings):DiceBakeState { return { rngSeed:seed, round:1, dice:[], sum:0, prevSum:0, score:0, phase:"rolling", lastPts:0 }; }
export function reducer(state:DiceBakeState, action:DiceBakeAction):DiceBakeState {
  if(state.phase==="done")return state;
  if(action.type==="roll"){
    if(state.phase!=="rolling")return state;
    const rng=mulberry32(state.rngSeed);
    const dice=rollN(rng,3);
    const ns=Math.floor(rng()*2**31);
    const sum=dice.reduce((a,b)=>a+b,0);
    const pts=sum>state.prevSum?sum*2:0;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, rngSeed:ns, dice, sum, score:state.score+pts, lastPts:pts, phase:last?"done":"scored" };
  }
  if(action.type==="next"){ if(state.phase!=="scored")return state; return { ...state, round:state.round+1, dice:[], prevSum:state.sum, sum:0, phase:"rolling", lastPts:0 }; }
  return state;
}
export function isTerminal(state:DiceBakeState){ return state.phase==="done"?{score:state.score}:null; }
