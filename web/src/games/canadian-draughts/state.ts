import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CanadianDraughtsSettings { questions: "10"; }
export interface CanadianDraughtsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CanadianDraughtsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Canadian Draughts board size?",
    "choices": [
      "12x12",
      "10x10",
      "8x8",
      "9x9"
    ],
    "correct": 0
  },
  {
    "question": "Number of pieces per side?",
    "choices": [
      "30",
      "20",
      "12",
      "16"
    ],
    "correct": 0
  },
  {
    "question": "Captures are",
    "choices": [
      "Mandatory and use international draughts rules",
      "Optional",
      "Backwards only",
      "Forbidden"
    ],
    "correct": 0
  },
  {
    "question": "Kings (crowned pieces) move",
    "choices": [
      "Long-range as flying kings on diagonals",
      "One square only",
      "Backwards only",
      "Like horses"
    ],
    "correct": 0
  },
  {
    "question": "If multiple captures are possible, the player must",
    "choices": [
      "Take the longest capture sequence",
      "Choose the shortest",
      "Skip the move",
      "Take any"
    ],
    "correct": 0
  },
  {
    "question": "Pawns capture",
    "choices": [
      "Forward and backward",
      "Only forward",
      "Only backward",
      "Only sideways"
    ],
    "correct": 0
  },
  {
    "question": "Promotion happens when",
    "choices": [
      "A pawn reaches the opposite end of the board",
      "Three captures in a row",
      "After 30 moves",
      "Capturing a king"
    ],
    "correct": 0
  },
  {
    "question": "Canadian Draughts originates in",
    "choices": [
      "Quebec, Canada",
      "France",
      "Germany",
      "Russia"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Capture all opponent's pieces or block them",
      "Checkmate",
      "First to capture five",
      "Cross board"
    ],
    "correct": 0
  },
  {
    "question": "Canadian Draughts is closely related to",
    "choices": [
      "International Draughts (with bigger board)",
      "English Checkers",
      "Chess",
      "Halma"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CanadianDraughtsSettings): CanadianDraughtsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CanadianDraughtsState, action: CanadianDraughtsAction): CanadianDraughtsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CanadianDraughtsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
