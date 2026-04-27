import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TokyoQuizSettings { questions: "10" | "20"; }
export interface TokyoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TokyoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tokyo's most famous crossing is?",
    "choices": [
      "Shibuya",
      "Ginza",
      "Akihabara",
      "Roppongi"
    ],
    "correct": 0
  },
  {
    "question": "The Imperial Palace is in which district?",
    "choices": [
      "Chiyoda",
      "Shinjuku",
      "Minato",
      "Taito"
    ],
    "correct": 0
  },
  {
    "question": "The tallest tower in Tokyo is?",
    "choices": [
      "Tokyo Tower",
      "Tokyo Skytree",
      "Roppongi Hills",
      "Sunshine 60"
    ],
    "correct": 1
  },
  {
    "question": "Akihabara is known for?",
    "choices": [
      "fashion",
      "electronics & anime",
      "financial district",
      "fish market"
    ],
    "correct": 1
  },
  {
    "question": "Tsukiji is famous for the?",
    "choices": [
      "zoo",
      "former fish market",
      "stadium",
      "castle"
    ],
    "correct": 1
  },
  {
    "question": "Tokyo's metro system is one of the?",
    "choices": [
      "smallest",
      "newest only",
      "busiest in the world",
      "slowest"
    ],
    "correct": 2
  },
  {
    "question": "Harajuku is known for?",
    "choices": [
      "sumo",
      "youth fashion",
      "banking",
      "temples"
    ],
    "correct": 1
  },
  {
    "question": "Tokyo was previously known as?",
    "choices": [
      "Kyoto",
      "Edo",
      "Osaka",
      "Nagoya"
    ],
    "correct": 1
  },
  {
    "question": "Shinjuku Station is famous as?",
    "choices": [
      "the smallest",
      "the busiest in the world",
      "the oldest",
      "abandoned"
    ],
    "correct": 1
  },
  {
    "question": "Tokyo Tower was built in?",
    "choices": [
      "1958",
      "1964",
      "1972",
      "1985"
    ],
    "correct": 0
  },
  {
    "question": "Asakusa is home to?",
    "choices": [
      "Sensoji Temple",
      "Imperial Palace",
      "Tokyo Tower",
      "Skytree"
    ],
    "correct": 0
  },
  {
    "question": "Roppongi is known for?",
    "choices": [
      "nightlife",
      "shrines",
      "fish",
      "industry"
    ],
    "correct": 0
  },
  {
    "question": "The 1964 Olympics were held in?",
    "choices": [
      "Osaka",
      "Tokyo",
      "Kobe",
      "Sapporo"
    ],
    "correct": 1
  },
  {
    "question": "Tokyo's bay houses?",
    "choices": [
      "Odaiba island",
      "Mt Fuji",
      "Hokkaido",
      "Okinawa"
    ],
    "correct": 0
  },
  {
    "question": "Ginza is famous for?",
    "choices": [
      "high-end shopping",
      "industry",
      "temples",
      "fish"
    ],
    "correct": 0
  },
  {
    "question": "Yoyogi Park is next to?",
    "choices": [
      "Tokyo Tower",
      "Harajuku",
      "Akihabara",
      "Tsukiji"
    ],
    "correct": 1
  },
  {
    "question": "Tokyo's population is roughly?",
    "choices": [
      "3 million",
      "9 million",
      "14 million",
      "30 million"
    ],
    "correct": 2
  },
  {
    "question": "Mt Fuji is about how far from Tokyo?",
    "choices": [
      "10 miles",
      "60 miles",
      "250 miles",
      "500 miles"
    ],
    "correct": 1
  },
  {
    "question": "Sumida River runs through?",
    "choices": [
      "Asakusa",
      "Shibuya",
      "Roppongi",
      "Ginza"
    ],
    "correct": 0
  },
  {
    "question": "Meiji Shrine is in?",
    "choices": [
      "Shibuya/Shinjuku border",
      "Asakusa",
      "Ueno",
      "Roppongi"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TokyoQuizSettings): TokyoQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TokyoQuizState, action: TokyoQuizAction): TokyoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TokyoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
