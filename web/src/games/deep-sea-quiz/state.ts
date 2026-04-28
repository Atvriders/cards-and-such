import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DeepSeaQuizSettings { questions: "10" | "20" | "30"; }
export interface DeepSeaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DeepSeaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Deepest known place on Earth?",
    "choices": [
      "Java Trench",
      "Mariana Trench",
      "Puerto Rico Trench",
      "Tonga Trench"
    ],
    "correct": 1
  },
  {
    "question": "Specific deepest point?",
    "choices": [
      "Sirena Deep",
      "Challenger Deep",
      "Horizon Deep",
      "Galathea Deep"
    ],
    "correct": 1
  },
  {
    "question": "Approximate Challenger Deep depth?",
    "choices": [
      "~4,000 m",
      "~7,000 m",
      "~11,000 m",
      "~15,000 m"
    ],
    "correct": 2
  },
  {
    "question": "First manned dive there year?",
    "choices": [
      "1950",
      "1960",
      "1970",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "Vessel used in 1960?",
    "choices": [
      "Trieste",
      "Alvin",
      "Nautile",
      "Mir"
    ],
    "correct": 0
  },
  {
    "question": "Pilots in 1960 dive?",
    "choices": [
      "Walsh & Piccard",
      "Cousteau & Calypso",
      "Cameron & Ballard",
      "Diehl & Wilson"
    ],
    "correct": 0
  },
  {
    "question": "James Cameron's solo dive year?",
    "choices": [
      "2010",
      "2012",
      "2014",
      "2016"
    ],
    "correct": 1
  },
  {
    "question": "Cameron's vessel?",
    "choices": [
      "Deepsea Challenger",
      "Trieste II",
      "Limiting Factor",
      "Alvin"
    ],
    "correct": 0
  },
  {
    "question": "Pressure at Challenger Deep?",
    "choices": [
      "~100 atm",
      "~1100 atm",
      "~10,000 atm",
      "~100,000 atm"
    ],
    "correct": 1
  },
  {
    "question": "Ballard discovered Titanic in?",
    "choices": [
      "1975",
      "1985",
      "1995",
      "2005"
    ],
    "correct": 1
  },
  {
    "question": "Ballard's later find?",
    "choices": [
      "Bismarck",
      "Yamato",
      "HMS Hood",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "Famous deep-sea submersible (USA)?",
    "choices": [
      "Alvin",
      "Mir",
      "Nautile",
      "Shinkai"
    ],
    "correct": 0
  },
  {
    "question": "Russian deep submersible?",
    "choices": [
      "Mir",
      "Nautile",
      "Alvin",
      "Pisces"
    ],
    "correct": 0
  },
  {
    "question": "Hydrothermal vents discovered in?",
    "choices": [
      "1957",
      "1977",
      "1997",
      "2007"
    ],
    "correct": 1
  },
  {
    "question": "Energy at vents from?",
    "choices": [
      "Sunlight",
      "Chemosynthesis",
      "Geothermal heat",
      "Tides"
    ],
    "correct": 1
  },
  {
    "question": "Vent communities feature giant?",
    "choices": [
      "Tubeworms",
      "Octopus",
      "Squid",
      "Coral"
    ],
    "correct": 0
  },
  {
    "question": "Giant squid first photographed live in?",
    "choices": [
      "1990",
      "2004",
      "2010",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Ocean depth zones — abyssal is up to?",
    "choices": [
      "~4,000 m",
      "~6,000 m",
      "~10,000 m",
      "~15,000 m"
    ],
    "correct": 1
  },
  {
    "question": "Hadal zone starts at?",
    "choices": [
      "~3,000 m",
      "~6,000 m",
      "~9,000 m",
      "~12,000 m"
    ],
    "correct": 1
  },
  {
    "question": "Marianas is in which ocean?",
    "choices": [
      "Atlantic",
      "Pacific",
      "Indian",
      "Arctic"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DeepSeaQuizSettings): DeepSeaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DeepSeaQuizState, action: DeepSeaQuizAction): DeepSeaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DeepSeaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
