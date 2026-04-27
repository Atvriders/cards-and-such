import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface MentalMathQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MentalMathQuizSettings { questions: "10" | "20"; }
export interface MentalMathQuizState { questions: MentalMathQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MentalMathQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: MentalMathQuizQuestion[] = [
  { question: "What is 7 × 8?", choices: ["54","56","64","48"], correct: 1 },
  { question: "What is 144 ÷ 12?", choices: ["10","11","12","13"], correct: 2 },
  { question: "What is 25% of 80?", choices: ["10","15","20","25"], correct: 2 },
  { question: "What is 9² + 1?", choices: ["80","81","82","100"], correct: 2 },
  { question: "What is 17 + 28?", choices: ["35","45","55","65"], correct: 1 },
  { question: "What is 100 - 37?", choices: ["53","63","73","83"], correct: 1 },
  { question: "What is 6 × 7 × 2?", choices: ["72","82","84","94"], correct: 2 },
  { question: "What is 50% of 144?", choices: ["62","72","82","92"], correct: 1 },
  { question: "What is 11 × 11?", choices: ["111","121","131","141"], correct: 1 },
  { question: "What is 96 ÷ 8?", choices: ["12","11","10","13"], correct: 0 },
  { question: "What is 15 × 4?", choices: ["50","55","60","65"], correct: 2 },
  { question: "What is 13 + 17 + 19?", choices: ["49","59","69","79"], correct: 0 },
  { question: "What is 75% of 200?", choices: ["100","125","150","175"], correct: 2 },
  { question: "What is 7 × 12?", choices: ["72","84","96","108"], correct: 1 },
  { question: "What is √81?", choices: ["7","8","9","10"], correct: 2 },
  { question: "What is 24 × 5?", choices: ["110","115","120","125"], correct: 2 },
  { question: "What is 1000 - 247?", choices: ["743","753","763","773"], correct: 1 },
  { question: "What is 3/4 of 80?", choices: ["50","55","60","70"], correct: 2 },
  { question: "What is 8 × 9 + 5?", choices: ["75","77","79","81"], correct: 1 },
  { question: "What is 16²?", choices: ["256","260","266","272"], correct: 0 },
  { question: "What is 10% of 350?", choices: ["25","30","35","40"], correct: 2 },
  { question: "What is 19 × 6?", choices: ["104","114","124","134"], correct: 1 },
  { question: "What is 250 ÷ 5?", choices: ["40","45","50","55"], correct: 2 },
  { question: "What is 33 + 67?", choices: ["90","100","110","120"], correct: 1 },
  { question: "What is 8 × 25?", choices: ["180","190","200","210"], correct: 2 }
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
