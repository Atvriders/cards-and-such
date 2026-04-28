import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpacexHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface SpacexHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpacexHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "SpaceX was founded in what year?", choices: ["2000","2002","2004","2006"], correct: 1 },
  { question: "SpaceX's first rocket was?", choices: ["Falcon 1","Falcon 9","Falcon Heavy","Starship"], correct: 0 },
  { question: "Falcon 1 first achieved orbit in?", choices: ["2006","2007","2008","2009"], correct: 2 },
  { question: "Falcon 9 first launched in?", choices: ["2008","2010","2012","2014"], correct: 1 },
  { question: "First Falcon 9 first-stage land-back was in?", choices: ["2013","2014","2015","2016"], correct: 2 },
  { question: "First successful Falcon 9 ocean drone-ship landing in?", choices: ["2015","2016","2017","2018"], correct: 1 },
  { question: "Falcon Heavy first launched in?", choices: ["2016","2017","2018","2019"], correct: 2 },
  { question: "Falcon Heavy's first launch payload was Elon Musk's?", choices: ["Cybertruck","Tesla Roadster","Solar Roof","Powerwall"], correct: 1 },
  { question: "Crew Dragon's first crewed flight (Demo-2) was in?", choices: ["2019","2020","2021","2022"], correct: 1 },
  { question: "Starship first orbital test launched in?", choices: ["2022","2023","2024","2025"], correct: 1 },
  { question: "SpaceX's Texas launch site is at?", choices: ["Boca Chica/Starbase","Brownsville","McGregor","Houston"], correct: 0 },
  { question: "Starlink launched its first batch of satellites in?", choices: ["2018","2019","2020","2021"], correct: 1 },
  { question: "SpaceX's main Florida launch pad is?", choices: ["LC-39A","LC-40","SLC-4","LC-37"], correct: 0 },
  { question: "Dragon CRS-1 first cargo mission was in?", choices: ["2010","2012","2014","2016"], correct: 1 },
  { question: "First all-civilian Inspiration4 mission was in?", choices: ["2020","2021","2022","2023"], correct: 1 },
  { question: "Falcon 9 Block 5 was introduced in?", choices: ["2017","2018","2019","2020"], correct: 1 },
  { question: "SpaceX's HQ is in?", choices: ["Hawthorne CA","Boca Chica TX","Cape Canaveral FL","Seattle WA"], correct: 0 },
  { question: "Gwynne Shotwell's role at SpaceX is?", choices: ["President & COO","CFO","CTO","Chief Engineer"], correct: 0 },
  { question: "SpaceX's first contract with NASA was for?", choices: ["Cargo Resupply","Crew transport","Lunar lander","Mars sample return"], correct: 0 },
  { question: "SpaceX won the NASA HLS contract for which moon program?", choices: ["Constellation","Artemis","Apollo","Gateway"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpacexHistoryQuizSettings): SpacexHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpacexHistoryQuizState, action: SpacexHistoryQuizAction): SpacexHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpacexHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
