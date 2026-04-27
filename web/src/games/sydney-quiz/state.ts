import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SydneyQuizSettings { questions: "10" | "20"; }
export interface SydneyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SydneyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Opera House sails were designed by?",
    "choices": [
      "Frank Lloyd Wright",
      "Jorn Utzon",
      "Norman Foster",
      "Le Corbusier"
    ],
    "correct": 1
  },
  {
    "question": "Sydney Harbour Bridge was completed in?",
    "choices": [
      "1912",
      "1932",
      "1952",
      "1972"
    ],
    "correct": 1
  },
  {
    "question": "Bondi is famous for its?",
    "choices": [
      "mountains",
      "beach",
      "casino",
      "cathedral"
    ],
    "correct": 1
  },
  {
    "question": "Sydney is the capital of?",
    "choices": [
      "Australia",
      "New South Wales",
      "Victoria",
      "Queensland"
    ],
    "correct": 1
  },
  {
    "question": "The Rocks is a historic?",
    "choices": [
      "geological park",
      "colonial neighborhood",
      "mountain range",
      "mining town"
    ],
    "correct": 1
  },
  {
    "question": "The opera house opened in?",
    "choices": [
      "1959",
      "1973",
      "1988",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Darling Harbour is known for?",
    "choices": [
      "zoo",
      "entertainment & dining",
      "stadium",
      "ports"
    ],
    "correct": 1
  },
  {
    "question": "Sydney was founded as a?",
    "choices": [
      "fishing village",
      "penal colony",
      "trading post",
      "fort"
    ],
    "correct": 1
  },
  {
    "question": "Manly is reached by?",
    "choices": [
      "train",
      "ferry",
      "subway",
      "tram only"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's CBD's tallest is?",
    "choices": [
      "MLC Centre",
      "Sydney Tower",
      "Crown",
      "Q1"
    ],
    "correct": 1
  },
  {
    "question": "The 2000 Olympics were held in?",
    "choices": [
      "Melbourne",
      "Sydney",
      "Brisbane",
      "Perth"
    ],
    "correct": 1
  },
  {
    "question": "Hyde Park (Sydney) features the?",
    "choices": [
      "ANZAC Memorial",
      "Hub",
      "Castle",
      "Oasis"
    ],
    "correct": 0
  },
  {
    "question": "Taronga Zoo overlooks?",
    "choices": [
      "Bondi",
      "Sydney Harbour",
      "Manly",
      "Newcastle"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's famous coastal walk goes from Bondi to?",
    "choices": [
      "Manly",
      "Coogee",
      "Cronulla",
      "Newcastle"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's airport is named after?",
    "choices": [
      "Cook",
      "Kingsford Smith",
      "Hawke",
      "Phillip"
    ],
    "correct": 1
  },
  {
    "question": "The original inhabitants were the?",
    "choices": [
      "Eora",
      "Maori",
      "Yolngu",
      "Anangu"
    ],
    "correct": 0
  },
  {
    "question": "The Royal Botanic Garden is next to?",
    "choices": [
      "Bondi",
      "the Opera House",
      "airport",
      "Manly"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's NYE features fireworks on the?",
    "choices": [
      "Opera House only",
      "Harbour Bridge",
      "CBD streets",
      "airport"
    ],
    "correct": 1
  },
  {
    "question": "Sydney Tower's highest level is the?",
    "choices": [
      "roof",
      "Skywalk/observation",
      "cellar",
      "atrium"
    ],
    "correct": 1
  },
  {
    "question": "Centennial Park is known for?",
    "choices": [
      "zoo",
      "large green space",
      "rivers",
      "mountains"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SydneyQuizSettings): SydneyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SydneyQuizState, action: SydneyQuizAction): SydneyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SydneyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
