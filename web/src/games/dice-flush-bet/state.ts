import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface DiceFlushBetSettings { rounds: "8" | "12"; }
export interface DiceFlushBetState {
  rng: number; dice: number[]; coins: number; bid: number; round: number; maxRounds: number;
  phase: "betting" | "revealed" | "gameover";
  lastResult: "win" | "lose" | "tie" | null; resultLabel: string;
}
export type DiceFlushBetAction = { type: "roll"; amount: number } | { type: "next" };

function rollDice(rng: () => number, count: number): number[] {
  return Array.from({length: count}, () => 1 + Math.floor(rng() * 6));
}

function checkWin(dice: number[]): { win: boolean; label: string } {
  const sorted = [...dice].sort((a,b)=>a-b);
  const flush = sorted.every((v,i)=>i===0||v===sorted[i-1]!+1);
  return {win:flush, label:flush?"Flush! All consecutive!":"No flush"};
}

export function initialState(seed: number, settings: DiceFlushBetSettings): DiceFlushBetState {
  return {rng:seed,dice:[1,1,1],coins:100,bid:0,round:1,maxRounds:parseInt(settings.rounds,10),phase:"betting",lastResult:null,resultLabel:""};
}

export function reducer(state: DiceFlushBetState, action: DiceFlushBetAction): DiceFlushBetState {
  if(state.phase==="gameover")return state;
  if(action.type==="roll"&&state.phase==="betting"){
    const rng=mulberry32(state.rng+state.round);
    const dice=rollDice(rng,3);
    const amount=Math.max(1,Math.min(action.amount,state.coins));
    const {win,label}=checkWin(dice);
    const newCoins=Math.max(0,state.coins+(win?amount:-amount));
    const phase=(state.round>=state.maxRounds||newCoins<=0)?"gameover":"revealed";
    return{...state,dice,bid:amount,lastResult:win?"win":"lose",resultLabel:label,coins:newCoins,phase};
  }
  if(action.type==="next"&&state.phase==="revealed"){
    return{...state,round:state.round+1,phase:"betting",lastResult:null,resultLabel:""};
  }
  return state;
}

export function isTerminal(state: DiceFlushBetState): { score: number } | null { return state.phase==="gameover"?{score:state.coins}:null; }
