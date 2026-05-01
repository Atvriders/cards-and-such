import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface InventorsToolsQuizSettings { questions: "10" | "20" | "30"; }
export interface InventorsToolsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type InventorsToolsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Light bulb is associated with?",
    "choices": [
      "Tesla",
      "Edison",
      "Bell",
      "Marconi"
    ],
    "correct": 1
  },
  {
    "question": "Telephone inventor?",
    "choices": [
      "Edison",
      "Bell",
      "Marconi",
      "Morse"
    ],
    "correct": 1
  },
  {
    "question": "Telephone patented in?",
    "choices": [
      "1856",
      "1876",
      "1896",
      "1916"
    ],
    "correct": 1
  },
  {
    "question": "Phonograph inventor?",
    "choices": [
      "Edison",
      "Bell",
      "Tesla",
      "Marconi"
    ],
    "correct": 0
  },
  {
    "question": "Movable-type printing press?",
    "choices": [
      "Caxton",
      "Gutenberg",
      "Aldus",
      "Franklin"
    ],
    "correct": 1
  },
  {
    "question": "Cotton gin inventor?",
    "choices": [
      "Whitney",
      "Watt",
      "Fulton",
      "Singer"
    ],
    "correct": 0
  },
  {
    "question": "Steam engine improvements by?",
    "choices": [
      "Newcomen",
      "Watt",
      "Stephenson",
      "Trevithick"
    ],
    "correct": 1
  },
  {
    "question": "Sewing machine pioneer?",
    "choices": [
      "Howe",
      "Singer",
      "Whitney",
      "Bell"
    ],
    "correct": 1
  },
  {
    "question": "Dynamite was invented by?",
    "choices": [
      "Nobel",
      "Curie",
      "Faraday",
      "Edison"
    ],
    "correct": 0
  },
  {
    "question": "Vulcanized rubber by?",
    "choices": [
      "Goodyear",
      "Firestone",
      "Dunlop",
      "Edison"
    ],
    "correct": 0
  },
  {
    "question": "Phonograph year of invention?",
    "choices": [
      "1857",
      "1877",
      "1897",
      "1917"
    ],
    "correct": 1
  },
  {
    "question": "Wright Brothers' first flight in?",
    "choices": [
      "1893",
      "1903",
      "1913",
      "1923"
    ],
    "correct": 1
  },
  {
    "question": "Moving assembly line popularized by?",
    "choices": [
      "Edison",
      "Ford",
      "Tesla",
      "Whitney"
    ],
    "correct": 1
  },
  {
    "question": "World Wide Web created by?",
    "choices": [
      "Berners-Lee",
      "Cerf",
      "Kahn",
      "Gates"
    ],
    "correct": 0
  },
  {
    "question": "World Wide Web year?",
    "choices": [
      "1979",
      "1989",
      "1999",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "Personal computer pioneer with Apple I?",
    "choices": [
      "Gates",
      "Jobs and Wozniak",
      "Berners-Lee",
      "Allen"
    ],
    "correct": 1
  },
  {
    "question": "Microsoft co-founded by?",
    "choices": [
      "Jobs",
      "Gates and Allen",
      "Wozniak",
      "Cerf"
    ],
    "correct": 1
  },
  {
    "question": "First practical incandescent bulb year?",
    "choices": [
      "1859",
      "1879",
      "1899",
      "1919"
    ],
    "correct": 1
  },
  {
    "question": "Edison's Menlo Park lab opened in?",
    "choices": [
      "1856",
      "1876",
      "1896",
      "1906"
    ],
    "correct": 1
  },
  {
    "question": "Whitney's cotton gin year?",
    "choices": [
      "1773",
      "1793",
      "1813",
      "1833"
    ],
    "correct": 1
  },
  {
    "question": "Eli Whitney was American or British?",
    "choices": [
      "British",
      "American",
      "French",
      "German"
    ],
    "correct": 1
  },
  {
    "question": "James Watt nationality?",
    "choices": [
      "English",
      "Scottish",
      "Welsh",
      "Irish"
    ],
    "correct": 1
  },
  {
    "question": "Nikola Tesla nationality of birth?",
    "choices": [
      "Hungarian",
      "Serbian",
      "Italian",
      "Czech"
    ],
    "correct": 1
  },
  {
    "question": "First powered airplane was named?",
    "choices": [
      "Spirit",
      "Flyer",
      "Eagle",
      "Wright"
    ],
    "correct": 1
  },
  {
    "question": "Edison held how many US patents (approx)?",
    "choices": [
      "100",
      "500",
      "1000+",
      "5000"
    ],
    "correct": 2
  },
  {
    "question": "Singer is best known for?",
    "choices": [
      "Sewing machine",
      "Telegraph",
      "Telephone",
      "Lightbulb"
    ],
    "correct": 0
  },
  {
    "question": "Tesla is famous for AC?",
    "choices": [
      "Motor and transformer",
      "Battery",
      "Telephone",
      "Photograph"
    ],
    "correct": 0
  },
  {
    "question": "Telegraph code is named after?",
    "choices": [
      "Bell",
      "Morse",
      "Marconi",
      "Edison"
    ],
    "correct": 1
  },
  {
    "question": "Logarithms tables associated with?",
    "choices": [
      "Napier",
      "Newton",
      "Pascal",
      "Leibniz"
    ],
    "correct": 0
  },
  {
    "question": "Mechanical computing pioneer?",
    "choices": [
      "Babbage",
      "Lovelace",
      "Turing",
      "Zuse"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: InventorsToolsQuizSettings): InventorsToolsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: InventorsToolsQuizState, action: InventorsToolsQuizAction): InventorsToolsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: InventorsToolsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
