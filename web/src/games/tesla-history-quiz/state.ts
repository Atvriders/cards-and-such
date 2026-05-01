import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TeslaHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface TeslaHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TeslaHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tesla, Inc. was founded in what year?", choices: ["2001","2003","2005","2007"], correct: 1 },
  { question: "Who were the original founders of Tesla Motors?", choices: ["Elon Musk & JB Straubel","Martin Eberhard & Marc Tarpenning","Elon Musk alone","Franz von Holzhausen & JB Straubel"], correct: 1 },
  { question: "In what year did Elon Musk become Tesla's CEO?", choices: ["2004","2006","2008","2010"], correct: 2 },
  { question: "Tesla's first production vehicle was the?", choices: ["Model S","Roadster","Model 3","Model X"], correct: 1 },
  { question: "The Tesla Roadster was based on the chassis of which sports car?", choices: ["Mazda MX-5","Lotus Elise","Porsche Boxster","BMW Z4"], correct: 1 },
  { question: "Tesla went public (IPO) in what year?", choices: ["2008","2010","2012","2014"], correct: 1 },
  { question: "Tesla is headquartered in which city?", choices: ["Palo Alto, CA","Fremont, CA","Austin, TX","Reno, NV"], correct: 2 },
  { question: "In what year did Tesla move its HQ from California to Texas?", choices: ["2019","2020","2021","2022"], correct: 2 },
  { question: "The Model S was first delivered to customers in what year?", choices: ["2010","2011","2012","2013"], correct: 2 },
  { question: "The Model X is famous for which feature?", choices: ["Frunk","Falcon-wing doors","Yoke steering","Plaid mode"], correct: 1 },
  { question: "The Model 3 was unveiled in what year?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "The Model Y was released in what year?", choices: ["2018","2019","2020","2021"], correct: 2 },
  { question: "The Tesla Cybertruck was unveiled in what year?", choices: ["2017","2018","2019","2020"], correct: 2 },
  { question: "First Cybertruck deliveries occurred in what year?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "The Tesla Semi truck was first unveiled in what year?", choices: ["2015","2016","2017","2018"], correct: 2 },
  { question: "Tesla's Gigafactory 1 was built in what U.S. state?", choices: ["California","Texas","Nevada","Arizona"], correct: 2 },
  { question: "Tesla's Shanghai Gigafactory began deliveries in?", choices: ["2018","2019","2020","2021"], correct: 1 },
  { question: "Tesla's European Gigafactory is located near which city?", choices: ["Munich","Berlin","Stuttgart","Hamburg"], correct: 1 },
  { question: "Tesla acquired SolarCity in what year?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "Who was the SolarCity CEO and Elon Musk's cousin?", choices: ["Lyndon Rive","JB Straubel","Drew Baglino","Tom Zhu"], correct: 0 },
  { question: "Tesla's Powerwall is what kind of product?", choices: ["EV charger","Home battery","Solar inverter","Robot"], correct: 1 },
  { question: "'Plaid' refers to which Tesla feature?", choices: ["Top-trim performance","Color option","Software UI","Self-driving mode"], correct: 0 },
  { question: "Tesla's driver-assist system is called?", choices: ["AutoPilot","SmartDrive","FSD only","CoPilot"], correct: 0 },
  { question: "Tesla joined the S&P 500 in what year?", choices: ["2018","2019","2020","2021"], correct: 2 },
  { question: "Tesla's chief designer is?", choices: ["Henrik Fisker","Franz von Holzhausen","Peter Schreyer","Ian Callum"], correct: 1 },
  { question: "The Tesla Optimus is a?", choices: ["Drone","Humanoid robot","Boat","Truck"], correct: 1 },
  { question: "Tesla's Supercharger network uses which connector standard in North America going forward?", choices: ["CCS1","CHAdeMO","NACS","Type 2"], correct: 2 },
  { question: "Approximately how many vehicles did Tesla deliver in 2023?", choices: ["~900,000","~1.3 million","~1.8 million","~2.5 million"], correct: 2 },
  { question: "Tesla's stock ticker symbol is?", choices: ["TSL","TSLA","TES","TLA"], correct: 1 },
  { question: "Which model did Tesla discontinue from production after the original ran 2008-2012?", choices: ["Model S","Roadster","Model X","Model 3"], correct: 1 }
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
