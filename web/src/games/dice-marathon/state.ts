import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROLLS = 100;
export interface DiceMarathonSettings { dummy: boolean; }
export interface DiceMarathonState { rngSeed:number; rolls:number; counts:number[]; total:number; lastRoll:number|null; score:number; phase:"playing"|"done"; }
export type DiceMarathonAction = { type:"roll" } | { type:"rollAll" };
export function initialState(seed:number,_s:DiceMarathonSettings):DiceMarathonState {
  return { rngSeed:seed, rolls:0, counts:[0,0,0,0,0,0], total:0, lastRoll:null, score:0, phase:"playing" };
}
export function reducer(state:DiceMarathonState, action:DiceMarathonAction):DiceMarathonState {
  if (state.phase==="done") return state;
  if (action.type==="roll") {
    const rng=mulberry32(state.rngSeed);
    const d=1+Math.floor(rng()*6);
    const nextSeed=Math.floor(rng()*2**31);
    const counts=[...state.counts]; counts[d-1]=counts[d-1]!+1;
    const total=state.total+d;
    const rolls=state.rolls+1;
    const phase: "playing"|"done" = rolls>=TOTAL_ROLLS?"done":"playing";
    return { ...state, rngSeed:nextSeed, rolls, counts, total, lastRoll:d, score:total, phase };
  }
  if (action.type==="rollAll") {
    let s=state;
    while (s.rolls<TOTAL_ROLLS && s.phase==="playing") s=reducer(s,{type:"roll"});
    return s;
  }
  return state;
}
export function isTerminal(state:DiceMarathonState):{score:number}|null { return state.phase==="done"?{score:state.score}:null; }
