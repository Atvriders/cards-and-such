import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NapoleonicWarsQuizSettings { questions: "10" | "20" | "30"; }
export interface NapoleonicWarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NapoleonicWarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Battle of Waterloo year?",
    "choices": [
      "1812",
      "1814",
      "1815",
      "1820"
    ],
    "correct": 2
  },
  {
    "question": "Wellington commanded which army?",
    "choices": [
      "French",
      "Anglo-Allied",
      "Prussian",
      "Russian"
    ],
    "correct": 1
  },
  {
    "question": "Napoleon's first exile was to?",
    "choices": [
      "St. Helena",
      "Elba",
      "Corsica",
      "Sicily"
    ],
    "correct": 1
  },
  {
    "question": "Battle of Austerlitz year?",
    "choices": [
      "1805",
      "1807",
      "1809",
      "1812"
    ],
    "correct": 0
  },
  {
    "question": "French invasion of Russia occurred in?",
    "choices": [
      "1810",
      "1812",
      "1814",
      "1815"
    ],
    "correct": 1
  },
  {
    "question": "Napoleon was crowned Emperor in?",
    "choices": [
      "1799",
      "1802",
      "1804",
      "1806"
    ],
    "correct": 2
  },
  {
    "question": "Battle of Trafalgar was a victory for?",
    "choices": [
      "France",
      "Britain",
      "Spain",
      "Russia"
    ],
    "correct": 1
  },
  {
    "question": "Who led the British navy at Trafalgar?",
    "choices": [
      "Wellington",
      "Nelson",
      "Churchill",
      "Rodney"
    ],
    "correct": 1
  },
  {
    "question": "Napoleon's final exile was to?",
    "choices": [
      "Elba",
      "Corsica",
      "St. Helena",
      "Malta"
    ],
    "correct": 2
  },
  {
    "question": "Who was Tsar during the Russian Campaign?",
    "choices": [
      "Peter the Great",
      "Nicholas I",
      "Alexander I",
      "Nicholas II"
    ],
    "correct": 2
  },
  {
    "question": "Battle of Borodino fought near?",
    "choices": [
      "Paris",
      "Moscow",
      "Berlin",
      "Vienna"
    ],
    "correct": 1
  },
  {
    "question": "Battle of Leipzig (1813) was also called the?",
    "choices": [
      "Battle of the Nations",
      "Battle of Three Emperors",
      "Battle of the Spurs",
      "Battle of the Marne"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NapoleonicWarsQuizSettings): NapoleonicWarsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NapoleonicWarsQuizState, action: NapoleonicWarsQuizAction): NapoleonicWarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NapoleonicWarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
