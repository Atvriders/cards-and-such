import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Total7OrNotSettings { rounds: "10"|"20" }
export interface Total7OrNotState {
  rngSeed: number; dice: number[]; score: number; round: number; maxRounds: number;
  phase: "guessing"|"reveal"|"gameover";
  lastResult: "seven"|"not"|null;
}
export type Total7OrNotAction = { type:"guess"; value:"seven"|"not" } | { type:"next" };
function rollTwo(seed: number): { dice: number[]; nextSeed: number } {
  const rng=mulberry32(seed);
  const dice=[Math.floor(rng()*6)+1, Math.floor(rng()*6)+1];
  return { dice, nextSeed:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: Total7OrNotSettings): Total7OrNotState {
  return { rngSeed:seed, dice:[], score:0, round:1, maxRounds:parseInt(settings.rounds,10), phase:"guessing", lastResult:null };
}
export function reducer(state: Total7OrNotState, action: Total7OrNotAction): Total7OrNotState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "guess": {
      if(state.phase!=="guessing") return state;
      const { dice, nextSeed }=rollTwo(state.rngSeed);
      const total=dice[0]!+dice[1]!;
      const isSeven=total===7;
      const correct=(action.value==="seven"&&isSeven)||(action.value==="not"&&!isSeven);
      // 7 is most likely single total (1/6), so guessing "seven" wins 100 pts, "not" wins 30
      const pts=correct?(action.value==="seven"?200:50):0;
      const isLast=state.round>=state.maxRounds;
      return {...state,rngSeed:nextSeed,dice,score:state.score+pts,lastResult:isSeven?"seven":"not",phase:isLast?"gameover":"reveal"};
    }
    case "next": {
      if(state.phase!=="reveal") return state;
      return {...state,dice:[],round:state.round+1,phase:"guessing",lastResult:null};
    }
    default: return state;
  }
}
export function isTerminal(state: Total7OrNotState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
