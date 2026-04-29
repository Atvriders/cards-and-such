import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CanadianCheckersSettings { questions: "10"; }
export interface CanadianCheckersState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CanadianCheckersAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Canadian Checkers is played on a", choices: ["12×12 board", "8×8 board", "10×10 board", "6×6 board"], correct: 0 },
  { question: "Each player starts with", choices: ["30 pieces", "12 pieces", "20 pieces", "8 pieces"], correct: 0 },
  { question: "Capture rules follow", choices: ["International draughts (mandatory maximum capture)", "English draughts", "Russian draughts", "No captures"], correct: 0 },
  { question: "Kings are called", choices: ["Dames", "Queens", "Lords", "Aces"], correct: 0 },
  { question: "Kings move", choices: ["Long-range diagonally (flying king)", "One square only", "Like a chess knight", "Cannot move"], correct: 0 },
  { question: "Backward captures by men are", choices: ["Allowed (as in international draughts)", "Forbidden", "Only by kings", "Only on first move"], correct: 0 },
  { question: "Region of greatest popularity", choices: ["Quebec, Canada", "Brazil", "Italy", "Russia"], correct: 0 },
  { question: "Win condition", choices: ["Capture or block all opponent's pieces", "Promote one piece", "Reach the last row", "Checkmate"], correct: 0 },
  { question: "Compared with international (10×10), Canadian is", choices: ["Larger and slower", "Smaller and faster", "Identical", "On a hex board"], correct: 0 },
  { question: "Canadian Checkers is a member of the", choices: ["Draughts/checkers family", "Chess family", "Mancala family", "Backgammon family"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CanadianCheckersSettings): CanadianCheckersState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CanadianCheckersState, action: CanadianCheckersAction): CanadianCheckersState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CanadianCheckersState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
