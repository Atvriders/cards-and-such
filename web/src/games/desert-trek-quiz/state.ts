import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DesertTrekQuizSettings { questions: "10" | "20" | "30"; }
export interface DesertTrekQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DesertTrekQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Largest hot desert on Earth?",
    "choices": [
      "Sahara",
      "Gobi",
      "Atacama",
      "Kalahari"
    ],
    "correct": 0
  },
  {
    "question": "Sahara is on which continent?",
    "choices": [
      "Asia",
      "Africa",
      "Australia",
      "Americas"
    ],
    "correct": 1
  },
  {
    "question": "Driest desert on Earth?",
    "choices": [
      "Sahara",
      "Atacama",
      "Gobi",
      "Mojave"
    ],
    "correct": 1
  },
  {
    "question": "Atacama is in?",
    "choices": [
      "Argentina",
      "Chile",
      "Peru",
      "Bolivia"
    ],
    "correct": 1
  },
  {
    "question": "Empty Quarter is in?",
    "choices": [
      "Sahara",
      "Arabia",
      "Asia",
      "Mexico"
    ],
    "correct": 1
  },
  {
    "question": "Wilfred Thesiger explored?",
    "choices": [
      "Empty Quarter",
      "Sahara",
      "Gobi",
      "Outback"
    ],
    "correct": 0
  },
  {
    "question": "Burke and Wills crossed which desert?",
    "choices": [
      "Sahara",
      "Australian Outback",
      "Gobi",
      "Kalahari"
    ],
    "correct": 1
  },
  {
    "question": "Burke and Wills journey year?",
    "choices": [
      "1860",
      "1880",
      "1900",
      "1920"
    ],
    "correct": 0
  },
  {
    "question": "First crossing of Empty Quarter?",
    "choices": [
      "Thomas/Philby",
      "Lawrence",
      "Burton",
      "Speke"
    ],
    "correct": 0
  },
  {
    "question": "Year of that crossing?",
    "choices": [
      "1910",
      "1930-31",
      "1950",
      "1970"
    ],
    "correct": 1
  },
  {
    "question": "Largest cold desert?",
    "choices": [
      "Antarctica",
      "Sahara",
      "Gobi",
      "Atacama"
    ],
    "correct": 0
  },
  {
    "question": "Animals best for Sahara crossing?",
    "choices": [
      "Horse",
      "Donkey",
      "Camel",
      "Llama"
    ],
    "correct": 2
  },
  {
    "question": "Robyn Davidson crossed?",
    "choices": [
      "Sahara",
      "Australian outback",
      "Gobi",
      "Sahel"
    ],
    "correct": 1
  },
  {
    "question": "Tracks (1980 book) author?",
    "choices": [
      "Davidson",
      "Thesiger",
      "Eric Newby",
      "Kapuscinski"
    ],
    "correct": 0
  },
  {
    "question": "Salt road across Sahara was for?",
    "choices": [
      "Sodium chloride trade",
      "Gold trade",
      "Slaves",
      "All of the above"
    ],
    "correct": 3
  },
  {
    "question": "Tuareg are nomads of?",
    "choices": [
      "Gobi",
      "Sahara",
      "Atacama",
      "Outback"
    ],
    "correct": 1
  },
  {
    "question": "Bedouin live in?",
    "choices": [
      "Arabia",
      "Mongolia",
      "Argentina",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "Word 'oasis' means?",
    "choices": [
      "Spring/wet area",
      "Mountain",
      "Cold",
      "Wind"
    ],
    "correct": 0
  },
  {
    "question": "Largest sand sea on Earth?",
    "choices": [
      "Empty Quarter",
      "Sahara erg",
      "Taklamakan",
      "Namib"
    ],
    "correct": 0
  },
  {
    "question": "Marathon des Sables is in?",
    "choices": [
      "Sahara",
      "Gobi",
      "Atacama",
      "Mojave"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DesertTrekQuizSettings): DesertTrekQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DesertTrekQuizState, action: DesertTrekQuizAction): DesertTrekQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DesertTrekQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
