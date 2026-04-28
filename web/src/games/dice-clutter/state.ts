import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface DiceClutterSettings { dummy: boolean; }
export interface DiceClutterState { rngSeed:number; round:number; dice:number[]; bestSum:number; score:number; phase:"rolling"|"scored"|"done"; lastPts:number; }
export type DiceClutterAction = { type:"roll" } | { type:"next" };
function rollN(rng:()=>number, n:number):number[] { const out:number[]=[]; for(let i=0;i<n;i++) out.push(1+Math.floor(rng()*6)); return out; }
export function initialState(seed:number,_s:DiceClutterSettings):DiceClutterState { return { rngSeed:seed, round:1, dice:[], bestSum:0, score:0, phase:"rolling", lastPts:0 }; }
export function reducer(state:DiceClutterState, action:DiceClutterAction):DiceClutterState {
  if(state.phase==="done")return state;
  if(action.type==="roll"){
    if(state.phase!=="rolling")return state;
    const rng=mulberry32(state.rngSeed);
    const dice=rollN(rng,8);
    const ns=Math.floor(rng()*2**31);
    const sorted=[...dice].sort((a,b)=>b-a);
    const best=sorted[0]!+sorted[1]!+sorted[2]!;
    const pts=best;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, rngSeed:ns, dice, bestSum:best, score:state.score+pts, lastPts:pts, phase:last?"done":"scored" };
  }
  if(action.type==="next"){ if(state.phase!=="scored")return state; return { ...state, round:state.round+1, dice:[], bestSum:0, phase:"rolling", lastPts:0 }; }
  return state;
}
export function isTerminal(state:DiceClutterState){ return state.phase==="done"?{score:state.score}:null; }
