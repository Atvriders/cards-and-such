import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TeslaHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface TeslaHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TeslaHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tesla was founded in what year?", choices: ["2001","2003","2005","2007"], correct: 1 },
  { question: "Tesla's first co-founder was Martin Eberhard and?", choices: ["Elon Musk","JB Straubel","Marc Tarpenning","Ian Wright"], correct: 2 },
  { question: "Tesla is named after which inventor?", choices: ["Nikola Tesla","Thomas Edison","Alexander Bell","Albert Einstein"], correct: 0 },
  { question: "Tesla's first production car was?", choices: ["Model S","Roadster","Model 3","Model X"], correct: 1 },
  { question: "Elon Musk became Tesla CEO in?", choices: ["2003","2005","2008","2010"], correct: 2 },
  { question: "Tesla's IPO was in?", choices: ["2008","2010","2012","2014"], correct: 1 },
  { question: "Model S launched in?", choices: ["2009","2010","2012","2013"], correct: 2 },
  { question: "Model 3 launched in?", choices: ["2015","2016","2017","2018"], correct: 2 },
  { question: "Cybertruck was unveiled in?", choices: ["2017","2018","2019","2020"], correct: 2 },
  { question: "Tesla's Gigafactory 1 is in?", choices: ["Reno NV","Austin TX","Shanghai","Berlin"], correct: 0 },
  { question: "Tesla acquired SolarCity in?", choices: ["2014","2016","2018","2020"], correct: 1 },
  { question: "Tesla joined the S&P 500 in?", choices: ["2018","2020","2022","2024"], correct: 1 },
  { question: "Tesla's first Model X delivery year was?", choices: ["2014","2015","2016","2017"], correct: 1 },
  { question: "Model Y launched in?", choices: ["2018","2019","2020","2021"], correct: 2 },
  { question: "Tesla's Autopilot was first released in?", choices: ["2014","2015","2016","2017"], correct: 1 },
  { question: "Tesla Semi was unveiled in?", choices: ["2016","2017","2018","2019"], correct: 1 },
  { question: "Cybertruck's exoskeleton was promoted as which steel?", choices: ["Ultra-hard 30X stainless","Inconel","Titanium alloy","Carbon fiber"], correct: 0 },
  { question: "Tesla HQ moved from Palo Alto to?", choices: ["Austin","Houston","Reno","Las Vegas"], correct: 0 },
  { question: "Tesla's market cap first hit $1 trillion in?", choices: ["2019","2020","2021","2022"], correct: 2 },
  { question: "Tesla's Powerwall is a?", choices: ["Home battery","Solar inverter","EV charger","Heating system"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TeslaHistoryQuizSettings): TeslaHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TeslaHistoryQuizState, action: TeslaHistoryQuizAction): TeslaHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TeslaHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
