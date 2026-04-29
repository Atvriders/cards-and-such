import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ToroidalChessQuizSettings { questions: "10"; }
export interface ToroidalChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ToroidalChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Toroidal chess wraps", choices: ["Both vertically and horizontally", "Only left-right", "Only top-bottom", "Diagonally only"], correct: 0 },
  { question: "A piece on rank 1 moving back goes to", choices: ["Rank 8", "Off the board", "Captures", "Promotes"], correct: 0 },
  { question: "Bishops gain", choices: ["Looping infinite diagonals", "Nothing", "Loss of moves", "Drop ability"], correct: 0 },
  { question: "The board's topology is", choices: ["A torus (donut shape)", "A sphere", "A cylinder", "A flat plane"], correct: 0 },
  { question: "Pawn promotion in Toroidal Chess is", choices: ["Tricky — there's no fixed last rank", "Standard", "Forbidden", "On rank 4"], correct: 0 },
  { question: "Compared to Cylinder Chess, Toroidal is", choices: ["More complex (wraps both ways)", "Simpler", "Identical", "Smaller"], correct: 0 },
  { question: "Pieces never go", choices: ["Off the board — they always wrap", "Backward", "Diagonal", "Capture"], correct: 0 },
  { question: "Castling on a torus is", choices: ["Often disabled or rule-modified", "Required", "Identical", "Always allowed"], correct: 0 },
  { question: "The variant tests", choices: ["Spatial visualization at extreme levels", "Memorization", "Pure pawn play", "Drops"], correct: 0 },
  { question: "Toroidal Chess is", choices: ["A theoretical fairy variant", "FIDE-sanctioned", "Olympic", "World championship"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ToroidalChessQuizSettings): ToroidalChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ToroidalChessQuizState, action: ToroidalChessQuizAction): ToroidalChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ToroidalChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
