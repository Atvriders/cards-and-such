import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChernobylQuizSettings { questions: "10" | "20" | "30"; }
export interface ChernobylQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChernobylQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In what year was the Chernobyl disaster?",
    "choices": [
      "1984",
      "1985",
      "1986",
      "1987"
    ],
    "correct": 2
  },
  {
    "question": "Which reactor exploded?",
    "choices": [
      "Reactor 1",
      "Reactor 2",
      "Reactor 3",
      "Reactor 4"
    ],
    "correct": 3
  },
  {
    "question": "What was the reactor type?",
    "choices": [
      "PWR",
      "BWR",
      "RBMK",
      "CANDU"
    ],
    "correct": 2
  },
  {
    "question": "Date of the explosion?",
    "choices": [
      "April 6, 1986",
      "April 26, 1986",
      "May 6, 1986",
      "June 26, 1986"
    ],
    "correct": 1
  },
  {
    "question": "Nearby city evacuated?",
    "choices": [
      "Kiev",
      "Pripyat",
      "Minsk",
      "Slavutych"
    ],
    "correct": 1
  },
  {
    "question": "Country (at the time)?",
    "choices": [
      "Russia",
      "Ukraine",
      "Soviet Union",
      "Belarus"
    ],
    "correct": 2
  },
  {
    "question": "Modern Exclusion Zone radius?",
    "choices": [
      "10 km",
      "20 km",
      "30 km",
      "50 km"
    ],
    "correct": 2
  },
  {
    "question": "What is the 'sarcophagus'?",
    "choices": [
      "A monument",
      "Concrete shelter over reactor 4",
      "A tomb",
      "A reactor name"
    ],
    "correct": 1
  },
  {
    "question": "Replacement structure (2016)?",
    "choices": [
      "Megatomb",
      "New Safe Confinement",
      "Steel Dome",
      "Cherno-Cap"
    ],
    "correct": 1
  },
  {
    "question": "Test that triggered the disaster aimed to?",
    "choices": [
      "Test cooling pumps in blackout",
      "Test new fuel rods",
      "Test reactor power output",
      "Test alarm systems"
    ],
    "correct": 0
  },
  {
    "question": "Number of immediate deaths?",
    "choices": [
      "2",
      "31",
      "100",
      "500"
    ],
    "correct": 1
  },
  {
    "question": "Element famously detected in Sweden?",
    "choices": [
      "Uranium",
      "Plutonium",
      "Cesium-137",
      "Radon"
    ],
    "correct": 2
  },
  {
    "question": "Workers who cleaned up the site were called?",
    "choices": [
      "Liquidators",
      "Cleansers",
      "Veterans",
      "Bio-suits"
    ],
    "correct": 0
  },
  {
    "question": "USSR leader at the time?",
    "choices": [
      "Brezhnev",
      "Andropov",
      "Chernenko",
      "Gorbachev"
    ],
    "correct": 3
  },
  {
    "question": "Chernobyl power plant was located near?",
    "choices": [
      "Dnieper River",
      "Pripyat River",
      "Volga River",
      "Don River"
    ],
    "correct": 1
  },
  {
    "question": "Famous miniseries about Chernobyl was on which network?",
    "choices": [
      "Netflix",
      "HBO",
      "Amazon",
      "BBC"
    ],
    "correct": 1
  },
  {
    "question": "How many reactors were operating at the plant?",
    "choices": [
      "2",
      "3",
      "4",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Released radioactivity equaled approximately how many Hiroshima bombs?",
    "choices": [
      "10",
      "100",
      "400",
      "1000"
    ],
    "correct": 2
  },
  {
    "question": "First country to detect the cloud?",
    "choices": [
      "Norway",
      "Sweden",
      "Finland",
      "Poland"
    ],
    "correct": 1
  },
  {
    "question": "Last Chernobyl reactor closed in?",
    "choices": [
      "1995",
      "2000",
      "2005",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "In what year did the Chernobyl disaster occur?",
    "choices": [
      "1984",
      "1985",
      "1986",
      "1987"
    ],
    "correct": 2
  },
  {
    "question": "Which reactor exploded?",
    "choices": [
      "Reactor 1",
      "Reactor 2",
      "Reactor 3",
      "Reactor 4"
    ],
    "correct": 3
  },
  {
    "question": "On what date did the explosion happen?",
    "choices": [
      "April 22, 1986",
      "April 26, 1986",
      "May 1, 1986",
      "May 6, 1986"
    ],
    "correct": 1
  },
  {
    "question": "What type of reactor was it?",
    "choices": [
      "PWR",
      "BWR",
      "RBMK",
      "CANDU"
    ],
    "correct": 2
  },
  {
    "question": "Which town was evacuated near the plant?",
    "choices": [
      "Pripyat",
      "Kiev",
      "Minsk",
      "Gomel"
    ],
    "correct": 0
  },
  {
    "question": "Who was the General Secretary at the time?",
    "choices": [
      "Brezhnev",
      "Andropov",
      "Chernenko",
      "Gorbachev"
    ],
    "correct": 3
  },
  {
    "question": "What was the test that triggered the disaster about?",
    "choices": [
      "Cooling pump",
      "Turbine coast-down",
      "Control rod",
      "Fuel rod"
    ],
    "correct": 1
  },
  {
    "question": "The exclusion zone covers roughly?",
    "choices": [
      "1,000 km²",
      "2,600 km²",
      "5,000 km²",
      "10,000 km²"
    ],
    "correct": 1
  },
  {
    "question": "The 'sarcophagus' was completed in?",
    "choices": [
      "1986",
      "1987",
      "1988",
      "1990"
    ],
    "correct": 0
  },
  {
    "question": "New Safe Confinement was completed in?",
    "choices": [
      "2010",
      "2014",
      "2016",
      "2020"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChernobylQuizSettings): ChernobylQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChernobylQuizState, action: ChernobylQuizAction): ChernobylQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChernobylQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
