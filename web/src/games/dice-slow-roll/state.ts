import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface DiceSlowRollSettings { rounds: "8" | "12"; }
export interface DiceSlowRollState {
  rng: number; dice: number[]; coins: number; bid: number; round: number; maxRounds: number;
  phase: "betting" | "revealed" | "gameover";
  lastResult: "win" | "lose" | "tie" | null; resultLabel: string;
}
export type DiceSlowRollAction = { type: "roll"; amount: number } | { type: "next" };

function rollDice(rng: () => number, count: number): number[] {
  return Array.from({length: count}, () => 1 + Math.floor(rng() * 6));
}

function checkWin(dice: number[]): { win: boolean; label: string } {
  const sum=dice.reduce((a,b)=>a+b,0);
  const win=sum<=8;
  return {win,label:win?`Sum ${sum} — Low wins!`:`Sum ${sum} — Need 8 or less`};
}

export function initialState(seed: number, settings: DiceSlowRollSettings): DiceSlowRollState {
  return {rng:seed,dice:[1,1,1],coins:100,bid:0,round:1,maxRounds:parseInt(settings.rounds,10),phase:"betting",lastResult:null,resultLabel:""};
}

export function reducer(state: DiceSlowRollState, action: DiceSlowRollAction): DiceSlowRollState {
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

export function isTerminal(state: DiceSlowRollState): { score: number } | null { return state.phase==="gameover"?{score:state.coins}:null; }
