import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ProbabilityQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ProbabilityQuizSettings { questions: "10" | "20"; }
export interface ProbabilityQuizState { questions: ProbabilityQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ProbabilityQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: ProbabilityQuizQuestion[] = [
  { question: "Probability of heads on a fair coin?", choices: ["1/3","1/2","2/3","1"], correct: 1 },
  { question: "Probability of rolling a 6 on one die?", choices: ["1/4","1/5","1/6","1/12"], correct: 2 },
  { question: "Probability of drawing an Ace from a 52-card deck?", choices: ["1/13","1/26","1/52","4/52"], correct: 0 },
  { question: "Probability of two heads in two flips?", choices: ["1/2","1/3","1/4","1/8"], correct: 2 },
  { question: "Probability of rolling a sum of 7 with two dice?", choices: ["1/6","1/8","5/36","1/12"], correct: 0 },
  { question: "How many ways to arrange 3 distinct items?", choices: ["3","6","9","12"], correct: 1 },
  { question: "5 choose 2 equals?", choices: ["5","10","15","20"], correct: 1 },
  { question: "Expected value of one die roll?", choices: ["3","3.5","4","5"], correct: 1 },
  { question: "Probability of NOT getting a 6 on one die?", choices: ["1/6","2/6","5/6","6/6"], correct: 2 },
  { question: "Two independent events: P(A)=1/2, P(B)=1/3. P(A and B)?", choices: ["1/2","5/6","1/6","2/3"], correct: 2 },
  { question: "Conditional probability P(A|B) is?", choices: ["P(A and B)/P(B)","P(A)/P(B)","P(A)+P(B)","P(B)/P(A)"], correct: 0 },
  { question: "Bayes' theorem relates?", choices: ["P(A|B) and P(B|A)","Means","Variances","Sums"], correct: 0 },
  { question: "Monty Hall: switch doors gives win probability?", choices: ["1/3","1/2","2/3","3/4"], correct: 2 },
  { question: "Probability of drawing 2 hearts in a row (no replacement)?", choices: ["1/16","13/204","1/4","1/2"], correct: 1 },
  { question: "How many ways to choose 3 from 5?", choices: ["6","8","10","15"], correct: 2 },
  { question: "Probability of rolling doubles with two dice?", choices: ["1/3","1/4","1/6","1/9"], correct: 2 },
  { question: "In 23 people, prob of shared birthday is roughly?", choices: ["1%","10%","50%","99%"], correct: 2 },
  { question: "Probability of a king OR queen on one draw?", choices: ["1/13","2/13","4/13","8/52"], correct: 1 },
  { question: "3 coin flips, probability of all tails?", choices: ["1/2","1/3","1/8","1/16"], correct: 2 },
  { question: "Permutations of n items is?", choices: ["n","n²","n!","n^n"], correct: 2 },
  { question: "Mutually exclusive events have P(A and B) =?", choices: ["1","P(A)+P(B)","0","P(A)×P(B)"], correct: 2 },
  { question: "Probability of picking the same color glove from a drawer of 3 red, 2 blue (no replacement)?", choices: ["10/20","8/20","2/5","13/20"], correct: 1 },
  { question: "Coin flipped 4 times, probability of exactly 2 heads?", choices: ["1/2","3/8","6/16","All same"], correct: 2 },
  { question: "Probability sum of 12 with two dice?", choices: ["1/36","2/36","1/12","1/6"], correct: 0 },
  { question: "Lottery 1-in-a-million odds means probability is?", choices: ["10⁻⁴","10⁻⁵","10⁻⁶","10⁻⁷"], correct: 2 }
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
