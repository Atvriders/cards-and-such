import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceBlockadeSettings { dummy: boolean; }
export interface DiceBlockadeState { rngSeed:number; round:number; you:number; opp:number; score:number; phase:"rolling"|"scored"|"done"; lastPts:number; }
export type DiceBlockadeAction = { type:"roll" } | { type:"next" };
export function initialState(seed:number,_s:DiceBlockadeSettings):DiceBlockadeState { return { rngSeed:seed, round:1, you:0, opp:0, score:0, phase:"rolling", lastPts:0 }; }
export function reducer(state:DiceBlockadeState, action:DiceBlockadeAction):DiceBlockadeState {
  if(state.phase==="done")return state;
  if(action.type==="roll"){
    if(state.phase!=="rolling")return state;
    const rng=mulberry32(state.rngSeed);
    const you=1+Math.floor(rng()*6);
    const opp=1+Math.floor(rng()*6);
    const ns=Math.floor(rng()*2**31);
    const pts=you>opp?15:you===opp?5:0;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, rngSeed:ns, you, opp, score:state.score+pts, lastPts:pts, phase:last?"done":"scored" };
  }
  if(action.type==="next"){ if(state.phase!=="scored")return state; return { ...state, round:state.round+1, you:0, opp:0, phase:"rolling", lastPts:0 }; }
  return state;
}
export function isTerminal(state:DiceBlockadeState){ return state.phase==="done"?{score:state.score}:null; }
