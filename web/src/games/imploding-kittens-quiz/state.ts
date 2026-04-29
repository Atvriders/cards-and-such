import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ImplodingKittensQuizSettings { questions: "10"; }
export interface ImplodingKittensQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ImplodingKittensQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Imploding Kittens raises the max player count to?",
    "choices": [
      "6 players",
      "10",
      "20",
      "12"
    ],
    "correct": 0
  },
  {
    "question": "The signature included accessory is the?",
    "choices": [
      "Cone of Shame",
      "Plush kitten",
      "Sand timer",
      "Dice cup"
    ],
    "correct": 0
  },
  {
    "question": "An imploding kitten card?",
    "choices": [
      "Cannot be defused; placed face-up in deck",
      "Defuses easily",
      "Wins automatically",
      "Draws three cards"
    ],
    "correct": 0
  },
  {
    "question": "New 'Reverse' card?",
    "choices": [
      "Reverses turn order, ends your turn",
      "Re-shuffles deck",
      "Restores a kitten",
      "Skips two turns"
    ],
    "correct": 0
  },
  {
    "question": "'Targeted Attack' card?",
    "choices": [
      "Forces a chosen player to take 2 turns",
      "Heals",
      "Steals card",
      "Resets deck"
    ],
    "correct": 0
  },
  {
    "question": "'Feral Cat' card acts as?",
    "choices": [
      "A wild Cat Card for sets",
      "Numeric only",
      "Defuse copy",
      "Skip plus"
    ],
    "correct": 0
  },
  {
    "question": "'Alter the Future' card?",
    "choices": [
      "Lets you reorder the next three cards",
      "Shuffles deck",
      "Adds a kitten",
      "Removes a kitten"
    ],
    "correct": 0
  },
  {
    "question": "Imploding Kittens designed by?",
    "choices": [
      "Elan Lee, Matthew Inman, Shane Small",
      "Reiner Knizia",
      "Eric Lang",
      "Klaus Teuber"
    ],
    "correct": 0
  },
  {
    "question": "Pack adds how many new cards?",
    "choices": [
      "20",
      "5",
      "100",
      "Just 1"
    ],
    "correct": 0
  },
  {
    "question": "The expansion requires?",
    "choices": [
      "The Exploding Kittens base deck",
      "Nothing else",
      "Two base decks",
      "Special dice"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ImplodingKittensQuizSettings): ImplodingKittensQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ImplodingKittensQuizState, action: ImplodingKittensQuizAction): ImplodingKittensQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ImplodingKittensQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
