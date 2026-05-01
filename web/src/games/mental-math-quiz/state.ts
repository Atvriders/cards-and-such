import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface MentalMathQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MentalMathQuizSettings { questions: "10" | "20"; }
export interface MentalMathQuizState { questions: MentalMathQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MentalMathQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: MentalMathQuizQuestion[] = [
  { question: "What is 7 + 8?", choices: ["13","14","15","16"], correct: 2 },
  { question: "What is 12 - 5?", choices: ["5","6","7","8"], correct: 2 },
  { question: "What is 6 × 4?", choices: ["18","20","24","28"], correct: 2 },
  { question: "What is 36 ÷ 6?", choices: ["4","5","6","7"], correct: 2 },
  { question: "What is 9 + 14?", choices: ["21","22","23","24"], correct: 2 },
  { question: "What is 50 - 17?", choices: ["31","32","33","34"], correct: 2 },
  { question: "What is 7 × 8?", choices: ["54","56","58","64"], correct: 1 },
  { question: "What is 81 ÷ 9?", choices: ["7","8","9","10"], correct: 2 },
  { question: "What is 25 + 36?", choices: ["59","60","61","62"], correct: 2 },
  { question: "What is 11 × 12?", choices: ["121","132","134","144"], correct: 1 },
  { question: "What is 100 - 64?", choices: ["34","36","38","40"], correct: 1 },
  { question: "What is 9 × 9?", choices: ["72","79","81","99"], correct: 2 },
  { question: "What is 15 + 27?", choices: ["40","41","42","43"], correct: 2 },
  { question: "What is 144 ÷ 12?", choices: ["10","11","12","13"], correct: 2 },
  { question: "What is 8 × 7?", choices: ["48","54","56","58"], correct: 2 },
  { question: "What is 200 - 75?", choices: ["115","120","125","130"], correct: 2 },
  { question: "What is 13 + 19?", choices: ["30","31","32","33"], correct: 2 },
  { question: "What is 6 × 9?", choices: ["48","52","54","56"], correct: 2 },
  { question: "What is 72 ÷ 8?", choices: ["7","8","9","10"], correct: 2 },
  { question: "What is 24 + 38?", choices: ["60","61","62","63"], correct: 2 },
  { question: "What is 15 × 4?", choices: ["50","55","60","65"], correct: 2 },
  { question: "What is 90 - 47?", choices: ["41","42","43","44"], correct: 2 },
  { question: "What is 7 × 11?", choices: ["66","70","77","81"], correct: 2 },
  { question: "What is 18 + 25?", choices: ["41","42","43","44"], correct: 2 },
  { question: "What is 64 ÷ 8?", choices: ["6","7","8","9"], correct: 2 },
  { question: "What is 5 × 13?", choices: ["55","60","65","70"], correct: 2 },
  { question: "What is 100 - 28?", choices: ["62","68","72","78"], correct: 2 },
  { question: "What is 14 × 3?", choices: ["38","40","42","44"], correct: 2 },
  { question: "What is 56 + 27?", choices: ["81","82","83","84"], correct: 2 },
  { question: "What is 96 ÷ 6?", choices: ["14","15","16","17"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MentalMathQuizSettings): MentalMathQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MentalMathQuizState, action: MentalMathQuizAction): MentalMathQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MentalMathQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
