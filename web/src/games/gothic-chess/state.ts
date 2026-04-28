import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GothicChessSettings { questions: "10"; }
export interface GothicChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GothicChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Gothic Chess board?", choices: ["10×8", "8×8", "10×10", "12×12"], correct: 0 },
  { question: "Two added pieces?", choices: ["Chancellor & Archbishop", "Hawk & Elephant", "Wizard & Champion", "Lion & Dragon"], correct: 0 },
  { question: "Designer?", choices: ["Ed Trice (2000)", "Capablanca", "Fischer", "Glinski"], correct: 0 },
  { question: "Difference vs Capablanca?", choices: ["Specific starting square placement of Chancellor and Archbishop", "Different board size", "Different pieces", "Same"], correct: 0 },
  { question: "Patent status?", choices: ["Was patented (now expired)", "Open from start", "FIDE owns it", "None"], correct: 0 },
  { question: "Promotion rank?", choices: ["8th rank", "10th", "5th", "First"], correct: 0 },
  { question: "Castling?", choices: ["Standard adapted", "Forbidden", "Special long only", "None"], correct: 0 },
  { question: "Why 'Gothic'?", choices: ["Marketed by Trice's company name", "Medieval origin", "From Gothic books", "Tournament name"], correct: 0 },
  { question: "Top engine for Gothic Chess?", choices: ["Various — engines exist", "None", "Stockfish only", "Komodo only"], correct: 0 },
  { question: "Game-theory status?", choices: ["Unsolved — too large to compute fully", "Solved as draw", "Solved as white win", "Trivial"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GothicChessSettings): GothicChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GothicChessState, action: GothicChessAction): GothicChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GothicChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
