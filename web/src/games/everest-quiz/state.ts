import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EverestQuizSettings { questions: "10" | "20" | "30"; }
export interface EverestQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EverestQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Height of Everest (approximate)?",
    "choices": [
      "8,000 m",
      "8,849 m",
      "9,000 m",
      "9,500 m"
    ],
    "correct": 1
  },
  {
    "question": "Mountain range?",
    "choices": [
      "Andes",
      "Alps",
      "Himalayas",
      "Karakoram"
    ],
    "correct": 2
  },
  {
    "question": "Two countries on Everest?",
    "choices": [
      "Nepal & India",
      "Nepal & China",
      "Pakistan & China",
      "Nepal & Bhutan"
    ],
    "correct": 1
  },
  {
    "question": "First confirmed summit (year)?",
    "choices": [
      "1924",
      "1953",
      "1963",
      "1975"
    ],
    "correct": 1
  },
  {
    "question": "First climber to summit?",
    "choices": [
      "Mallory",
      "Hillary",
      "Messner",
      "Norgay"
    ],
    "correct": 1
  },
  {
    "question": "Edmund Hillary nationality?",
    "choices": [
      "British",
      "Australian",
      "New Zealand",
      "South African"
    ],
    "correct": 2
  },
  {
    "question": "His partner Sherpa?",
    "choices": [
      "Tenzing Norgay",
      "Apa Sherpa",
      "Pemba",
      "Kami"
    ],
    "correct": 0
  },
  {
    "question": "Climber who disappeared in 1924?",
    "choices": [
      "George Mallory",
      "Andrew Irvine",
      "Both",
      "Neither"
    ],
    "correct": 2
  },
  {
    "question": "First solo without supplemental oxygen?",
    "choices": [
      "Messner",
      "Habeler",
      "Steck",
      "Bonington"
    ],
    "correct": 0
  },
  {
    "question": "Year of that solo?",
    "choices": [
      "1978",
      "1980",
      "1985",
      "1990"
    ],
    "correct": 1
  },
  {
    "question": "Standard route from Nepal goes via?",
    "choices": [
      "South Col",
      "North Ridge",
      "Western Cwm only",
      "East Face"
    ],
    "correct": 0
  },
  {
    "question": "Death Zone starts above?",
    "choices": [
      "6,000 m",
      "7,000 m",
      "8,000 m",
      "9,000 m"
    ],
    "correct": 2
  },
  {
    "question": "Famous icefall on the Nepal side?",
    "choices": [
      "Everest",
      "Khumbu",
      "Lhotse",
      "Hillary"
    ],
    "correct": 1
  },
  {
    "question": "Year of the disaster Krakauer wrote about?",
    "choices": [
      "1992",
      "1996",
      "2000",
      "2004"
    ],
    "correct": 1
  },
  {
    "question": "Krakauer's book?",
    "choices": [
      "Into Thin Air",
      "Into the Wild",
      "Beyond Everest",
      "Where to die"
    ],
    "correct": 0
  },
  {
    "question": "Hillary Step is on which route?",
    "choices": [
      "South Col",
      "North",
      "West Ridge",
      "Kangshung"
    ],
    "correct": 0
  },
  {
    "question": "Major earthquake that hit Everest in 2015?",
    "choices": [
      "Nepal",
      "India",
      "China",
      "Pakistan"
    ],
    "correct": 0
  },
  {
    "question": "Most summits by one person (record)?",
    "choices": [
      "18+",
      "20",
      "26+",
      "30+"
    ],
    "correct": 2
  },
  {
    "question": "Holder of most summit record?",
    "choices": [
      "Apa Sherpa",
      "Kami Rita",
      "Reinhold Messner",
      "Conrad Anker"
    ],
    "correct": 1
  },
  {
    "question": "Annual death rate %?",
    "choices": [
      "~1%",
      "~3%",
      "~10%",
      "~15%"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EverestQuizSettings): EverestQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EverestQuizState, action: EverestQuizAction): EverestQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EverestQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
