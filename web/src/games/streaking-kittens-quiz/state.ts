import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StreakingKittensQuizSettings { questions: "10"; }
export interface StreakingKittensQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StreakingKittensQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Streaking Kittens adds a new ?",
    "choices": [
      "Streaking Kitten card you can hold without defusing",
      "Imploding Kitten only",
      "Defuse only",
      "Skip card"
    ],
    "correct": 0
  },
  {
    "question": "The Streaking Kitten is held safely while?",
    "choices": [
      "You also hold a Defuse card",
      "It's odd-numbered turn",
      "Round 1 only",
      "It's daytime"
    ],
    "correct": 0
  },
  {
    "question": "'Catomic Bomb' card?",
    "choices": [
      "Reshuffles all kittens to top of deck",
      "Skips a turn",
      "Steals a card",
      "Adds points"
    ],
    "correct": 0
  },
  {
    "question": "'Curse of the Cat Butt' makes you?",
    "choices": [
      "Hold cards facing the table for several turns",
      "Skip turn",
      "Discard hand",
      "Trade hand"
    ],
    "correct": 0
  },
  {
    "question": "'Bury' card lets you?",
    "choices": [
      "Place the next kitten back into the deck without showing",
      "Defuse a kitten",
      "Skip turn",
      "Reverse"
    ],
    "correct": 0
  },
  {
    "question": "'Personal Attack' card?",
    "choices": [
      "Forces YOU to take 3 turns in a row",
      "Skips opponent",
      "Steals card",
      "Reshuffles"
    ],
    "correct": 0
  },
  {
    "question": "Streaking Kittens designed by?",
    "choices": [
      "Elan Lee, Matthew Inman, Shane Small",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "The expansion requires?",
    "choices": [
      "The Exploding Kittens base deck",
      "Imploding only",
      "No base",
      "Tarot deck"
    ],
    "correct": 0
  },
  {
    "question": "Streaking Kittens is described as the?",
    "choices": [
      "Second expansion to Exploding Kittens",
      "Fifth",
      "First",
      "Final"
    ],
    "correct": 0
  },
  {
    "question": "Number of new cards added is roughly?",
    "choices": [
      "About 15",
      "100",
      "Just 1",
      "50"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: StreakingKittensQuizSettings): StreakingKittensQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StreakingKittensQuizState, action: StreakingKittensQuizAction): StreakingKittensQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StreakingKittensQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
