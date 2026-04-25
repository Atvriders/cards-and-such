import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Color Recall: flash a sequence of colors, recall them in order
export interface ColorRecallSettings { rounds: "5"|"10" }
const COLORS=["red","blue","green","yellow","purple","orange"] as const;
type Color = typeof COLORS[number];
export interface ColorRecallState {
  rngSeed: number; sequence: Color[]; userInput: Color[];
  showingIndex: number; phase: "showing"|"input"|"result"|"gameover";
  score: number; round: number; maxRounds: number; correct: boolean;
}
export type ColorRecallAction = { type:"advance" } | { type:"pick"; color:Color } | { type:"nextRound" };
function genSequence(seed: number, length: number): { seq: Color[]; ns: number } {
  const rng=mulberry32(seed);
  const seq=Array.from({length},()=>COLORS[Math.floor(rng()*COLORS.length)]!) as Color[];
  return { seq, ns:Math.floor(rng()*2**31) };
}
export { COLORS };
export function initialState(seed: number, settings: ColorRecallSettings): ColorRecallState {
  const maxRounds=parseInt(settings.rounds,10);
  const { seq, ns }=genSequence(seed,2);
  return { rngSeed:ns, sequence:seq, userInput:[], showingIndex:0, phase:"showing", score:0, round:1, maxRounds, correct:false };
}
export function reducer(state: ColorRecallState, action: ColorRecallAction): ColorRecallState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "advance": {
      if(state.phase!=="showing") return state;
      const next=state.showingIndex+1;
      if(next>=state.sequence.length) return {...state,showingIndex:next,phase:"input"};
      return {...state,showingIndex:next};
    }
    case "pick": {
      if(state.phase!=="input") return state;
      const userInput=[...state.userInput,action.color];
      const correct=state.sequence.slice(0,userInput.length).every((c,i)=>c===userInput[i]);
      if(!correct) return {...state,userInput,correct:false,phase:"result"};
      if(userInput.length>=state.sequence.length) return {...state,userInput,correct:true,phase:"result"};
      return {...state,userInput};
    }
    case "nextRound": {
      if(state.phase!=="result") return state;
      const pts=state.correct?state.sequence.length*50:0;
      const nextRound=state.round+1;
      if(nextRound>state.maxRounds) return {...state,score:state.score+pts,phase:"gameover"};
      const nextLen=state.correct?state.sequence.length+1:Math.max(2,state.sequence.length-1);
      const { seq, ns }=genSequence(state.rngSeed,nextLen);
      return {...state,rngSeed:ns,sequence:seq,userInput:[],showingIndex:0,phase:"showing",score:state.score+pts,round:nextRound,correct:false};
    }
    default: return state;
  }
}
export function isTerminal(state: ColorRecallState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
