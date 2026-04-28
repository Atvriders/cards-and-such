import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OmokSettings { questions: "10"; }
export interface OmokState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OmokAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Omok is the Korean version of?", choices: ["Go", "Five in a row", "Mahjong", "Hanafuda"], correct: 1 },
  { question: "Omok is usually played on?", choices: ["Cards", "A 9x9 grid", "A Baduk 19x19 board", "A 64-square chess"], correct: 2 },
  { question: "The word 'Omok' literally references?", choices: ["Five trees", "Five stones", "Five steps", "Five rounds"], correct: 1 },
  { question: "Omok is most popular in?", choices: ["Pro circuits", "Korean schoolyards", "Western casinos", "Online slots"], correct: 1 },
  { question: "Black's advantage in Omok is countered in tournament play with?", choices: ["Komi", "Renju-like restrictions", "Time bonus", "No restriction"], correct: 1 },
  { question: "Omok stones are?", choices: ["Glass beads", "Black and white Go stones", "Cards", "Dice"], correct: 1 },
  { question: "A win in Omok requires?", choices: ["3 in a row", "4 in a row", "5 in a row", "6 in a row"], correct: 2 },
  { question: "Omok grids include both?", choices: ["Diagonals only", "Rows and columns", "Just rows", "Just columns"], correct: 1 },
  { question: "Omok matches are usually shorter than?", choices: ["Sudoku", "Baduk/Go", "Card war", "Roll-and-write"], correct: 1 },
  { question: "Casual Omok is generally?", choices: ["Highly restricted", "Free of restrictions", "Played online only", "Bid-based"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OmokSettings): OmokState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OmokState, action: OmokAction): OmokState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OmokState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
