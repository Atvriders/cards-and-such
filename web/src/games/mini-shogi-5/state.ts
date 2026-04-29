import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MiniShogi5Settings { questions: "10"; }
export interface MiniShogi5State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MiniShogi5Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Mini Shogi board size?",
    "choices": [
      "5x5",
      "9x9",
      "8x8",
      "12x12"
    ],
    "correct": 0
  },
  {
    "question": "Number of piece types per side?",
    "choices": [
      "6 pieces total: King, Rook, Bishop, Gold, Silver, Pawn",
      "10 pieces total",
      "16 pieces total",
      "30 pieces total"
    ],
    "correct": 0
  },
  {
    "question": "Captured pieces in Mini Shogi",
    "choices": [
      "Drop back into your reserve as in standard Shogi",
      "Removed permanently",
      "Auto-promote",
      "Become pawns"
    ],
    "correct": 0
  },
  {
    "question": "Pawns may promote when",
    "choices": [
      "They reach the furthest rank",
      "Anywhere",
      "Never",
      "On rank 3 only"
    ],
    "correct": 0
  },
  {
    "question": "Initial position has each side with",
    "choices": [
      "One king, rook, bishop, gold, silver, pawn",
      "Two pawns",
      "Three rooks",
      "All major pieces"
    ],
    "correct": 0
  },
  {
    "question": "Pawn drops on the same file as another pawn?",
    "choices": [
      "Forbidden — nifu rule",
      "Always allowed",
      "Only on rank 5",
      "Mandatory"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Checkmate the king (or capture in some rules)",
      "Stalemate",
      "Cross board",
      "Promote two pawns"
    ],
    "correct": 0
  },
  {
    "question": "Stalemate in Mini Shogi is",
    "choices": [
      "Treated as win for the player giving it (in some rules)",
      "Always a draw",
      "Restart",
      "Loss for stalemate-giver"
    ],
    "correct": 0
  },
  {
    "question": "Mini Shogi was designed by",
    "choices": [
      "Shigenobu Kusumoto",
      "Shogun Tokugawa",
      "Lewis Carroll",
      "Hideo Sakurai"
    ],
    "correct": 0
  },
  {
    "question": "Mini Shogi's typical game length is",
    "choices": [
      "Short — under 50 moves",
      "Hundreds of moves",
      "Always exactly 100 moves",
      "Over a thousand moves"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MiniShogi5Settings): MiniShogi5State {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MiniShogi5State, action: MiniShogi5Action): MiniShogi5State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MiniShogi5State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
