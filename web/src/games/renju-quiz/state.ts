import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RenjuSettings { questions: "10"; }
export interface RenjuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RenjuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Renju is the competitive variant of?", choices: ["Tic-tac-toe", "Gomoku", "Go", "Shogi"], correct: 1 },
  { question: "Renju is played on a board of?", choices: ["13x13", "14x14", "15x15", "19x19"], correct: 2 },
  { question: "In Renju, fouls apply to which player?", choices: ["Black only", "White only", "Both", "Neither"], correct: 0 },
  { question: "A 'double-three' for Black is?", choices: ["A win", "A foul", "A bonus", "A normal move"], correct: 1 },
  { question: "A 'double-four' for Black is?", choices: ["A win", "A foul", "A bonus", "Optional"], correct: 1 },
  { question: "An 'overline' (6+ in a row) for Black is?", choices: ["A win", "A foul", "Bonus", "Same as 5"], correct: 1 },
  { question: "The international body for Renju is?", choices: ["RIF", "FIDE", "JBL", "IGF"], correct: 0 },
  { question: "A Renju opening uses a special rule called?", choices: ["Swap2 / Yamaguchi rule", "Komi", "Atari", "Sente"], correct: 0 },
  { question: "Renju was systematized in?", choices: ["China", "Japan", "Korea", "USA"], correct: 1 },
  { question: "A Renju win is achieved by?", choices: ["Five in a row by either player (under fouls)", "Capturing pieces", "Territory", "Blocking five"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RenjuSettings): RenjuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RenjuState, action: RenjuAction): RenjuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RenjuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
