import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface CardDeckBetSettings { rounds: "8" | "12"; }
export interface CardDeckBetState { deck: number[]; pos: number; topCard: number; coins: number; round: number; maxRounds: number; phase: "betting" | "revealed" | "gameover"; lastResult: "win" | "lose" | "tie" | null; revealedCard: number | null; bid: number; }
export type CardDeckBetAction = { type: "bet"; amount: number; dir: "higher" | "lower" } | { type: "next" };
function makeDeck(rng: () => number): number[] { const arr=Array.from({length:52},(_,i)=>i); for(let i=51;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j]!,arr[i]!];}return arr; }
export function cardName(c: number): string { return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c%13]!+["♠","♥","♦","♣"][Math.floor(c/13)]!; }
export function initialState(seed: number, settings: CardDeckBetSettings): CardDeckBetState {
  const rng=mulberry32(seed); const deck=makeDeck(rng);
  return {deck,pos:1,topCard:deck[0]!,coins:75,bid:0,round:1,maxRounds:parseInt(settings.rounds,10),phase:"betting",lastResult:null,revealedCard:null};
}
export function reducer(state: CardDeckBetState, action: CardDeckBetAction): CardDeckBetState {
  if(state.phase==="gameover")return state;
  if(action.type==="bet"&&state.phase==="betting"){
    const amount=Math.max(1,Math.min(action.amount,state.coins));
    const nextCard=state.deck[state.pos%state.deck.length]!;
    const topRank=state.topCard%13;const nextRank=nextCard%13;
    let result:"win"|"lose"|"tie";
    if(nextRank===topRank)result="tie";
    else result=(action.dir==="higher")===(nextRank>topRank)?"win":"lose";
    const newCoins=Math.max(0,state.coins+(result==="win"?amount:result==="tie"?0:-amount));
    const phase=(state.round>=state.maxRounds||newCoins<=0)?"gameover":"revealed";
    return{...state,bid:amount,revealedCard:nextCard,lastResult:result,coins:newCoins,phase};
  }
  if(action.type==="next"&&state.phase==="revealed"){
    return{...state,topCard:state.revealedCard!,pos:state.pos+1,revealedCard:null,round:state.round+1,phase:"betting",lastResult:null};
  }
  return state;
}
export function isTerminal(state: CardDeckBetState): { score: number } | null { return state.phase==="gameover"?{score:state.coins}:null; }
