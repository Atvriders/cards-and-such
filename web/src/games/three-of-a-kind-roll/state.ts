import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Three of a Kind Roll: roll 3 dice up to 3 times to get three matching faces
export interface ThreeOfAKindRollSettings { rounds: "5"|"10" }
export interface ThreeOfAKindRollState {
  rngSeed: number; dice: number[]; kept: boolean[];
  attempts: number; maxAttempts: number;
  score: number; totalScore: number; round: number; maxRounds: number;
  phase: "rolling"|"result"|"gameover";
  gotThree: boolean;
}
export type ThreeOfAKindRollAction = { type:"roll" } | { type:"keep"; index:number } | { type:"bank" } | { type:"next" };
function roll3(seed: number): { dice: number[]; nextSeed: number } {
  const rng=mulberry32(seed);
  const dice=[Math.floor(rng()*6)+1,Math.floor(rng()*6)+1,Math.floor(rng()*6)+1];
  return { dice, nextSeed:Math.floor(rng()*2**31) };
}
function isThreeOfAKind(dice: number[]): boolean {
  return dice[0]===dice[1]&&dice[1]===dice[2];
}
export { isThreeOfAKind };
export function initialState(seed: number, settings: ThreeOfAKindRollSettings): ThreeOfAKindRollState {
  const { dice, nextSeed }=roll3(seed);
  return { rngSeed:nextSeed, dice, kept:Array(3).fill(false), attempts:1, maxAttempts:3, score:0, totalScore:0, round:1, maxRounds:parseInt(settings.rounds,10), phase:"rolling", gotThree:false };
}
export function reducer(state: ThreeOfAKindRollState, action: ThreeOfAKindRollAction): ThreeOfAKindRollState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "keep": {
      if(state.phase!=="rolling") return state;
      const kept=[...state.kept];kept[action.index]=!kept[action.index];
      return {...state,kept};
    }
    case "roll": {
      if(state.phase!=="rolling"||state.attempts>=state.maxAttempts) return state;
      const rng=mulberry32(state.rngSeed);
      const newDice=state.dice.map((d,i)=>state.kept[i]?d:Math.floor(rng()*6)+1);
      const nextSeed=Math.floor(rng()*2**31);
      const gotThree=isThreeOfAKind(newDice);
      const newAttempts=state.attempts+1;
      if(gotThree||newAttempts>=state.maxAttempts){
        const attemptsUsed=newAttempts;
        const pts=gotThree?(attemptsUsed===1?500:attemptsUsed===2?300:100):0;
        return {...state,rngSeed:nextSeed,dice:newDice,attempts:newAttempts,gotThree,score:pts,phase:"result"};
      }
      return {...state,rngSeed:nextSeed,dice:newDice,attempts:newAttempts,gotThree};
    }
    case "bank": {
      if(state.phase!=="rolling") return state;
      const gotThree=isThreeOfAKind(state.dice);
      const pts=gotThree?(state.attempts===1?500:state.attempts===2?300:100):0;
      return {...state,gotThree,score:pts,phase:"result"};
    }
    case "next": {
      if(state.phase!=="result") return state;
      const newTotal=state.totalScore+state.score;
      if(state.round>=state.maxRounds) return {...state,totalScore:newTotal,phase:"gameover"};
      const { dice, nextSeed }=roll3(state.rngSeed);
      return {...state,rngSeed:nextSeed,dice,kept:Array(3).fill(false),attempts:1,score:0,totalScore:newTotal,round:state.round+1,phase:"rolling",gotThree:false};
    }
    default: return state;
  }
}
export function isTerminal(state: ThreeOfAKindRollState): { score:number }|null { return state.phase==="gameover"?{score:state.totalScore}:null; }
