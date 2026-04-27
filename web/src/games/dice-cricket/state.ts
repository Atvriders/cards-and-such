import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceCricketSettings { dummy: boolean; }
export interface DiceCricketState { rngSeed:number; round:number; dice:number[]; closed:boolean[]; lastPts:number; score:number; phase:"rolling"|"scored"|"done"; }
export type DiceCricketAction = { type:"roll" } | { type:"next" };
export function initialState(seed:number,_s:DiceCricketSettings):DiceCricketState {
  return { rngSeed:seed, round:1, dice:[], closed:[false,false,false,false,false,false], lastPts:0, score:0, phase:"rolling" };
}
export function reducer(state:DiceCricketState, action:DiceCricketAction):DiceCricketState {
  if (state.phase==="done") return state;
  if (action.type==="roll") {
    if (state.phase!=="rolling") return state;
    const rng=mulberry32(state.rngSeed);
    const dice=[0,0,0].map(()=>1+Math.floor(rng()*6));
    const nextSeed=Math.floor(rng()*2**31);
    const closed=[...state.closed];
    let pts=0;
    for (const d of dice) {
      if (d===6) { pts += 30; closed[5]=true; continue; } // bullseye
      if (!closed[d-1]) { pts += 10; closed[d-1]=true; } // closes wicket
      else { pts += 5; } // re-hit bonus
    }
    return { ...state, rngSeed:nextSeed, dice, closed, lastPts:pts, score:state.score+pts, phase:"scored" };
  }
  if (action.type==="next") {
    if (state.phase!=="scored") return state;
    const isLast=state.round>=TOTAL_ROUNDS;
    if (isLast) return { ...state, phase:"done" };
    return { ...state, round:state.round+1, dice:[], lastPts:0, phase:"rolling" };
  }
  return state;
}
export function isTerminal(state:DiceCricketState):{score:number}|null { return state.phase==="done"?{score:state.score}:null; }
