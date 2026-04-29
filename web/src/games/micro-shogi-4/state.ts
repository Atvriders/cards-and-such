import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MicroShogi4Settings { questions: "10"; }
export interface MicroShogi4State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MicroShogi4Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Micro Shogi board size?",
    "choices": [
      "4x5",
      "5x5",
      "8x8",
      "9x9"
    ],
    "correct": 0
  },
  {
    "question": "What's special about Micro Shogi piece movement?",
    "choices": [
      "Every piece promotes (or demotes) after every move",
      "Pieces never promote",
      "Pieces move only diagonally",
      "All pieces are pawns"
    ],
    "correct": 0
  },
  {
    "question": "Captured pieces are",
    "choices": [
      "Returned to reserve as in Shogi",
      "Removed forever",
      "Replaced by king",
      "Frozen in place"
    ],
    "correct": 0
  },
  {
    "question": "Number of distinct piece types per side?",
    "choices": [
      "4 in starting position",
      "10",
      "16",
      "20"
    ],
    "correct": 0
  },
  {
    "question": "Designed by?",
    "choices": [
      "Hidehisa Sasaki and Sho Hosoi",
      "Lewis Carroll",
      "Shigenobu Kusumoto",
      "Mikhail Botvinnik"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Checkmate the king or capture it",
      "Stalemate",
      "Cross board",
      "Promote three pawns"
    ],
    "correct": 0
  },
  {
    "question": "Pawn-drop rules?",
    "choices": [
      "Standard nifu rule applies — no double-pawns on a file",
      "Pawns cannot drop",
      "Pawns drop only on rank 1",
      "All drops legal"
    ],
    "correct": 0
  },
  {
    "question": "Micro Shogi typical game length?",
    "choices": [
      "Quite short due to small board",
      "Hundreds of moves",
      "Always 100 moves",
      "Multi-day"
    ],
    "correct": 0
  },
  {
    "question": "Compared to Mini Shogi, Micro Shogi is",
    "choices": [
      "Smaller and faster, with mandatory piece-flipping each move",
      "Larger",
      "Same",
      "Has more pieces"
    ],
    "correct": 0
  },
  {
    "question": "Common opening principle?",
    "choices": [
      "Use rapid promotions to dominate the small board",
      "Castle long",
      "Trade queens",
      "Push h-pawn"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MicroShogi4Settings): MicroShogi4State {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MicroShogi4State, action: MicroShogi4Action): MicroShogi4State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MicroShogi4State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
