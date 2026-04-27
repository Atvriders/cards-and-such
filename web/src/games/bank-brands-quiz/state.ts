import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BankBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface BankBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BankBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "JPMorgan Chase is headquartered in?", choices: ["Boston", "New York", "Chicago", "San Francisco"], correct: 1 },
  { question: "Bank of America's HQ?", choices: ["NYC", "Charlotte", "Atlanta", "Dallas"], correct: 1 },
  { question: "Wells Fargo originated in?", choices: ["Boston", "San Francisco", "NYC", "Chicago"], correct: 1 },
  { question: "Goldman Sachs was founded in?", choices: ["1869", "1889", "1909", "1929"], correct: 0 },
  { question: "Morgan Stanley was founded in?", choices: ["1925", "1935", "1945", "1955"], correct: 1 },
  { question: "HSBC stands for?", choices: ["Hong Kong & Shanghai Banking Corporation", "Holland Standard Bank Co", "Hampshire Savings Bank Corp", "Highland Securities Banking Co"], correct: 0 },
  { question: "UBS is from?", choices: ["Germany", "Switzerland", "France", "UK"], correct: 1 },
  { question: "Credit Suisse was based in?", choices: ["Geneva", "Zurich", "Bern", "Basel"], correct: 1 },
  { question: "Deutsche Bank is from?", choices: ["Austria", "Germany", "Switzerland", "Netherlands"], correct: 1 },
  { question: "BNP Paribas is from?", choices: ["Belgium", "France", "Switzerland", "Italy"], correct: 1 },
  { question: "Santander is from?", choices: ["Spain", "Italy", "Portugal", "Mexico"], correct: 0 },
  { question: "Barclays is from?", choices: ["Ireland", "UK", "France", "Germany"], correct: 1 },
  { question: "Lloyds is from?", choices: ["UK", "Italy", "Spain", "Netherlands"], correct: 0 },
  { question: "ING is from?", choices: ["Belgium", "Netherlands", "Luxembourg", "Germany"], correct: 1 },
  { question: "Nordea operates in?", choices: ["Iberia", "Nordics", "Balkans", "Caucasus"], correct: 1 },
  { question: "Mitsubishi UFJ is from?", choices: ["Japan", "Korea", "China", "Taiwan"], correct: 0 },
  { question: "ICBC is the largest bank in?", choices: ["Japan", "India", "China", "Russia"], correct: 2 },
  { question: "SBI is the largest bank of?", choices: ["India", "Indonesia", "Iran", "Israel"], correct: 0 },
  { question: "Royal Bank of Canada hub?", choices: ["Toronto", "Montreal", "Ottawa", "Vancouver"], correct: 0 },
  { question: "BMO stands for?", choices: ["Bank of Montreal", "British Mercantile Office", "Banco de Madrid Office", "Big Market Order"], correct: 0 },
  { question: "ANZ is based in?", choices: ["Australia", "New Zealand", "Both", "UK"], correct: 2 },
  { question: "Commonwealth Bank of Australia HQ?", choices: ["Sydney", "Melbourne", "Brisbane", "Perth"], correct: 0 },
  { question: "Citigroup is headquartered in?", choices: ["Chicago", "New York", "Boston", "LA"], correct: 1 },
  { question: "American Express was founded in?", choices: ["1850", "1870", "1890", "1910"], correct: 0 },
  { question: "Visa was originally launched by which bank?", choices: ["Wells Fargo", "Bank of America", "Chase", "Citi"], correct: 1 },
  { question: "Mastercard was founded in?", choices: ["1956", "1966", "1976", "1986"], correct: 1 },
  { question: "Lehman Brothers collapsed in?", choices: ["2007", "2008", "2009", "2010"], correct: 1 },
  { question: "Bear Stearns was acquired by?", choices: ["Citi", "JPMorgan", "BofA", "Morgan Stanley"], correct: 1 },
  { question: "Berkshire Hathaway is led by?", choices: ["Bill Ackman", "Warren Buffett", "Carl Icahn", "Ray Dalio"], correct: 1 },
  { question: "BlackRock is the world's largest?", choices: ["Bank", "Asset manager", "Insurance firm", "Hedge fund"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BankBrandsQuizSettings): BankBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BankBrandsQuizState, action: BankBrandsQuizAction): BankBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BankBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
