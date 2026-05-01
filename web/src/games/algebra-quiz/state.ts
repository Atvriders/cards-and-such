import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface AlgebraQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AlgebraQuizSettings { questions: "10" | "20"; }
export interface AlgebraQuizState { questions: AlgebraQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AlgebraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: AlgebraQuizQuestion[] = [
  { question: "Solve for x: 2x + 3 = 11", choices: ["3","4","5","6"], correct: 1 },
  { question: "Solve: 3x − 5 = 16", choices: ["5","6","7","8"], correct: 2 },
  { question: "Quadratic formula gives x = ?", choices: ["−b ± √(b²−4ac) / 2a","−b ± √(b²+4ac) / 2a","b ± √(b²−4ac) / 2a","−b ± √(4ac−b²) / 2a"], correct: 0 },
  { question: "Discriminant of ax²+bx+c is?", choices: ["b²−4ac","b²+4ac","4ac−b²","2b−4ac"], correct: 0 },
  { question: "If b²−4ac < 0, the roots are?", choices: ["Real distinct","Real equal","Complex conjugate","Rational"], correct: 2 },
  { question: "Factor x² − 9", choices: ["(x−3)²","(x+3)²","(x−3)(x+3)","(x−9)(x+1)"], correct: 2 },
  { question: "Factor x² + 5x + 6", choices: ["(x+1)(x+6)","(x+2)(x+3)","(x−2)(x−3)","(x+5)(x+1)"], correct: 1 },
  { question: "Slope of line through (1,2) and (3,8)?", choices: ["2","3","4","6"], correct: 1 },
  { question: "Slope-intercept form is?", choices: ["y = mx + b","y = ax² + b","ax + by = c","y − y₁ = m(x − x₁)"], correct: 0 },
  { question: "(a+b)² equals?", choices: ["a²+b²","a²+2ab+b²","a²−2ab+b²","2(a+b)"], correct: 1 },
  { question: "(a−b)(a+b) equals?", choices: ["a²+b²","a²−b²","(a−b)²","2ab"], correct: 1 },
  { question: "log_b(xy) equals?", choices: ["log_b x · log_b y","log_b x + log_b y","log_b x − log_b y","(log_b x)^y"], correct: 1 },
  { question: "log_b(x/y) equals?", choices: ["log_b x · log_b y","log_b x + log_b y","log_b x − log_b y","log_b(x−y)"], correct: 2 },
  { question: "log_b(x^n) equals?", choices: ["n + log_b x","n · log_b x","(log_b x)^n","log_b x / n"], correct: 1 },
  { question: "Solve: x² = 49", choices: ["±5","±6","±7","±8"], correct: 2 },
  { question: "Sum of roots of ax²+bx+c=0 is?", choices: ["−b/a","b/a","c/a","−c/a"], correct: 0 },
  { question: "Product of roots of ax²+bx+c=0 is?", choices: ["−b/a","b/a","c/a","−c/a"], correct: 2 },
  { question: "a^m · a^n equals?", choices: ["a^(m+n)","a^(m−n)","a^(mn)","a^(m/n)"], correct: 0 },
  { question: "(a^m)^n equals?", choices: ["a^(m+n)","a^(mn)","a^(m−n)","a^(m/n)"], correct: 1 },
  { question: "a^0 equals (a ≠ 0)?", choices: ["0","1","a","undefined"], correct: 1 },
  { question: "Solve: 5x + 2 = 3x + 10", choices: ["2","3","4","5"], correct: 2 },
  { question: "Distance between (0,0) and (3,4)?", choices: ["3","4","5","7"], correct: 2 },
  { question: "Midpoint of (2,4) and (8,10)?", choices: ["(4,6)","(5,7)","(6,8)","(10,14)"], correct: 1 },
  { question: "Solve x² − 5x + 6 = 0", choices: ["x=1,6","x=2,3","x=−2,−3","x=3,3"], correct: 1 },
  { question: "If f(x)=2x+1, f(3)=?", choices: ["5","6","7","9"], correct: 2 },
  { question: "Inverse of f(x) = 2x is?", choices: ["x/2","2x","−2x","x−2"], correct: 0 },
  { question: "Arithmetic series sum 1+2+…+n = ?", choices: ["n²","n(n+1)/2","n(n−1)/2","2n"], correct: 1 },
  { question: "Geometric series sum 1+r+r²+… (|r|<1)?", choices: ["1/(1−r)","1/(1+r)","r/(1−r)","(1−r)/r"], correct: 0 },
  { question: "Value of i² (imaginary unit)?", choices: ["1","−1","i","−i"], correct: 1 },
  { question: "Solve |x − 3| = 5", choices: ["x = 8 only","x = −2 only","x = 8 or x = −2","No solution"], correct: 2 }
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
