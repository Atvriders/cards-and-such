import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RandomChessSettings { questions: "10"; }
export interface RandomChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RandomChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Random Chess randomizes which ranks?", choices: ["Both back rank and pawn ranks", "Only back rank", "Only pawn rank", "Neither"], correct: 0 },
  { question: "Compared to Chess960, Random Chess is", choices: ["Less constrained — no legal-arrangement guarantee", "More restricted", "Identical", "Smaller board"], correct: 0 },
  { question: "Both sides see", choices: ["Mirrored or independently random arrangements depending on subvariant", "Always classical setup", "Same fairy pieces", "Empty board"], correct: 0 },
  { question: "Castling typically", choices: ["Disabled or heavily modified", "Always enabled", "Required first move", "Captures opponent king"], correct: 0 },
  { question: "Game length tends to be", choices: ["Shorter due to volatile positions", "Always longer", "Always 60+ moves", "Two moves"], correct: 0 },
  { question: "Opening theory in Random Chess is", choices: ["Largely useless", "Identical to FIDE", "Memorized by all", "Officially codified"], correct: 0 },
  { question: "Pawn promotion rule", choices: ["Standard — promote on the 8th rank", "Cannot promote", "Promote on the 4th rank", "Promote to king"], correct: 0 },
  { question: "Best preparation strategy", choices: ["Improve calculation and tactical pattern recognition", "Memorize 30 moves of theory", "Skip openings", "Play only blitz"], correct: 0 },
  { question: "Tournament use is", choices: ["Rare; mostly casual", "Standard FIDE format", "Used in world championships", "Banned"], correct: 0 },
  { question: "Random Chess increases the role of", choices: ["Tactics and creativity", "Memorized opening lines", "Fairy pieces", "Diceboards"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RandomChessSettings): RandomChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RandomChessState, action: RandomChessAction): RandomChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RandomChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
