import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PolarQuizSettings { questions: "10" | "20" | "30"; }
export interface PolarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PolarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who reached the South Pole first?",
    "choices": [
      "Scott",
      "Amundsen",
      "Shackleton",
      "Byrd"
    ],
    "correct": 1
  },
  {
    "question": "Year of first South Pole reach?",
    "choices": [
      "1909",
      "1911",
      "1913",
      "1915"
    ],
    "correct": 1
  },
  {
    "question": "Amundsen was from?",
    "choices": [
      "Sweden",
      "Norway",
      "Denmark",
      "Iceland"
    ],
    "correct": 1
  },
  {
    "question": "Scott's expedition ship?",
    "choices": [
      "Endurance",
      "Discovery",
      "Terra Nova",
      "Fram"
    ],
    "correct": 2
  },
  {
    "question": "Amundsen's ship?",
    "choices": [
      "Fram",
      "Maud",
      "Belgica",
      "Gjøa"
    ],
    "correct": 0
  },
  {
    "question": "Shackleton's famous ship?",
    "choices": [
      "Endurance",
      "Discovery",
      "Quest",
      "Nimrod"
    ],
    "correct": 0
  },
  {
    "question": "Year Endurance was crushed by ice?",
    "choices": [
      "1912",
      "1915",
      "1918",
      "1922"
    ],
    "correct": 1
  },
  {
    "question": "Year Endurance wreck was found?",
    "choices": [
      "2010",
      "2015",
      "2022",
      "2024"
    ],
    "correct": 2
  },
  {
    "question": "Who claimed first to North Pole (1909)?",
    "choices": [
      "Cook",
      "Peary",
      "Both",
      "Amundsen"
    ],
    "correct": 2
  },
  {
    "question": "Scott died on the way back from the Pole in?",
    "choices": [
      "1911",
      "1912",
      "1913",
      "1914"
    ],
    "correct": 1
  },
  {
    "question": "Cause of Scott's deaths?",
    "choices": [
      "Avalanche",
      "Cold/starvation",
      "Crevasse",
      "Mutiny"
    ],
    "correct": 1
  },
  {
    "question": "Amundsen relied on?",
    "choices": [
      "Ponies",
      "Dogs",
      "Tractors",
      "Skis only"
    ],
    "correct": 1
  },
  {
    "question": "Scott relied largely on?",
    "choices": [
      "Dogs",
      "Tractors and ponies",
      "Aircraft",
      "Snowmobiles"
    ],
    "correct": 1
  },
  {
    "question": "Northwest Passage first traversed by?",
    "choices": [
      "Cook",
      "Amundsen",
      "Franklin",
      "Hudson"
    ],
    "correct": 1
  },
  {
    "question": "Lost expedition leader (1845)?",
    "choices": [
      "Franklin",
      "Frobisher",
      "Davis",
      "Ross"
    ],
    "correct": 0
  },
  {
    "question": "Continent under Antarctic Treaty?",
    "choices": [
      "Yes",
      "No",
      "Partial",
      "Disputed"
    ],
    "correct": 0
  },
  {
    "question": "South Pole permanent station?",
    "choices": [
      "Amundsen-Scott",
      "Vostok",
      "McMurdo",
      "Mawson"
    ],
    "correct": 0
  },
  {
    "question": "Coldest temperature recorded on Earth?",
    "choices": [
      "-50°C",
      "-89°C",
      "-100°C",
      "-120°C"
    ],
    "correct": 1
  },
  {
    "question": "First woman to solo across Antarctica?",
    "choices": [
      "Felicity Aston",
      "Liv Arnesen",
      "Ann Bancroft",
      "Reinhold"
    ],
    "correct": 0
  },
  {
    "question": "Antarctic Treaty year?",
    "choices": [
      "1949",
      "1959",
      "1969",
      "1979"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PolarQuizSettings): PolarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PolarQuizState, action: PolarQuizAction): PolarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PolarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
