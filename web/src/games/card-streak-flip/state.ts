import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface CardStreakFlipSettings { rounds: "8" | "12"; }
export interface CardStreakFlipState { deck: number[]; pos: number; topCard: number; coins: number; round: number; maxRounds: number; streak: number; phase: "betting" | "revealed" | "gameover"; lastResult: "win" | "lose" | "tie" | null; revealedCard: number | null; bid: number; }
export type CardStreakFlipAction = { type: "bet"; amount: number; dir: "higher" | "lower" } | { type: "next" };
function makeDeck(rng: () => number): number[] { const arr=Array.from({length:52},(_,i)=>i); for(let i=51;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j]!,arr[i]!];}return arr; }
export function cardName(c: number): string { return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c%13]!+["♠","♥","♦","♣"][Math.floor(c/13)]!; }
export function initialState(seed: number, settings: CardStreakFlipSettings): CardStreakFlipState {
  const rng=mulberry32(seed); const deck=makeDeck(rng);
  return {deck,pos:1,topCard:deck[0]!,coins:100,bid:0,round:1,maxRounds:parseInt(settings.rounds,10),streak:0,phase:"betting",lastResult:null,revealedCard:null};
}
export function reducer(state: CardStreakFlipState, action: CardStreakFlipAction): CardStreakFlipState {
  if(state.phase==="gameover")return state;
  if(action.type==="bet"&&state.phase==="betting"){
    const amount=Math.max(1,Math.min(action.amount,state.coins));
    const nextCard=state.deck[state.pos%state.deck.length]!;
    const topRank=state.topCard%13;const nextRank=nextCard%13;
    let result:"win"|"lose"|"tie";
    if(nextRank===topRank)result="tie";
    else result=(action.dir==="higher")===(nextRank>topRank)?"win":"lose";
    const newStreak=result==="win"?state.streak+1:0;
    const multiplier=Math.min(4,1+newStreak);
    const delta=result==="win"?amount*multiplier:result==="tie"?0:-amount;
    const newCoins=Math.max(0,state.coins+delta);
    const phase=(state.round>=state.maxRounds||newCoins<=0)?"gameover":"revealed";
    return{...state,bid:amount,revealedCard:nextCard,lastResult:result,coins:newCoins,streak:newStreak,phase};
  }
  if(action.type==="next"&&state.phase==="revealed"){
    return{...state,topCard:state.revealedCard!,pos:state.pos+1,revealedCard:null,round:state.round+1,phase:"betting",lastResult:null};
  }
  return state;
}
export function isTerminal(state: CardStreakFlipState): { score: number } | null { return state.phase==="gameover"?{score:state.coins}:null; }
