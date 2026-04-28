import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceMysticSettings { dummy: boolean; }
export interface DiceMysticState { rngSeed:number; round:number; choice:1|2|3|null; dice:[number,number]|null; score:number; phase:"choose"|"result"|"done"; lastPts:number; }
export type DiceMysticAction = { type:"choose"; mult:1|2|3 } | { type:"next" };
export function initialState(seed:number,_s:DiceMysticSettings):DiceMysticState { return { rngSeed:seed, round:1, choice:null, dice:null, score:0, phase:"choose", lastPts:0 }; }
export function reducer(state:DiceMysticState, action:DiceMysticAction):DiceMysticState {
  if(state.phase==="done")return state;
  if(action.type==="choose"){
    if(state.phase!=="choose")return state;
    const rng=mulberry32(state.rngSeed);
    const a=1+Math.floor(rng()*6); const b=1+Math.floor(rng()*6);
    const ns=Math.floor(rng()*2**31);
    const sum=a+b;
    let pts=0;
    if(action.mult===1) pts=sum;
    else if(action.mult===2) pts=sum%2===0?sum*2:0;
    else pts=a===b?sum*3:0;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, rngSeed:ns, choice:action.mult, dice:[a,b], score:state.score+pts, lastPts:pts, phase:last?"done":"result" };
  }
  if(action.type==="next"){ if(state.phase!=="result")return state; return { ...state, round:state.round+1, choice:null, dice:null, phase:"choose", lastPts:0 }; }
  return state;
}
export function isTerminal(state:DiceMysticState){ return state.phase==="done"?{score:state.score}:null; }
