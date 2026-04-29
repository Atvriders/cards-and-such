import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AbandonArtichokesQuizSettings { questions: "10"; }
export interface AbandonArtichokesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AbandonArtichokesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Abandon All Artichokes is published by?",
    "choices": [
      "Gamewright",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "The goal is to?",
    "choices": [
      "Remove all artichokes from your deck",
      "Collect most artichokes",
      "Bid",
      "Trick-take"
    ],
    "correct": 0
  },
  {
    "question": "Abandon All Artichokes is a?",
    "choices": [
      "Deck-purging family card game",
      "Trick-taker",
      "Auction",
      "Roll-and-write"
    ],
    "correct": 0
  },
  {
    "question": "Players win when their hand has?",
    "choices": [
      "No artichoke cards",
      "Five artichoke cards",
      "Highest score",
      "All trump"
    ],
    "correct": 0
  },
  {
    "question": "Vegetable cards in the deck include?",
    "choices": [
      "Broccoli, Leek, Eggplant, Pepper, Carrot",
      "Suits only",
      "Numbers only",
      "Crew"
    ],
    "correct": 0
  },
  {
    "question": "Designer is?",
    "choices": [
      "Emma Larkins",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "2 to 4",
      "Solo only",
      "20 minimum",
      "Exactly 6"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages?",
    "choices": [
      "10 and up (or younger casual)",
      "Adults only",
      "21+",
      "Under 1"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "About 20 minutes",
      "An hour",
      "All day",
      "Under 1 second"
    ],
    "correct": 0
  },
  {
    "question": "Released in?",
    "choices": [
      "2020",
      "1880s",
      "2050",
      "1950s"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AbandonArtichokesQuizSettings): AbandonArtichokesQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AbandonArtichokesQuizState, action: AbandonArtichokesQuizAction): AbandonArtichokesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AbandonArtichokesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
