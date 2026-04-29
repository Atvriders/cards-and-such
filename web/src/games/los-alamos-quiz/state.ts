import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LosAlamosQuizSettings { questions: "10"; }
export interface LosAlamosQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LosAlamosQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Los Alamos chess uses a", choices: ["6×6 board", "8×8 board", "10×10 board", "5×5 board"], correct: 0 },
  { question: "The variant has", choices: ["No bishops", "No queens", "No knights", "No rooks"], correct: 0 },
  { question: "Pawns can move", choices: ["Only one square at a time (no double step)", "Two squares always", "Three squares", "Diagonally first"], correct: 0 },
  { question: "Castling in Los Alamos is", choices: ["Not allowed", "Required", "Standard", "Only king-side"], correct: 0 },
  { question: "The variant is historically significant for", choices: ["Being one of the first computer chess programs (1956)", "Olympic chess", "Bobby Fischer's training", "FIDE rule changes"], correct: 0 },
  { question: "Players are", choices: ["Two", "Four", "One", "Six"], correct: 0 },
  { question: "Initial setup includes", choices: ["King, queen, two rooks, two knights, six pawns per side", "Standard 16", "Eight pawns only", "Two queens"], correct: 0 },
  { question: "Pawn promotion ranks are", choices: ["Rank 6 for white", "Rank 8", "Rank 4", "No promotion"], correct: 0 },
  { question: "The variant runs in around", choices: ["A short, sharp game", "Six hours", "No time", "Days"], correct: 0 },
  { question: "Los Alamos was designed for", choices: ["Early computers with limited memory", "Bobby Fischer", "Casual play", "Lichess testing"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LosAlamosQuizSettings): LosAlamosQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LosAlamosQuizState, action: LosAlamosQuizAction): LosAlamosQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LosAlamosQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
