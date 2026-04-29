import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DutchBlitzExpQuizSettings { questions: "10"; }
export interface DutchBlitzExpQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DutchBlitzExpQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Dutch Blitz Expansion Pack supports up to?",
    "choices": [
      "8 players",
      "12",
      "20",
      "4"
    ],
    "correct": 0
  },
  {
    "question": "Dutch Blitz uses art inspired by?",
    "choices": [
      "Pennsylvania Dutch (Amish) culture",
      "Egyptian hieroglyphs",
      "Norse runes",
      "Roman gods"
    ],
    "correct": 0
  },
  {
    "question": "Dutch Blitz piles to clear are called?",
    "choices": [
      "The Blitz Pile",
      "The Boss Pile",
      "The Captain Pile",
      "The Court Pile"
    ],
    "correct": 0
  },
  {
    "question": "Players win the round by emptying?",
    "choices": [
      "Their 10-card Blitz pile and yelling",
      "All hand",
      "Skat pile",
      "Discard"
    ],
    "correct": 0
  },
  {
    "question": "Cards each player has are colored?",
    "choices": [
      "A unique color per player",
      "All same color",
      "Random",
      "Suit-only"
    ],
    "correct": 0
  },
  {
    "question": "Dutch Blitz was designed by?",
    "choices": [
      "Werner Ernst George Müller",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Each color deck has cards numbered?",
    "choices": [
      "1 through 10",
      "1 through 13",
      "1 through 5",
      "1 through 20"
    ],
    "correct": 0
  },
  {
    "question": "Cards play onto?",
    "choices": [
      "Shared center piles in ascending order by color",
      "Solo piles",
      "Suit piles",
      "No piles"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages?",
    "choices": [
      "8 and up",
      "Adults only",
      "16+",
      "Under 1"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Chaotic simultaneous racing",
      "Heavy strategy",
      "Solo logic",
      "Auction"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DutchBlitzExpQuizSettings): DutchBlitzExpQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DutchBlitzExpQuizState, action: DutchBlitzExpQuizAction): DutchBlitzExpQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DutchBlitzExpQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
