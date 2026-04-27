import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface StatisticsQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StatisticsQuizSettings { questions: "10" | "20"; }
export interface StatisticsQuizState { questions: StatisticsQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StatisticsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: StatisticsQuizQuestion[] = [
  { question: "The mean of 2, 4, 6 is?", choices: ["3","4","5","6"], correct: 1 },
  { question: "The median of 1, 3, 5, 7, 9 is?", choices: ["3","5","6","7"], correct: 1 },
  { question: "The mode of 1, 2, 2, 3, 4 is?", choices: ["1","2","3","4"], correct: 1 },
  { question: "The range of 4, 8, 12 is?", choices: ["4","6","8","12"], correct: 2 },
  { question: "Standard deviation measures?", choices: ["Center","Spread","Skew","Median"], correct: 1 },
  { question: "In a normal distribution, ~68% of data is within how many SDs of the mean?", choices: ["1","2","3","4"], correct: 0 },
  { question: "A p-value of 0.04 with α=0.05 is?", choices: ["Not significant","Significant","Inconclusive","Invalid"], correct: 1 },
  { question: "Correlation ranges from?", choices: ["0 to 1","-1 to 0","-1 to 1","-∞ to ∞"], correct: 2 },
  { question: "The 50th percentile is also called?", choices: ["Mean","Mode","Median","Range"], correct: 2 },
  { question: "A sample is a subset of?", choices: ["A model","A statistic","A population","An estimate"], correct: 2 },
  { question: "Variance is the square of?", choices: ["Mean","Standard deviation","Median","Range"], correct: 1 },
  { question: "Bayesian statistics uses?", choices: ["Frequencies only","Prior + likelihood","No prior","Random sampling"], correct: 1 },
  { question: "Type I error is?", choices: ["Reject true null","Accept false null","Both","Neither"], correct: 0 },
  { question: "Type II error is?", choices: ["Reject true null","Accept false null","Both","Neither"], correct: 1 },
  { question: "A skewed-right distribution has mean?", choices: ["< median","> median","= median","Undefined"], correct: 1 },
  { question: "Mean of 10 numbers is 5. Sum is?", choices: ["5","10","50","500"], correct: 2 },
  { question: "Median is robust against?", choices: ["Outliers","Sample size","Mode","Symmetry"], correct: 0 },
  { question: "Probability of an event is between?", choices: ["0 and 1","-1 and 1","0 and ∞","-∞ and ∞"], correct: 0 },
  { question: "Independent events have probability product equal to?", choices: ["P(A) + P(B)","P(A) × P(B)","P(A) - P(B)","Always 1"], correct: 1 },
  { question: "A bell curve is also called?", choices: ["Uniform","Normal","Skewed","Bimodal"], correct: 1 },
  { question: "Confidence interval gives?", choices: ["Exact value","Range of plausible values","P-value","Variance"], correct: 1 },
  { question: "Correlation does NOT imply?", choices: ["Association","Causation","Linearity","Sign"], correct: 1 },
  { question: "Sample size is denoted?", choices: ["μ","σ","n","N"], correct: 2 },
  { question: "Population mean symbol is?", choices: ["μ","σ","x̄","s"], correct: 0 },
  { question: "Two coin flips: probability of two heads is?", choices: ["1/2","1/3","1/4","1/8"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StatisticsQuizSettings): StatisticsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StatisticsQuizState, action: StatisticsQuizAction): StatisticsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StatisticsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
