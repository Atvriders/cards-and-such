import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpaceDiscoveriesQuizSettings { questions: "10" | "20" | "30"; }
export interface SpaceDiscoveriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpaceDiscoveriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First artificial satellite?",
    "choices": [
      "Sputnik 1",
      "Explorer 1",
      "Vostok 1",
      "Apollo 1"
    ],
    "correct": 0
  },
  {
    "question": "Sputnik 1 launched in?",
    "choices": [
      "1947",
      "1957",
      "1967",
      "1977"
    ],
    "correct": 1
  },
  {
    "question": "First human in space?",
    "choices": [
      "Glenn",
      "Gagarin",
      "Armstrong",
      "Shepard"
    ],
    "correct": 1
  },
  {
    "question": "Yuri Gagarin orbited Earth in?",
    "choices": [
      "1959",
      "1961",
      "1963",
      "1965"
    ],
    "correct": 1
  },
  {
    "question": "First American in orbit?",
    "choices": [
      "Shepard",
      "Glenn",
      "Armstrong",
      "Aldrin"
    ],
    "correct": 1
  },
  {
    "question": "First Moon landing year?",
    "choices": [
      "1959",
      "1969",
      "1979",
      "1989"
    ],
    "correct": 1
  },
  {
    "question": "Apollo 11 commander?",
    "choices": [
      "Aldrin",
      "Armstrong",
      "Collins",
      "Glenn"
    ],
    "correct": 1
  },
  {
    "question": "First woman in space?",
    "choices": [
      "Ride",
      "Tereshkova",
      "Savitskaya",
      "Jemison"
    ],
    "correct": 1
  },
  {
    "question": "Hubble Space Telescope launched in?",
    "choices": [
      "1980",
      "1990",
      "2000",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Voyager 1 launched in?",
    "choices": [
      "1967",
      "1977",
      "1987",
      "1997"
    ],
    "correct": 1
  },
  {
    "question": "First rover on Mars?",
    "choices": [
      "Sojourner",
      "Spirit",
      "Opportunity",
      "Curiosity"
    ],
    "correct": 0
  },
  {
    "question": "Sojourner reached Mars in?",
    "choices": [
      "1987",
      "1997",
      "2007",
      "2017"
    ],
    "correct": 1
  },
  {
    "question": "International Space Station first module?",
    "choices": [
      "Zarya",
      "Unity",
      "Zvezda",
      "Destiny"
    ],
    "correct": 0
  },
  {
    "question": "ISS first module launched in?",
    "choices": [
      "1988",
      "1998",
      "2008",
      "2018"
    ],
    "correct": 1
  },
  {
    "question": "Pluto discovered by?",
    "choices": [
      "Tombaugh",
      "Lowell",
      "Hubble",
      "Galileo"
    ],
    "correct": 0
  },
  {
    "question": "Pluto discovered in?",
    "choices": [
      "1910",
      "1930",
      "1950",
      "1970"
    ],
    "correct": 1
  },
  {
    "question": "Galileo first observed moons of?",
    "choices": [
      "Mars",
      "Jupiter",
      "Saturn",
      "Venus"
    ],
    "correct": 1
  },
  {
    "question": "Rings of Saturn first described by?",
    "choices": [
      "Galileo",
      "Huygens",
      "Cassini",
      "Newton"
    ],
    "correct": 1
  },
  {
    "question": "Cosmic microwave background discovered by?",
    "choices": [
      "Penzias and Wilson",
      "Hubble",
      "Hawking",
      "Lemaitre"
    ],
    "correct": 0
  },
  {
    "question": "Expanding universe shown by?",
    "choices": [
      "Einstein",
      "Hubble",
      "Lemaitre",
      "Hawking"
    ],
    "correct": 1
  },
  {
    "question": "First spacewalk performed by?",
    "choices": [
      "White",
      "Leonov",
      "Gagarin",
      "Glenn"
    ],
    "correct": 1
  },
  {
    "question": "Mariner 4 first flew by?",
    "choices": [
      "Venus",
      "Mars",
      "Mercury",
      "Jupiter"
    ],
    "correct": 1
  },
  {
    "question": "First probe on Venus surface?",
    "choices": [
      "Venera 7",
      "Mariner 2",
      "Pioneer",
      "Magellan"
    ],
    "correct": 0
  },
  {
    "question": "Viking 1 landed on Mars in?",
    "choices": [
      "1966",
      "1976",
      "1986",
      "1996"
    ],
    "correct": 1
  },
  {
    "question": "Cassini orbited which planet?",
    "choices": [
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune"
    ],
    "correct": 1
  },
  {
    "question": "New Horizons flew by Pluto in?",
    "choices": [
      "2005",
      "2010",
      "2015",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "First space station?",
    "choices": [
      "Mir",
      "Salyut 1",
      "Skylab",
      "ISS"
    ],
    "correct": 1
  },
  {
    "question": "James Webb Space Telescope launched in?",
    "choices": [
      "2011",
      "2016",
      "2021",
      "2024"
    ],
    "correct": 2
  },
  {
    "question": "First exoplanet around a Sun-like star found in?",
    "choices": [
      "1985",
      "1995",
      "2005",
      "2015"
    ],
    "correct": 1
  },
  {
    "question": "Black hole image first released in?",
    "choices": [
      "2009",
      "2014",
      "2019",
      "2024"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpaceDiscoveriesQuizSettings): SpaceDiscoveriesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpaceDiscoveriesQuizState, action: SpaceDiscoveriesQuizAction): SpaceDiscoveriesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpaceDiscoveriesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
