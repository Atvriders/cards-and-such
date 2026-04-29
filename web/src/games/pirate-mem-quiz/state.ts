import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PirateMemQuizSettings { questions: "10"; }
export interface PirateMemQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PirateMemQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pirate Memory tiles depict?",
    "choices": [
      "Pirates, ships, treasure, parrots, islands",
      "Country flags",
      "Numbers",
      "Letters"
    ],
    "correct": 0
  },
  {
    "question": "The classic mechanic is?",
    "choices": [
      "Flip two tiles, keep matching pairs",
      "Trick-taking",
      "Bidding",
      "Drafting"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages?",
    "choices": [
      "3 or 4 and up",
      "Adults only",
      "21+",
      "16+"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "1 to 4",
      "Solo only",
      "12 minimum",
      "Always 8"
    ],
    "correct": 0
  },
  {
    "question": "An incorrect flip causes?",
    "choices": [
      "Tiles to return face-down",
      "Loss of all pairs",
      "Skip 3 turns",
      "Steal opponent pair"
    ],
    "correct": 0
  },
  {
    "question": "Players win by?",
    "choices": [
      "Collecting the most matching pairs",
      "Highest die roll",
      "Bidding most",
      "Random draw"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "About 10–20 minutes",
      "An hour",
      "All day",
      "Under 1 second"
    ],
    "correct": 0
  },
  {
    "question": "Common publishers of themed memory decks include?",
    "choices": [
      "Ravensburger, Galt, Melissa & Doug",
      "Mattel only",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Educational benefits include?",
    "choices": [
      "Visual memory and matching skills",
      "Calculus",
      "Coding",
      "Auction strategy"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Calm, fun, family-friendly",
      "Tense competitive",
      "Adult horror",
      "Solo grind"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PirateMemQuizSettings): PirateMemQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PirateMemQuizState, action: PirateMemQuizAction): PirateMemQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PirateMemQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
