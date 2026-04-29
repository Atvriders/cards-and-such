import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CamelotSettings { questions: "10"; }
export interface CamelotState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CamelotAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Camelot was designed by", choices: ["George S. Parker (Parker Brothers)", "Sid Sackson", "Reiner Knizia", "Bobby Fischer"], correct: 0 },
  { question: "Pieces in Camelot are", choices: ["Knights and Men", "Knights and Pawns only", "Bishops and Rooks", "Cannons and Generals"], correct: 0 },
  { question: "The board is", choices: ["Cross-shaped grid (about 12×16)", "Standard 8×8", "Hex grid", "Round"], correct: 0 },
  { question: "The 'castle' goal is", choices: ["Get two pieces into the opponent's castle squares", "Capture the king", "Promote a piece", "Surround the enemy"], correct: 0 },
  { question: "Knights have a special power called", choices: ["Knight's charge — combining moves and jumps", "Castling", "En passant", "Promotion"], correct: 0 },
  { question: "Captures use", choices: ["Custodian and jumping captures", "En passant", "Diagonal slides", "No captures"], correct: 0 },
  { question: "Camelot peaked in popularity in", choices: ["The early 20th century USA", "Medieval England", "Modern Japan", "Ancient Egypt"], correct: 0 },
  { question: "A capture-jump can chain into", choices: ["A multi-jump combo", "A pawn promotion", "An automatic win", "A castle move"], correct: 0 },
  { question: "Win condition (alternate)", choices: ["Capture all opponent's pieces", "Promote three pieces", "Reach center", "First to 3 captures"], correct: 0 },
  { question: "Camelot belongs to the", choices: ["Abstract strategy family", "Race game family", "Card family", "Trick-taking family"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CamelotSettings): CamelotState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CamelotState, action: CamelotAction): CamelotState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CamelotState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
