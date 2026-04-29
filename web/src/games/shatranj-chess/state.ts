import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShatranjChessSettings { questions: "10"; }
export interface ShatranjChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShatranjChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Shatranj is the predecessor of",
    "choices": [
      "Modern chess",
      "Backgammon",
      "Go",
      "Mahjong"
    ],
    "correct": 0
  },
  {
    "question": "Shatranj's queen (firzan) moves",
    "choices": [
      "One square diagonally",
      "Like a modern queen",
      "Like a knight",
      "Like a rook"
    ],
    "correct": 0
  },
  {
    "question": "Shatranj's bishop (fil) moves",
    "choices": [
      "Exactly two squares diagonally, jumping any piece",
      "Like a modern bishop",
      "Like a knight",
      "One square forward only"
    ],
    "correct": 0
  },
  {
    "question": "Pawns in Shatranj",
    "choices": [
      "Move one square forward only — never two on first move",
      "Move two on first move",
      "Promote to queen always",
      "Move backward"
    ],
    "correct": 0
  },
  {
    "question": "Pawns promote to",
    "choices": [
      "A firzan (Shatranj queen) only",
      "Any piece",
      "A knight only",
      "A rook"
    ],
    "correct": 0
  },
  {
    "question": "Stalemate in Shatranj is",
    "choices": [
      "A win for the player giving stalemate",
      "A draw",
      "A loss for the stalemate giver",
      "Restart"
    ],
    "correct": 0
  },
  {
    "question": "Bare king (only king left) in Shatranj?",
    "choices": [
      "Considered a win for the opponent",
      "Always a draw",
      "Forces a redeal",
      "Auto-stalemate"
    ],
    "correct": 0
  },
  {
    "question": "Shatranj originated in",
    "choices": [
      "Persia and the Islamic world",
      "China",
      "India only",
      "Egypt"
    ],
    "correct": 0
  },
  {
    "question": "Castling in Shatranj is",
    "choices": [
      "Not allowed — castling did not exist",
      "King-side only",
      "Queen-side only",
      "Mandatory"
    ],
    "correct": 0
  },
  {
    "question": "Earliest written Shatranj texts come from",
    "choices": [
      "9th-century Arab manuscripts",
      "14th-century England",
      "Modern publications only",
      "20th century"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ShatranjChessSettings): ShatranjChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShatranjChessState, action: ShatranjChessAction): ShatranjChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShatranjChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
