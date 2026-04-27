import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpaceVehiclesQuizSettings { questions: "10" | "20" | "30"; }
export interface SpaceVehiclesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpaceVehiclesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First satellite year?",
    "choices": [
      "1955",
      "1957",
      "1961",
      "1965"
    ],
    "correct": 1
  },
  {
    "question": "Sputnik 1 launched by?",
    "choices": [
      "USA",
      "USSR",
      "China",
      "France"
    ],
    "correct": 1
  },
  {
    "question": "First man in space?",
    "choices": [
      "Glenn",
      "Gagarin",
      "Shepard",
      "Armstrong"
    ],
    "correct": 1
  },
  {
    "question": "Year of Gagarin's flight?",
    "choices": [
      "1958",
      "1961",
      "1965",
      "1969"
    ],
    "correct": 1
  },
  {
    "question": "Apollo 11 landed on Moon?",
    "choices": [
      "1968",
      "1969",
      "1970",
      "1971"
    ],
    "correct": 1
  },
  {
    "question": "First Moon-walker?",
    "choices": [
      "Aldrin",
      "Armstrong",
      "Collins",
      "Cernan"
    ],
    "correct": 1
  },
  {
    "question": "Saturn V was made by?",
    "choices": [
      "NASA + Boeing/Douglas/N. American",
      "SpaceX",
      "Lockheed",
      "Soviet"
    ],
    "correct": 0
  },
  {
    "question": "Space Shuttle first flew?",
    "choices": [
      "1979",
      "1981",
      "1985",
      "1988"
    ],
    "correct": 1
  },
  {
    "question": "Shuttle program ended?",
    "choices": [
      "2008",
      "2011",
      "2014",
      "2018"
    ],
    "correct": 1
  },
  {
    "question": "Number of Shuttles built?",
    "choices": [
      "3",
      "5",
      "6",
      "7"
    ],
    "correct": 2
  },
  {
    "question": "Challenger disaster year?",
    "choices": [
      "1984",
      "1986",
      "1990",
      "1993"
    ],
    "correct": 1
  },
  {
    "question": "Columbia disaster year?",
    "choices": [
      "1999",
      "2001",
      "2003",
      "2005"
    ],
    "correct": 2
  },
  {
    "question": "Hubble Space Telescope launched?",
    "choices": [
      "1985",
      "1990",
      "1995",
      "2000"
    ],
    "correct": 1
  },
  {
    "question": "ISS first module year?",
    "choices": [
      "1995",
      "1998",
      "2001",
      "2003"
    ],
    "correct": 1
  },
  {
    "question": "ISS first module name?",
    "choices": [
      "Unity",
      "Zarya",
      "Destiny",
      "Zvezda"
    ],
    "correct": 1
  },
  {
    "question": "SpaceX founded?",
    "choices": [
      "2000",
      "2002",
      "2005",
      "2008"
    ],
    "correct": 1
  },
  {
    "question": "First reusable orbital booster (landed)?",
    "choices": [
      "Atlas V",
      "Falcon 9",
      "Falcon Heavy",
      "Starship"
    ],
    "correct": 1
  },
  {
    "question": "Falcon 9 first booster landing year?",
    "choices": [
      "2014",
      "2015",
      "2016",
      "2018"
    ],
    "correct": 1
  },
  {
    "question": "Mars rover Curiosity landed?",
    "choices": [
      "2008",
      "2010",
      "2012",
      "2014"
    ],
    "correct": 2
  },
  {
    "question": "Mars rover Perseverance landed?",
    "choices": [
      "2018",
      "2020",
      "2021",
      "2023"
    ],
    "correct": 2
  },
  {
    "question": "Voyager 1 launched?",
    "choices": [
      "1972",
      "1977",
      "1981",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "Voyager 1 entered interstellar space?",
    "choices": [
      "2010",
      "2012",
      "2015",
      "2018"
    ],
    "correct": 1
  },
  {
    "question": "First space station?",
    "choices": [
      "Skylab",
      "Salyut 1",
      "Mir",
      "ISS"
    ],
    "correct": 1
  },
  {
    "question": "Mir operated until?",
    "choices": [
      "1995",
      "2001",
      "2003",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Artemis I uncrewed flew in?",
    "choices": [
      "2020",
      "2022",
      "2023",
      "2024"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpaceVehiclesQuizSettings): SpaceVehiclesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpaceVehiclesQuizState, action: SpaceVehiclesQuizAction): SpaceVehiclesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpaceVehiclesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
