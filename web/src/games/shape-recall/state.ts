import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Shape Recall: flash shapes in sequence, recall them
export interface ShapeRecallSettings { rounds: "5"|"10" }
const SHAPES=["circle","square","triangle","star","diamond","cross"] as const;
type Shape = typeof SHAPES[number];
export interface ShapeRecallState {
  rngSeed: number; sequence: Shape[]; userInput: Shape[];
  showingIndex: number; phase: "showing"|"input"|"result"|"gameover";
  score: number; round: number; maxRounds: number; correct: boolean;
}
export type ShapeRecallAction = { type:"advance" } | { type:"pick"; shape:Shape } | { type:"nextRound" };
export { SHAPES };
function genSeq(seed: number, length: number): { seq: Shape[]; ns: number } {
  const rng=mulberry32(seed);
  const seq=Array.from({length},()=>SHAPES[Math.floor(rng()*SHAPES.length)]!) as Shape[];
  return { seq, ns:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: ShapeRecallSettings): ShapeRecallState {
  const maxRounds=parseInt(settings.rounds,10);
  const { seq, ns }=genSeq(seed,2);
  return { rngSeed:ns, sequence:seq, userInput:[], showingIndex:0, phase:"showing", score:0, round:1, maxRounds, correct:false };
}
export function reducer(state: ShapeRecallState, action: ShapeRecallAction): ShapeRecallState {
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
      const userInput=[...state.userInput,action.shape];
      const correct=state.sequence.slice(0,userInput.length).every((s,i)=>s===userInput[i]);
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
      const { seq, ns }=genSeq(state.rngSeed,nextLen);
      return {...state,rngSeed:ns,sequence:seq,userInput:[],showingIndex:0,phase:"showing",score:state.score+pts,round:nextRound,correct:false};
    }
    default: return state;
  }
}
export function isTerminal(state: ShapeRecallState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
