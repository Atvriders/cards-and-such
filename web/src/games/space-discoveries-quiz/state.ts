import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpaceDiscoveriesQuizSettings { questions: "10" | "20" | "30"; }
export interface SpaceDiscoveriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpaceDiscoveriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First artificial satellite?",
    "choices": [
      "Explorer 1",
      "Sputnik 1 (1957)",
      "Vanguard",
      "Mariner"
    ],
    "correct": 1
  },
  {
    "question": "First human in space?",
    "choices": [
      "Glenn",
      "Gagarin (1961)",
      "Armstrong",
      "Shepard"
    ],
    "correct": 1
  },
  {
    "question": "First woman in space?",
    "choices": [
      "Ride",
      "Tereshkova (1963)",
      "Lucid",
      "Whitson"
    ],
    "correct": 1
  },
  {
    "question": "First Moon landing was?",
    "choices": [
      "1965",
      "1969",
      "1972",
      "1975"
    ],
    "correct": 1
  },
  {
    "question": "Apollo 11 mission commander?",
    "choices": [
      "Aldrin",
      "Armstrong",
      "Collins",
      "Lovell"
    ],
    "correct": 1
  },
  {
    "question": "Hubble Space Telescope launched?",
    "choices": [
      "1980",
      "1990",
      "2000",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Mars rovers Spirit and Opportunity landed?",
    "choices": [
      "1997",
      "2004",
      "2012",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "James Webb Space Telescope launched?",
    "choices": [
      "2018",
      "2021",
      "2015",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Voyager 1 and 2 launched?",
    "choices": [
      "1970",
      "1977",
      "1985",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "First space station?",
    "choices": [
      "Mir",
      "Salyut 1 (1971)",
      "Skylab",
      "ISS"
    ],
    "correct": 1
  },
  {
    "question": "Pluto was reclassified as a dwarf planet in?",
    "choices": [
      "1990",
      "2006",
      "2015",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Discoverer of cosmic expansion?",
    "choices": [
      "Einstein",
      "Hubble",
      "Lemaitre",
      "Hoyle"
    ],
    "correct": 1
  },
  {
    "question": "First mission to land on a comet?",
    "choices": [
      "Rosetta/Philae (2014)",
      "Stardust",
      "Cassini",
      "Juno"
    ],
    "correct": 0
  },
  {
    "question": "Cassini studied which planet?",
    "choices": [
      "Jupiter",
      "Saturn",
      "Mars",
      "Venus"
    ],
    "correct": 1
  },
  {
    "question": "First images of black hole shadow?",
    "choices": [
      "Hubble 1995",
      "Event Horizon Telescope 2019",
      "JWST 2022",
      "VLA 2010"
    ],
    "correct": 1
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
