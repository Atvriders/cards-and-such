import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface StatisticsQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StatisticsQuizSettings { questions: "10" | "20"; }
export interface StatisticsQuizState { questions: StatisticsQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StatisticsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: StatisticsQuizQuestion[] = [
  { question: "Arithmetic mean of {2,4,6,8} is?", choices: ["4","5","6","7"], correct: 1 },
  { question: "Median of {3,1,4,1,5,9,2}?", choices: ["2","3","4","5"], correct: 1 },
  { question: "Mode of {2,3,3,4,5,5,5,6}?", choices: ["3","4","5","6"], correct: 2 },
  { question: "Range of {7,2,9,4}?", choices: ["5","6","7","9"], correct: 2 },
  { question: "Variance measures?", choices: ["Center","Spread","Skew","Mode"], correct: 1 },
  { question: "Standard deviation is the?", choices: ["Variance squared","Square root of variance","Mean of squares","Range/2"], correct: 1 },
  { question: "In a normal distribution, ~68% of data lies within?", choices: ["±0.5σ","±1σ","±2σ","±3σ"], correct: 1 },
  { question: "In a normal distribution, ~95% of data lies within?", choices: ["±1σ","±2σ","±3σ","±4σ"], correct: 1 },
  { question: "Median is preferred over mean when data has?", choices: ["Few values","Outliers","Equal spread","Symmetry"], correct: 1 },
  { question: "Correlation coefficient r ranges over?", choices: ["[0,1]","[−1,1]","[0,∞)","All reals"], correct: 1 },
  { question: "r = 0 indicates?", choices: ["Strong positive","Strong negative","No linear association","Perfect"], correct: 2 },
  { question: "A p-value below α suggests?", choices: ["Accept H₀","Reject H₀","No conclusion","Increase α"], correct: 1 },
  { question: "Type I error is?", choices: ["Reject true H₀","Accept false H₀","Reject false H₀","Accept true H₀"], correct: 0 },
  { question: "Type II error is?", choices: ["Reject true H₀","Fail to reject false H₀","Reject false H₀","Accept true H₀"], correct: 1 },
  { question: "Sample mean is denoted?", choices: ["μ","x̄","σ","s"], correct: 1 },
  { question: "Population standard deviation symbol?", choices: ["x̄","s","σ","μ"], correct: 2 },
  { question: "Variance of {2,4,4,4,5,5,7,9}? (population)", choices: ["2","4","6","8"], correct: 1 },
  { question: "Quartiles divide data into how many parts?", choices: ["3","4","5","10"], correct: 1 },
  { question: "IQR equals?", choices: ["Max − Min","Q3 − Q1","Q2 − Q1","Mean − Median"], correct: 1 },
  { question: "Skewness measures?", choices: ["Spread","Asymmetry","Peakedness","Center"], correct: 1 },
  { question: "Kurtosis measures?", choices: ["Asymmetry","Tail heaviness/peakedness","Center","Spread"], correct: 1 },
  { question: "Central Limit Theorem says sample means are approximately?", choices: ["Uniform","Normal","Poisson","Exponential"], correct: 1 },
  { question: "A 95% confidence interval is constructed using approximately z = ?", choices: ["1.28","1.645","1.96","2.58"], correct: 2 },
  { question: "Linear regression minimizes?", choices: ["Sum of residuals","Sum of squared residuals","Max residual","Median residual"], correct: 1 },
  { question: "R² in regression measures?", choices: ["Slope","Intercept","Proportion of variance explained","Residual sum"], correct: 2 },
  { question: "In hypothesis testing, α is the?", choices: ["Power","Significance level","Effect size","p-value"], correct: 1 },
  { question: "Power of a test equals?", choices: ["α","1−α","β","1−β"], correct: 3 },
  { question: "Mean absolute deviation uses?", choices: ["Squared deviations","Absolute deviations","Cubed deviations","Signed deviations"], correct: 1 },
  { question: "A boxplot shows?", choices: ["Mean only","Five-number summary","Mode","Variance"], correct: 1 },
  { question: "Coefficient of variation equals?", choices: ["σ/μ","μ/σ","σ²/μ","μ²/σ"], correct: 0 }
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
