import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ProgressiveChessQuizSettings { questions: "10"; }
export interface ProgressiveChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ProgressiveChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Progressive Chess increases moves by", choices: ["One per turn (1, 2, 3, ...)", "Two per turn", "Random", "No progression"], correct: 0 },
  { question: "After turn 5, white plays", choices: ["5 moves in that turn", "One move", "Skips", "Two moves"], correct: 0 },
  { question: "Italian Progressive ignores", choices: ["Intermediate checks (only final position counts)", "All checks", "No special rule", "Captures"], correct: 0 },
  { question: "Scottish Progressive requires", choices: ["Each check to be escaped immediately", "Skipping turns", "Only one check", "Rolling dice"], correct: 0 },
  { question: "A player must escape check", choices: ["At the end of their move sequence", "Mid-sequence", "Never", "Only on first move"], correct: 0 },
  { question: "Castling counts as", choices: ["One move in the sequence", "Two moves", "Free", "Forbidden"], correct: 0 },
  { question: "The variant rewards", choices: ["Long forcing tactical sequences", "Pure positional play", "Pawn pushes", "Drops"], correct: 0 },
  { question: "Progressive Chess is studied at", choices: ["Italian and Scottish chess clubs", "Olympic Games", "World Championship", "FIDE schools"], correct: 0 },
  { question: "Most progressive sequences end with", choices: ["A piece capture or check", "Pawn move", "Promotion", "Drop"], correct: 0 },
  { question: "The maximum number of moves grows", choices: ["Unboundedly until checkmate", "Up to 10", "Once", "Stops at 5"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ProgressiveChessQuizSettings): ProgressiveChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ProgressiveChessQuizState, action: ProgressiveChessQuizAction): ProgressiveChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ProgressiveChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
