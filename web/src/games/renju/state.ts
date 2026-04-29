import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RenjuSettings { questions: "10"; }
export interface RenjuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RenjuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Renju is a",
    "choices": [
      "Variant of Gomoku with forbidden-move balancing",
      "Card game",
      "Backgammon variant",
      "Chess variant"
    ],
    "correct": 0
  },
  {
    "question": "Goal of Renju?",
    "choices": [
      "Make five in a row of your color",
      "Capture all stones",
      "Surround the opponent",
      "Form a triangle"
    ],
    "correct": 0
  },
  {
    "question": "Renju's forbidden moves apply to",
    "choices": [
      "Black (the first player)",
      "White only",
      "Both players",
      "Neither"
    ],
    "correct": 0
  },
  {
    "question": "A 'three-three' fork is",
    "choices": [
      "Forbidden for black due to imbalance",
      "Allowed always",
      "A win immediately",
      "Reset the game"
    ],
    "correct": 0
  },
  {
    "question": "A 'four-four' fork for black is",
    "choices": [
      "Forbidden",
      "Allowed",
      "Auto-win",
      "Skip-turn"
    ],
    "correct": 0
  },
  {
    "question": "Overlines (six in a row) for black are",
    "choices": [
      "Forbidden — only exact five wins",
      "Auto-win",
      "Allowed",
      "Restart"
    ],
    "correct": 0
  },
  {
    "question": "Renju board size?",
    "choices": [
      "15x15",
      "9x9",
      "19x19",
      "8x8"
    ],
    "correct": 0
  },
  {
    "question": "Renju originated in",
    "choices": [
      "Japan",
      "China",
      "Korea",
      "Russia"
    ],
    "correct": 0
  },
  {
    "question": "Two consecutive players placing stones on the same intersection is",
    "choices": [
      "Impossible — stones don't stack",
      "Allowed",
      "Lose for first player",
      "Auto-promote"
    ],
    "correct": 0
  },
  {
    "question": "Major Renju opening principle?",
    "choices": [
      "Black plays sound openings to avoid forbidden positions",
      "Always play in corners",
      "Skip first three moves",
      "Capture early"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RenjuSettings): RenjuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RenjuState, action: RenjuAction): RenjuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RenjuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
