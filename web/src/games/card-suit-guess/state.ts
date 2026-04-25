import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface CardSuitGuessSettings { rounds: "10"|"20" }
export interface CardSuitGuessState {
  rngSeed: number; deck: number[]; pos: number;
  currentCard: number; score: number; round: number; maxRounds: number;
  phase: "guessing"|"reveal"|"gameover";
  lastResult: "correct"|"wrong"|null;
}
export type CardSuitGuessAction = { type:"guess"; suit:0|1|2|3 } | { type:"next" };
const SUIT_NAMES=["♠ Spades","♥ Hearts","♦ Diamonds","♣ Clubs"];
function cardSuit(c: number): number { return Math.floor(c/13); }
function cardName(c: number): string {
  const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits=["♠","♥","♦","♣"];
  return ranks[c%13]!+suits[Math.floor(c/13)]!;
}
export { cardSuit, cardName, SUIT_NAMES };
function makeDeck(seed: number): { deck: number[]; nextSeed: number } {
  const arr=Array.from({length:52},(_,i)=>i);
  const rng=mulberry32(seed);
  for(let i=51;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j]!,arr[i]!];}
  return { deck:arr, nextSeed:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: CardSuitGuessSettings): CardSuitGuessState {
  const { deck, nextSeed }=makeDeck(seed);
  return { rngSeed:nextSeed, deck, pos:0, currentCard:deck[0]!, score:0, round:1, maxRounds:parseInt(settings.rounds,10), phase:"guessing", lastResult:null };
}
export function reducer(state: CardSuitGuessState, action: CardSuitGuessAction): CardSuitGuessState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "guess": {
      if(state.phase!=="guessing") return state;
      const correct=action.suit===cardSuit(state.currentCard);
      return {...state,score:state.score+(correct?250:0),lastResult:correct?"correct":"wrong",phase:state.round>=state.maxRounds?"gameover":"reveal"};
    }
    case "next": {
      if(state.phase!=="reveal") return state;
      const newPos=state.pos+1;
      if(newPos>=state.deck.length) return {...state,phase:"gameover"};
      return {...state,pos:newPos,currentCard:state.deck[newPos]!,round:state.round+1,phase:"guessing",lastResult:null};
    }
    default: return state;
  }
}
export function isTerminal(state: CardSuitGuessState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
