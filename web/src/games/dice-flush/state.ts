import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Dice Flush: roll 5 dice, score based on how many show the same face (like a flush)
export interface DiceFlushSettings { rounds: "5"|"10" }
export interface DiceFlushState {
  rngSeed: number; dice: number[]; kept: boolean[];
  rerolls: number; maxRerolls: number;
  score: number; totalScore: number; round: number; maxRounds: number;
  phase: "rolling"|"result"|"gameover";
}
export type DiceFlushAction = { type:"roll" } | { type:"keep"; index:number } | { type:"score" } | { type:"next" };
function roll5(seed: number): { dice: number[]; nextSeed: number } {
  const rng=mulberry32(seed);
  const dice=Array.from({length:5},()=>Math.floor(rng()*6)+1);
  return { dice, nextSeed:Math.floor(rng()*2**31) };
}
function rerollKept(dice: number[], kept: boolean[], seed: number): { dice: number[]; nextSeed: number } {
  const rng=mulberry32(seed);
  const newDice=dice.map((d,i)=>kept[i]?d:Math.floor(rng()*6)+1);
  return { dice:newDice, nextSeed:Math.floor(rng()*2**31) };
}
function calcScore(dice: number[]): number {
  const counts=new Map<number,number>();
  for(const d of dice) counts.set(d,(counts.get(d)??0)+1);
  const max=Math.max(...counts.values());
  if(max===5) return 500;
  if(max===4) return 200;
  if(max===3) return 80;
  if(max===2){
    const pairs=[...counts.values()].filter(v=>v>=2).length;
    return pairs>=2?30:10;
  }
  return 0;
}
export { calcScore };
export function initialState(seed: number, settings: DiceFlushSettings): DiceFlushState {
  const { dice, nextSeed }=roll5(seed);
  return { rngSeed:nextSeed, dice, kept:Array(5).fill(false), rerolls:0, maxRerolls:2, score:0, totalScore:0, round:1, maxRounds:parseInt(settings.rounds,10), phase:"rolling" };
}
export function reducer(state: DiceFlushState, action: DiceFlushAction): DiceFlushState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "keep": {
      if(state.phase!=="rolling") return state;
      const kept=[...state.kept];kept[action.index]=!kept[action.index];
      return {...state,kept};
    }
    case "roll": {
      if(state.phase!=="rolling"||state.rerolls>=state.maxRerolls) return state;
      const { dice, nextSeed }=rerollKept(state.dice,state.kept,state.rngSeed);
      const newRerolls=state.rerolls+1;
      if(newRerolls>=state.maxRerolls){
        const score=calcScore(dice);
        return {...state,rngSeed:nextSeed,dice,rerolls:newRerolls,score,phase:"result"};
      }
      return {...state,rngSeed:nextSeed,dice,rerolls:newRerolls};
    }
    case "score": {
      if(state.phase!=="rolling") return state;
      const score=calcScore(state.dice);
      return {...state,score,phase:"result"};
    }
    case "next": {
      if(state.phase!=="result") return state;
      const newTotal=state.totalScore+state.score;
      const isLast=state.round>=state.maxRounds;
      if(isLast) return {...state,totalScore:newTotal,phase:"gameover"};
      const { dice, nextSeed }=roll5(state.rngSeed);
      return {...state,rngSeed:nextSeed,dice,kept:Array(5).fill(false),rerolls:0,score:0,totalScore:newTotal,round:state.round+1,phase:"rolling"};
    }
    default: return state;
  }
}
export function isTerminal(state: DiceFlushState): { score:number }|null { return state.phase==="gameover"?{score:state.totalScore}:null; }
