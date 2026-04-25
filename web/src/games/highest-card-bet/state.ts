import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HighestCardBetSettings { rounds: "10"|"20" }
export interface HighestCardBetState {
  rngSeed: number; deck: number[]; pos: number;
  currentCard: number; nextCard: number;
  bet: number; chips: number; round: number; maxRounds: number;
  phase: "betting"|"reveal"|"gameover";
  lastResult: "win"|"lose"|"tie"|null;
}
export type HighestCardBetAction = { type:"bet"; amount:number } | { type:"next" };

function cardValue(c: number): number { const rank=c%13; return rank===0?14:rank+1; }
function cardName(c: number): string {
  const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits=["♠","♥","♦","♣"];
  return ranks[c%13]!+suits[Math.floor(c/13)]!;
}
export { cardName, cardValue };

function makeDeck(seed: number): { deck: number[]; nextSeed: number } {
  const arr=Array.from({length:52},(_,i)=>i);
  const rng=mulberry32(seed);
  for(let i=51;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j]!,arr[i]!];}
  return { deck:arr, nextSeed:Math.floor(rng()*2**31) };
}

export function initialState(seed: number, settings: HighestCardBetSettings): HighestCardBetState {
  const { deck, nextSeed } = makeDeck(seed);
  return { rngSeed:nextSeed, deck, pos:0, currentCard:deck[0]!, nextCard:deck[1]!, bet:0, chips:100, round:1, maxRounds:parseInt(settings.rounds,10), phase:"betting", lastResult:null };
}

export function reducer(state: HighestCardBetState, action: HighestCardBetAction): HighestCardBetState {
  if(state.phase==="gameover") return state;
  switch(action.type) {
    case "bet": {
      if(state.phase!=="betting") return state;
      const bet=Math.min(action.amount, state.chips);
      const curVal=cardValue(state.currentCard);
      const nxtVal=cardValue(state.nextCard);
      let result: "win"|"lose"|"tie";
      if(nxtVal>curVal) result="win"; else if(nxtVal<curVal) result="lose"; else result="tie";
      const gain=result==="win"?bet:result==="tie"?0:-bet;
      const newChips=state.chips+gain;
      const isLast=state.round>=state.maxRounds;
      const newPhase: "reveal"|"gameover" = isLast ? "gameover" : "reveal";
      return { ...state, bet, chips:newChips, phase:newPhase, lastResult:result };
    }
    case "next": {
      if(state.phase!=="reveal") return state;
      const newPos=state.pos+1;
      const isLast=state.round>=state.maxRounds;
      if(isLast||newPos+1>=state.deck.length) return { ...state, phase:"gameover" };
      return { ...state, pos:newPos, currentCard:state.deck[newPos]!, nextCard:state.deck[newPos+1]!, round:state.round+1, phase:"betting", bet:0 };
    }
    default: return state;
  }
}

export function isTerminal(state: HighestCardBetState): { score:number }|null {
  return state.phase==="gameover" ? { score:state.chips } : null;
}
