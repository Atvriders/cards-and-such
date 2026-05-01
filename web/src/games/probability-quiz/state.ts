import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ProbabilityQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ProbabilityQuizSettings { questions: "10" | "20"; }
export interface ProbabilityQuizState { questions: ProbabilityQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ProbabilityQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: ProbabilityQuizQuestion[] = [
  { question: "Probability of rolling a 6 on a fair die?", choices: ["1/2","1/3","1/6","1/12"], correct: 2 },
  { question: "Probability of heads on a fair coin?", choices: ["1/4","1/3","1/2","1"], correct: 2 },
  { question: "P(A or B) when A,B disjoint?", choices: ["P(A)·P(B)","P(A)+P(B)","P(A)+P(B)−P(A∩B)","P(A)−P(B)"], correct: 1 },
  { question: "P(A and B) when A,B independent?", choices: ["P(A)+P(B)","P(A)·P(B)","P(A∪B)","P(A|B)"], correct: 1 },
  { question: "P(A|B) equals?", choices: ["P(A∩B)/P(B)","P(A)·P(B)","P(B)/P(A)","P(A)+P(B)"], correct: 0 },
  { question: "Bayes' theorem: P(A|B) = ?", choices: ["P(B|A)·P(A)/P(B)","P(A)·P(B)","P(A∩B)","P(A)+P(B)−P(A∩B)"], correct: 0 },
  { question: "Sum of all probabilities in a sample space equals?", choices: ["0","0.5","1","∞"], correct: 2 },
  { question: "Probability ranges over?", choices: ["[−1,1]","[0,1]","(0,∞)","All reals"], correct: 1 },
  { question: "Expected value of fair die roll?", choices: ["3","3.5","4","6"], correct: 1 },
  { question: "Variance of a fair coin (heads = 1)?", choices: ["0","0.25","0.5","1"], correct: 1 },
  { question: "Number of permutations of n items?", choices: ["n","n²","n!","2^n"], correct: 2 },
  { question: "Number of ways to choose k from n?", choices: ["n!","n^k","C(n,k)","P(n,k)"], correct: 2 },
  { question: "C(5,2) equals?", choices: ["5","10","20","25"], correct: 1 },
  { question: "Probability of two heads in two flips?", choices: ["1/2","1/3","1/4","1/8"], correct: 2 },
  { question: "Probability of at least one head in two flips?", choices: ["1/4","1/2","3/4","1"], correct: 2 },
  { question: "Binomial distribution models?", choices: ["Continuous","# successes in n trials","Time to event","Position"], correct: 1 },
  { question: "Mean of Binomial(n,p)?", choices: ["p","np","n/p","p(1−p)"], correct: 1 },
  { question: "Variance of Binomial(n,p)?", choices: ["np","np(1−p)","p(1−p)","n(1−p)"], correct: 1 },
  { question: "Poisson distribution mean = variance = ?", choices: ["np","λ","p","n"], correct: 1 },
  { question: "In Poisson(λ), variance equals?", choices: ["λ²","λ","√λ","1/λ"], correct: 1 },
  { question: "Probability of drawing an Ace from a 52-card deck?", choices: ["1/13","1/26","1/52","4/13"], correct: 0 },
  { question: "Probability of drawing a heart?", choices: ["1/2","1/3","1/4","1/13"], correct: 2 },
  { question: "Independent events satisfy P(A∩B) = ?", choices: ["0","P(A)·P(B)","P(A)+P(B)","1"], correct: 1 },
  { question: "Mutually exclusive events satisfy P(A∩B) = ?", choices: ["1","P(A)·P(B)","0","P(A)"], correct: 2 },
  { question: "Geometric distribution models?", choices: ["# successes","# trials until first success","Time","Mean"], correct: 1 },
  { question: "Mean of Geometric(p)?", choices: ["p","1/p","1−p","p/(1−p)"], correct: 1 },
  { question: "Continuous uniform [a,b] has mean?", choices: ["(a+b)/2","(b−a)/2","ab","b−a"], correct: 0 },
  { question: "Expectation E[X+Y] equals?", choices: ["E[X]·E[Y]","E[X]+E[Y]","E[X]−E[Y]","Var(X)+Var(Y)"], correct: 1 },
  { question: "Var(X+Y) for independent X,Y equals?", choices: ["Var(X)·Var(Y)","Var(X)+Var(Y)","Var(X)−Var(Y)","E[X]+E[Y]"], correct: 1 },
  { question: "Law of large numbers: sample mean converges to?", choices: ["0","Variance","Population mean","Median"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ProbabilityQuizSettings): ProbabilityQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ProbabilityQuizState, action: ProbabilityQuizAction): ProbabilityQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ProbabilityQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
