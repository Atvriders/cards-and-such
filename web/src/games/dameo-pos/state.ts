import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DameoPosSettings { questions: "10"; }
export interface DameoPosState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DameoPosAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Dameo board size?",
    "choices": [
      "8x8",
      "10x10",
      "9x9",
      "Hexagonal"
    ],
    "correct": 0
  },
  {
    "question": "Pieces in Dameo move by",
    "choices": [
      "Sliding any number of squares along a row of friendly pieces",
      "Jumping enemy pieces",
      "Single-step diagonally",
      "Knight-leaps"
    ],
    "correct": 0
  },
  {
    "question": "Captures happen by",
    "choices": [
      "Jumping over an opponent piece",
      "Surrounding pieces",
      "Replacing pieces",
      "Removing diagonally"
    ],
    "correct": 0
  },
  {
    "question": "Promotion happens when",
    "choices": [
      "A piece reaches the far rank, becoming a flying king",
      "A piece captures three",
      "Five turns elapse",
      "Capturing a king"
    ],
    "correct": 0
  },
  {
    "question": "Dameo was designed by",
    "choices": [
      "Christian Freeling",
      "Lewis Carroll",
      "Sid Sackson",
      "James Ernest"
    ],
    "correct": 0
  },
  {
    "question": "Initial setup features",
    "choices": [
      "Pieces in a triangular pattern at each end",
      "Standard checker rows",
      "Random placement",
      "Eight pawns only"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Capture all opponents or block them entirely",
      "Stalemate",
      "Cross board",
      "Promote three pawns"
    ],
    "correct": 0
  },
  {
    "question": "Multi-jumps in Dameo are",
    "choices": [
      "Required when possible",
      "Forbidden",
      "Optional always",
      "Only by kings"
    ],
    "correct": 0
  },
  {
    "question": "Dameo is considered",
    "choices": [
      "A modern abstract draughts variant with elegant rules",
      "A traditional Russian draughts",
      "A casino game",
      "A solitaire game"
    ],
    "correct": 0
  },
  {
    "question": "Compared to draughts, Dameo features",
    "choices": [
      "Row-sliding column moves rather than single-step",
      "Hex grid",
      "Two boards",
      "Drops"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DameoPosSettings): DameoPosState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DameoPosState, action: DameoPosAction): DameoPosState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DameoPosState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
