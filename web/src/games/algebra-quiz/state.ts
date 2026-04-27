import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface AlgebraQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AlgebraQuizSettings { questions: "10" | "20"; }
export interface AlgebraQuizState { questions: AlgebraQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AlgebraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: AlgebraQuizQuestion[] = [
  { question: "Solve 2x + 3 = 11. x = ?", choices: ["3","4","5","6"], correct: 1 },
  { question: "Simplify 3x + 2x.", choices: ["5x","6x","x","x²"], correct: 0 },
  { question: "Factor x² - 9.", choices: ["(x-3)²","(x+3)²","(x-3)(x+3)","x(x-9)"], correct: 2 },
  { question: "Expand (x+1)(x+2).", choices: ["x²+x+2","x²+3x+2","x²+2","x²+3"], correct: 1 },
  { question: "Solve x/4 = 7. x = ?", choices: ["3","11","21","28"], correct: 3 },
  { question: "What is 5² × 5³?", choices: ["5⁵","5⁶","25⁵","25⁶"], correct: 0 },
  { question: "Solve 3(x-2) = 9. x = ?", choices: ["3","4","5","6"], correct: 2 },
  { question: "Simplify (x³)²?", choices: ["x⁵","x⁶","x⁹","2x³"], correct: 1 },
  { question: "If f(x) = 2x + 1, what is f(3)?", choices: ["5","6","7","8"], correct: 2 },
  { question: "Factor x² + 5x + 6.", choices: ["(x+1)(x+6)","(x+2)(x+3)","(x+3)(x+3)","(x+1)(x+5)"], correct: 1 },
  { question: "Solve 5x = 35. x = ?", choices: ["5","6","7","8"], correct: 2 },
  { question: "What is the slope of y = 3x + 2?", choices: ["2","3","5","-3"], correct: 1 },
  { question: "Simplify 4x - x.", choices: ["3x","4x","5x","x"], correct: 0 },
  { question: "Solve x² = 49. x = ?", choices: ["±5","±6","±7","±8"], correct: 2 },
  { question: "What is 2³?", choices: ["6","8","9","12"], correct: 1 },
  { question: "Solve 2x + 3 = 7x - 2. x = ?", choices: ["1","2","3","4"], correct: 0 },
  { question: "Expand (a+b)².", choices: ["a²+b²","a²+2ab+b²","a²-b²","2ab"], correct: 1 },
  { question: "What is x⁰ for any nonzero x?", choices: ["0","x","1","Undefined"], correct: 2 },
  { question: "Solve |x| = 5. x = ?", choices: ["5","±5","-5","0"], correct: 1 },
  { question: "Simplify 6/(2x) × x.", choices: ["3","6","2x","3x"], correct: 0 },
  { question: "Factor 2x² + 4x.", choices: ["2(x²+2x)","2x(x+2)","x(2x+4)","All correct"], correct: 3 },
  { question: "If 3a = 12, what is a²?", choices: ["8","12","16","20"], correct: 2 },
  { question: "Solve 4 - x = 1. x = ?", choices: ["1","2","3","5"], correct: 2 },
  { question: "What is √(x²)?", choices: ["x","|x|","x²","±x"], correct: 1 },
  { question: "y = mx + b is a line in?", choices: ["Slope-intercept form","Standard form","Point-slope form","None"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AlgebraQuizSettings): AlgebraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AlgebraQuizState, action: AlgebraQuizAction): AlgebraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AlgebraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
