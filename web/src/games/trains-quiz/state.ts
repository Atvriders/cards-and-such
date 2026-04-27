import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrainsQuizSettings { questions: "10" | "20" | "30"; }
export interface TrainsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrainsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Stephenson's Rocket year?",
    "choices": [
      "1825",
      "1829",
      "1835",
      "1840"
    ],
    "correct": 1
  },
  {
    "question": "First steam locomotive inventor?",
    "choices": [
      "Stephenson",
      "Trevithick",
      "Watt",
      "Stephens"
    ],
    "correct": 1
  },
  {
    "question": "Trevithick's loco year?",
    "choices": [
      "1801",
      "1804",
      "1812",
      "1815"
    ],
    "correct": 1
  },
  {
    "question": "Transcontinental Railroad completed (US)?",
    "choices": [
      "1865",
      "1869",
      "1875",
      "1880"
    ],
    "correct": 1
  },
  {
    "question": "Golden Spike at?",
    "choices": [
      "Promontory Summit",
      "San Francisco",
      "Sacramento",
      "Cheyenne"
    ],
    "correct": 0
  },
  {
    "question": "Orient Express first ran?",
    "choices": [
      "1865",
      "1883",
      "1900",
      "1920"
    ],
    "correct": 1
  },
  {
    "question": "Bullet Train (Shinkansen) first opened?",
    "choices": [
      "1959",
      "1964",
      "1970",
      "1975"
    ],
    "correct": 1
  },
  {
    "question": "TGV speed record (~)?",
    "choices": [
      "320 km/h",
      "375 km/h",
      "574 km/h",
      "600 km/h"
    ],
    "correct": 2
  },
  {
    "question": "Trans-Siberian length (~ km)?",
    "choices": [
      "5000",
      "7500",
      "9300",
      "12000"
    ],
    "correct": 2
  },
  {
    "question": "Channel Tunnel opened?",
    "choices": [
      "1990",
      "1994",
      "2000",
      "2004"
    ],
    "correct": 1
  },
  {
    "question": "Underground (London Tube) opened?",
    "choices": [
      "1863",
      "1880",
      "1900",
      "1920"
    ],
    "correct": 0
  },
  {
    "question": "NYC Subway opened?",
    "choices": [
      "1888",
      "1900",
      "1904",
      "1915"
    ],
    "correct": 2
  },
  {
    "question": "Maglev top speed (Shanghai)?",
    "choices": [
      "~300",
      "~400",
      "~430",
      "~500 km/h"
    ],
    "correct": 2
  },
  {
    "question": "Eurostar serves?",
    "choices": [
      "UK-France-Belgium-NL",
      "UK-Spain",
      "France-Germany",
      "UK-Ireland"
    ],
    "correct": 0
  },
  {
    "question": "Big Boy is a?",
    "choices": [
      "Diesel",
      "Steam loco",
      "Electric",
      "Hybrid"
    ],
    "correct": 1
  },
  {
    "question": "Flying Scotsman class?",
    "choices": [
      "A1/A3 Pacific",
      "A4",
      "Black 5",
      "King"
    ],
    "correct": 0
  },
  {
    "question": "Mallard speed record kph?",
    "choices": [
      "180",
      "200",
      "203",
      "220"
    ],
    "correct": 2
  },
  {
    "question": "Casey Jones was a?",
    "choices": [
      "Pioneer",
      "Engineer (US)",
      "Conductor",
      "Inventor"
    ],
    "correct": 1
  },
  {
    "question": "First underground rail city?",
    "choices": [
      "NYC",
      "London",
      "Paris",
      "Boston"
    ],
    "correct": 1
  },
  {
    "question": "Amtrak founded?",
    "choices": [
      "1965",
      "1971",
      "1976",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "Model trains 'O scale' is?",
    "choices": [
      "1:48",
      "1:87",
      "1:160",
      "1:220"
    ],
    "correct": 0
  },
  {
    "question": "HO scale is?",
    "choices": [
      "1:48",
      "1:87",
      "1:160",
      "1:220"
    ],
    "correct": 1
  },
  {
    "question": "GE/EMD make?",
    "choices": [
      "Steam",
      "Diesel locos",
      "Electric",
      "Maglev"
    ],
    "correct": 1
  },
  {
    "question": "Steam locomotive's piston drives?",
    "choices": [
      "Pulleys",
      "Rods",
      "Cables",
      "Gears"
    ],
    "correct": 1
  },
  {
    "question": "First high-speed rail country?",
    "choices": [
      "France",
      "Japan",
      "Germany",
      "China"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TrainsQuizSettings): TrainsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrainsQuizState, action: TrainsQuizAction): TrainsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrainsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
