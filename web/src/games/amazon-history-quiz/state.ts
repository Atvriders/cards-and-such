import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AmazonHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface AmazonHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AmazonHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Amazon was founded in what year?", choices: ["1992","1994","1996","1998"], correct: 1 },
  { question: "Jeff Bezos founded Amazon in?", choices: ["Seattle","San Francisco","New York","Austin"], correct: 0 },
  { question: "Amazon originally sold what?", choices: ["Books","Music","Toys","Electronics"], correct: 0 },
  { question: "Amazon's IPO was in?", choices: ["1995","1997","1999","2001"], correct: 1 },
  { question: "AWS launched publicly in?", choices: ["2002","2004","2006","2008"], correct: 2 },
  { question: "Kindle launched in?", choices: ["2005","2007","2009","2011"], correct: 1 },
  { question: "Amazon Prime launched in?", choices: ["2003","2005","2007","2009"], correct: 1 },
  { question: "Amazon acquired Whole Foods in?", choices: ["2015","2017","2019","2021"], correct: 1 },
  { question: "Andy Jassy became CEO in?", choices: ["2019","2020","2021","2022"], correct: 2 },
  { question: "Alexa launched in?", choices: ["2012","2014","2016","2018"], correct: 1 },
  { question: "Amazon's name is inspired by?", choices: ["A river","A warrior","An empire","A song"], correct: 0 },
  { question: "Amazon Studios first released a hit show with?", choices: ["Transparent","The Boys","Bosch","Mozart in the Jungle"], correct: 0 },
  { question: "Amazon's first acquisition was?", choices: ["IMDb","Audible","Junglee","Drugstore.com"], correct: 2 },
  { question: "Amazon HQ2 cities chosen were?", choices: ["NYC and Northern VA","Boston and Atlanta","Austin and Toronto","Just one: Arlington"], correct: 0 },
  { question: "Amazon Echo's wake word default is?", choices: ["Alexa","Echo","Amazon","Computer"], correct: 0 },
  { question: "Bezos stepped down as CEO in?", choices: ["2020","2021","2022","2023"], correct: 1 },
  { question: "Amazon One Click patent was filed in?", choices: ["1995","1997","1999","2001"], correct: 1 },
  { question: "Amazon's Blue Origin (Bezos space company) was founded in?", choices: ["1999","2000","2002","2004"], correct: 1 },
  { question: "Amazon's first major hardware was?", choices: ["Fire phone","Kindle","Echo","Fire TV"], correct: 1 },
  { question: "Amazon acquired MGM in?", choices: ["2020","2021","2022","2023"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AmazonHistoryQuizSettings): AmazonHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AmazonHistoryQuizState, action: AmazonHistoryQuizAction): AmazonHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AmazonHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
