import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Formula1QuizSettings { questions: "10" | "20" | "30"; }
export interface Formula1QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Formula1QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First F1 World Championship year?",
    "choices": [
      "1946",
      "1950",
      "1955",
      "1960"
    ],
    "correct": 1
  },
  {
    "question": "First F1 champion?",
    "choices": [
      "Fangio",
      "Farina",
      "Ascari",
      "Hawthorn"
    ],
    "correct": 1
  },
  {
    "question": "Most titles ever (tied)?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 1
  },
  {
    "question": "Schumacher's titles?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Hamilton's titles?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Fangio's titles?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Senna's titles?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "question": "Senna died at?",
    "choices": [
      "Imola",
      "Monza",
      "Suzuka",
      "Spa"
    ],
    "correct": 0
  },
  {
    "question": "Year of Senna's death?",
    "choices": [
      "1990",
      "1992",
      "1994",
      "1996"
    ],
    "correct": 2
  },
  {
    "question": "Most successful constructor?",
    "choices": [
      "Ferrari",
      "Mercedes",
      "McLaren",
      "Williams"
    ],
    "correct": 0
  },
  {
    "question": "Ferrari's home GP?",
    "choices": [
      "Imola",
      "Monza",
      "Mugello",
      "Misano"
    ],
    "correct": 1
  },
  {
    "question": "Monaco GP first held?",
    "choices": [
      "1929",
      "1933",
      "1937",
      "1950"
    ],
    "correct": 0
  },
  {
    "question": "Most pit stops in a single GP (record)?",
    "choices": [
      "3-4",
      "4-5",
      "5-6",
      "Over 6"
    ],
    "correct": 1
  },
  {
    "question": "F1 cars are powered by (currently)?",
    "choices": [
      "V6 Hybrid",
      "V8",
      "V10",
      "Inline 4"
    ],
    "correct": 0
  },
  {
    "question": "DRS stands for?",
    "choices": [
      "Drag Reduction System",
      "Drive Reduction System",
      "Driver Recovery System",
      "Direct Race System"
    ],
    "correct": 0
  },
  {
    "question": "Halo introduced in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "Pole position is?",
    "choices": [
      "1st on grid",
      "Last",
      "Middle",
      "Pit lane"
    ],
    "correct": 0
  },
  {
    "question": "Fastest lap point year?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "Removed 2025"
    ],
    "correct": 1
  },
  {
    "question": "Lewis Hamilton driving for in 2025?",
    "choices": [
      "Mercedes",
      "Ferrari",
      "McLaren",
      "Red Bull"
    ],
    "correct": 1
  },
  {
    "question": "Verstappen 1st title?",
    "choices": [
      "2019",
      "2020",
      "2021",
      "2022"
    ],
    "correct": 2
  },
  {
    "question": "Red Bull's main team principal until 2024?",
    "choices": [
      "Horner",
      "Marko",
      "Wache",
      "Newey"
    ],
    "correct": 0
  },
  {
    "question": "Adrian Newey is famous as?",
    "choices": [
      "Driver",
      "Designer",
      "Owner",
      "Engineer"
    ],
    "correct": 1
  },
  {
    "question": "Most prestigious F1 race?",
    "choices": [
      "British",
      "Monaco",
      "Italian",
      "Japanese"
    ],
    "correct": 1
  },
  {
    "question": "Triple Crown of motorsport: Monaco + ?",
    "choices": [
      "Le Mans + Indy 500",
      "Daytona + Le Mans",
      "Indy + Bathurst",
      "Le Mans + Sebring"
    ],
    "correct": 0
  },
  {
    "question": "F1 car min weight (kg approx)?",
    "choices": [
      "650",
      "700",
      "798",
      "900"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Formula1QuizSettings): Formula1QuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Formula1QuizState, action: Formula1QuizAction): Formula1QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Formula1QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
