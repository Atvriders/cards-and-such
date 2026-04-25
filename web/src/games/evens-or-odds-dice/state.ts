import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface EvensOrOddsDiceSettings { rounds: "10"|"20" }
export interface EvensOrOddsDiceState {
  rngSeed: number; dice: number[]; guess: "even"|"odd"|null;
  score: number; round: number; maxRounds: number;
  phase: "guessing"|"reveal"|"gameover";
  lastResult: "correct"|"wrong"|null; streak: number;
}
export type EvensOrOddsDiceAction = { type:"guess"; value:"even"|"odd" } | { type:"roll" };
function rollDice(seed: number): { dice: number[]; nextSeed: number } {
  const rng=mulberry32(seed);
  const dice=[Math.floor(rng()*6)+1, Math.floor(rng()*6)+1, Math.floor(rng()*6)+1];
  return { dice, nextSeed:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: EvensOrOddsDiceSettings): EvensOrOddsDiceState {
  return { rngSeed:seed, dice:[], guess:null, score:0, round:1, maxRounds:parseInt(settings.rounds,10), phase:"guessing", lastResult:null, streak:0 };
}
export function reducer(state: EvensOrOddsDiceState, action: EvensOrOddsDiceAction): EvensOrOddsDiceState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "guess": {
      if(state.phase!=="guessing") return state;
      const { dice, nextSeed }=rollDice(state.rngSeed);
      const total=dice.reduce((a,b)=>a+b,0);
      const isEven=total%2===0;
      const correct=(action.value==="even"&&isEven)||(action.value==="odd"&&!isEven);
      const newStreak=correct?state.streak+1:0;
      const points=correct?50+newStreak*10:0;
      const isLast=state.round>=state.maxRounds;
      return {...state,rngSeed:nextSeed,dice,guess:action.value,score:state.score+points,lastResult:correct?"correct":"wrong",streak:newStreak,phase:isLast?"gameover":"reveal"};
    }
    case "roll": {
      if(state.phase!=="reveal") return state;
      return {...state,dice:[],guess:null,round:state.round+1,phase:"guessing",lastResult:null};
    }
    default: return state;
  }
}
export function isTerminal(state: EvensOrOddsDiceState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
