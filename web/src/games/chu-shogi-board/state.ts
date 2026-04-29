import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChuShogiBoardSettings { questions: "10"; }
export interface ChuShogiBoardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChuShogiBoardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Chu Shogi board size?",
    "choices": [
      "12x12",
      "9x9",
      "8x8",
      "15x15"
    ],
    "correct": 0
  },
  {
    "question": "Chu Shogi has approximately how many piece types?",
    "choices": [
      "46",
      "10",
      "20",
      "70"
    ],
    "correct": 0
  },
  {
    "question": "Chu Shogi's most powerful piece is",
    "choices": [
      "The Lion (1+1 stepping)",
      "The King",
      "The Pawn",
      "Drop Reserve"
    ],
    "correct": 0
  },
  {
    "question": "Captured pieces in Chu Shogi",
    "choices": [
      "Are removed from the game (no drops)",
      "Drop back to your reserve",
      "Auto-promote",
      "Become pawns"
    ],
    "correct": 0
  },
  {
    "question": "Chu Shogi was popular in",
    "choices": [
      "Medieval Japan",
      "Tang China",
      "Ancient Persia",
      "Renaissance Italy"
    ],
    "correct": 0
  },
  {
    "question": "Chu Shogi pieces promote at",
    "choices": [
      "The far rank zones similar to Shogi",
      "Random squares",
      "Never",
      "On capture only"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Checkmate the king (or capture)",
      "Stalemate",
      "Cross board",
      "Promote three pawns"
    ],
    "correct": 0
  },
  {
    "question": "The 'Lion' piece moves",
    "choices": [
      "Up to two steps in any direction with double moves possible",
      "One square",
      "Like a queen",
      "Like a knight"
    ],
    "correct": 0
  },
  {
    "question": "Other powerful pieces in Chu Shogi include",
    "choices": [
      "The Dragon King and Dragon Horse promotions",
      "Only the king",
      "Only pawns",
      "Only generals"
    ],
    "correct": 0
  },
  {
    "question": "Chu Shogi is considered",
    "choices": [
      "The most-studied large shogi variant",
      "A modern board game",
      "A poker game",
      "A backgammon game"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChuShogiBoardSettings): ChuShogiBoardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChuShogiBoardState, action: ChuShogiBoardAction): ChuShogiBoardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChuShogiBoardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
