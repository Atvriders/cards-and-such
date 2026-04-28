import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HexChessGlinskiSettings { questions: "10"; }
export interface HexChessGlinskiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HexChessGlinskiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Glinski hex chess board cells?", choices: ["91", "64", "81", "100"], correct: 0 },
  { question: "Pawn first move?", choices: ["One hex forward only — unlike McCooey", "Two squares", "Diagonal", "Sideways"], correct: 0 },
  { question: "En passant in Glinski?", choices: ["No (no two-square first move)", "Yes", "Only for kings", "Only on rank 4"], correct: 0 },
  { question: "Glinski has how many bishops/side?", choices: ["3", "2", "4", "1"], correct: 0 },
  { question: "Promotion happens on?", choices: ["Far edge (varies by file)", "Rank 8", "Center", "Any rank"], correct: 0 },
  { question: "Knight leap distance?", choices: ["A 2-1 jump in hex coordinates", "Square's L-shape", "One hex", "Three hexes"], correct: 0 },
  { question: "Bishops change color?", choices: ["Never (each bishop fixed to its color of hex)", "Yes", "Every move", "Random"], correct: 0 },
  { question: "Initial king position?", choices: ["Center file along home rank", "Corner", "On the diagonal", "Anywhere"], correct: 0 },
  { question: "Why is Glinski popular?", choices: ["Cleanest geometry of hex variants", "Easiest to compute", "Smallest", "Free pieces"], correct: 0 },
  { question: "Who designed it?", choices: ["Władysław Gliński (1936)", "McCooey", "Fischer", "Capablanca"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HexChessGlinskiSettings): HexChessGlinskiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HexChessGlinskiState, action: HexChessGlinskiAction): HexChessGlinskiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HexChessGlinskiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
