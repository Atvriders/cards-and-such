import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Basket Toss: click to set power/angle, toss ball into basket
export interface BasketTossSettings { balls: "5"|"10" }
export interface BasketTossState {
  rngSeed: number; basketX: number; ballsLeft: number; score: number;
  streak: number; throws: number; madeIt: number;
  phase: "aiming"|"result"|"gameover";
  lastResult: "made"|"miss"|null;
}
export type BasketTossAction = { type:"toss"; x:number } | { type:"next" };
export function initialState(seed: number, settings: BasketTossSettings): BasketTossState {
  const rng=mulberry32(seed);
  return { rngSeed:Math.floor(rng()*2**31), basketX:0.3+rng()*0.4, ballsLeft:parseInt(settings.balls,10), score:0, streak:0, throws:0, madeIt:0, phase:"aiming", lastResult:null };
}
export function reducer(state: BasketTossState, action: BasketTossAction): BasketTossState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "toss": {
      if(state.phase!=="aiming") return state;
      const dist=Math.abs(action.x-state.basketX);
      const made=dist<0.08;
      const newStreak=made?state.streak+1:0;
      const pts=made?100+newStreak*20:0;
      const rng=mulberry32(state.rngSeed);
      const newBasketX=0.2+rng()*0.6;
      const ns=Math.floor(rng()*2**31);
      const ballsLeft=state.ballsLeft-1;
      return {...state,rngSeed:ns,basketX:newBasketX,score:state.score+pts,streak:newStreak,madeIt:state.madeIt+(made?1:0),throws:state.throws+1,ballsLeft,lastResult:made?"made":"miss",phase:ballsLeft<=0?"gameover":"result"};
    }
    case "next": {
      if(state.phase!=="result") return state;
      return {...state,phase:"aiming"};
    }
    default: return state;
  }
}
export function isTerminal(state: BasketTossState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
