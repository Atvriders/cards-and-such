import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface DiceTrailSettings { dummy: boolean; }
export interface DiceTrailState { rngSeed:number; round:number; dice:number[]; ascCount:number; score:number; phase:"rolling"|"scored"|"done"; lastPts:number; }
export type DiceTrailAction = { type:"roll" } | { type:"next" };
function rollN(rng:()=>number, n:number):number[] { const out:number[]=[]; for(let i=0;i<n;i++) out.push(1+Math.floor(rng()*6)); return out; }
export function initialState(seed:number,_s:DiceTrailSettings):DiceTrailState { return { rngSeed:seed, round:1, dice:[], ascCount:0, score:0, phase:"rolling", lastPts:0 }; }
export function reducer(state:DiceTrailState, action:DiceTrailAction):DiceTrailState {
  if(state.phase==="done")return state;
  if(action.type==="roll"){
    if(state.phase!=="rolling")return state;
    const rng=mulberry32(state.rngSeed);
    const dice=rollN(rng,5);
    const ns=Math.floor(rng()*2**31);
    let asc=0; for(let i=1;i<dice.length;i++) if(dice[i]!>dice[i-1]!) asc++;
    const pts=asc*10;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, rngSeed:ns, dice, ascCount:asc, score:state.score+pts, lastPts:pts, phase:last?"done":"scored" };
  }
  if(action.type==="next"){ if(state.phase!=="scored")return state; return { ...state, round:state.round+1, dice:[], ascCount:0, phase:"rolling", lastPts:0 }; }
  return state;
}
export function isTerminal(state:DiceTrailState){ return state.phase==="done"?{score:state.score}:null; }
