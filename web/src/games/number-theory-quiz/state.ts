import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface NumberTheoryQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NumberTheoryQuizSettings { questions: "10" | "20"; }
export interface NumberTheoryQuizState { questions: NumberTheoryQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NumberTheoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: NumberTheoryQuizQuestion[] = [
  { question: "What is the smallest prime number?", choices: ["1","2","3","5"], correct: 1 },
  { question: "Is 17 prime?", choices: ["Yes","No","Sometimes","Composite"], correct: 0 },
  { question: "GCD(12, 18) = ?", choices: ["2","3","6","9"], correct: 2 },
  { question: "LCM(4, 6) = ?", choices: ["10","12","18","24"], correct: 1 },
  { question: "Prime factorization of 60?", choices: ["2²·3·5","2·3·10","4·15","6·10"], correct: 0 },
  { question: "Is 9 prime?", choices: ["Yes","No","Maybe","Sometimes"], correct: 1 },
  { question: "7 mod 3 = ?", choices: ["0","1","2","3"], correct: 1 },
  { question: "Number of divisors of 12?", choices: ["4","5","6","8"], correct: 2 },
  { question: "Is 0 even?", choices: ["No","Yes","Neither","Both"], correct: 1 },
  { question: "Sum of first 5 primes (2+3+5+7+11)?", choices: ["18","26","28","30"], correct: 2 },
  { question: "How many primes less than 10?", choices: ["3","4","5","6"], correct: 1 },
  { question: "A perfect square ending in 5 ends in?", choices: ["00","25","75","Any"], correct: 1 },
  { question: "Twin primes are primes that differ by?", choices: ["1","2","3","Any prime"], correct: 1 },
  { question: "GCD(8, 12) = ?", choices: ["2","3","4","6"], correct: 2 },
  { question: "15 mod 4 = ?", choices: ["1","2","3","4"], correct: 2 },
  { question: "Smallest composite number?", choices: ["2","3","4","6"], correct: 2 },
  { question: "Mersenne primes have form?", choices: ["2^n + 1","2^n - 1","n²+1","n!+1"], correct: 1 },
  { question: "6 is a perfect number because 1+2+3 =?", choices: ["5","6","7","12"], correct: 1 },
  { question: "Are all primes odd? (besides 2)", choices: ["Yes","No, 1 too","2 is even prime","All even"], correct: 2 },
  { question: "How many positive divisors of 16?", choices: ["3","4","5","6"], correct: 2 },
  { question: "Goldbach conjecture: every even >2 is sum of two?", choices: ["Cubes","Primes","Squares","Any"], correct: 1 },
  { question: "Fundamental theorem of arithmetic: every integer >1 is uniquely?", choices: ["Prime","Even","Product of primes","Square"], correct: 2 },
  { question: "Coprime means GCD =?", choices: ["0","1","2","Equal"], correct: 1 },
  { question: "Number of primes between 20 and 30?", choices: ["1","2","3","4"], correct: 1 },
  { question: "100 mod 7 = ?", choices: ["1","2","3","6"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NumberTheoryQuizSettings): NumberTheoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NumberTheoryQuizState, action: NumberTheoryQuizAction): NumberTheoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NumberTheoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
