import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface CardColorGuessSettings { rounds: "10"|"20" }
export interface CardColorGuessState {
  rngSeed: number; deck: number[]; pos: number;
  currentCard: number; score: number; round: number; maxRounds: number;
  phase: "guessing"|"reveal"|"gameover";
  lastResult: "correct"|"wrong"|null;
  streak: number;
}
export type CardColorGuessAction = { type:"guess"; color:"red"|"black" } | { type:"next" };
function isRed(c: number): boolean { const suit=Math.floor(c/13); return suit===1||suit===2; }
function cardName(c: number): string {
  const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits=["♠","♥","♦","♣"];
  return ranks[c%13]!+suits[Math.floor(c/13)]!;
}
export { isRed, cardName };
function makeDeck(seed: number): { deck: number[]; nextSeed: number } {
  const arr=Array.from({length:52},(_,i)=>i);
  const rng=mulberry32(seed);
  for(let i=51;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j]!,arr[i]!];}
  return { deck:arr, nextSeed:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: CardColorGuessSettings): CardColorGuessState {
  const { deck, nextSeed }=makeDeck(seed);
  return { rngSeed:nextSeed, deck, pos:0, currentCard:deck[0]!, score:0, round:1, maxRounds:parseInt(settings.rounds,10), phase:"guessing", lastResult:null, streak:0 };
}
export function reducer(state: CardColorGuessState, action: CardColorGuessAction): CardColorGuessState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "guess": {
      if(state.phase!=="guessing") return state;
      const red=isRed(state.currentCard);
      const correct=(action.color==="red"&&red)||(action.color==="black"&&!red);
      const newStreak=correct?state.streak+1:0;
      const points=correct?10+newStreak*2:0;
      return {...state,score:state.score+points,lastResult:correct?"correct":"wrong",streak:newStreak,phase:state.round>=state.maxRounds?"gameover":"reveal"};
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
export function isTerminal(state: CardColorGuessState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
