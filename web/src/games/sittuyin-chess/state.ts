import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SittuyinChessSettings { questions: "10"; }
export interface SittuyinChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SittuyinChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Sittuyin originates from",
    "choices": [
      "Burma (Myanmar)",
      "Korea",
      "China",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "Initial setup of Sittuyin requires",
    "choices": [
      "Players placing pieces on the board after pawns are set",
      "Pieces start in standard chess positions",
      "All pawns on rank 4",
      "No pieces—pure pawns"
    ],
    "correct": 0
  },
  {
    "question": "The general (king-equivalent) is",
    "choices": [
      "Min-gyi, the leader piece",
      "Always queen",
      "Knight only",
      "Removed in Sittuyin"
    ],
    "correct": 0
  },
  {
    "question": "Pawns in Sittuyin",
    "choices": [
      "Promote when reaching specific diagonal squares",
      "Cannot promote",
      "Promote anywhere on rank 8",
      "Move backward"
    ],
    "correct": 0
  },
  {
    "question": "Board size?",
    "choices": [
      "8x8",
      "9x9",
      "10x10",
      "12x12"
    ],
    "correct": 0
  },
  {
    "question": "Which piece replaces the bishop?",
    "choices": [
      "Sin (elephant)",
      "Queen",
      "Rook",
      "Knight"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Checkmate the general",
      "Stalemate",
      "Promote three pawns",
      "Capture all pieces"
    ],
    "correct": 0
  },
  {
    "question": "Sittuyin pawn-row begins on",
    "choices": [
      "Rank 3 (a3 through h3)",
      "Rank 2",
      "Rank 5",
      "Rank 7"
    ],
    "correct": 0
  },
  {
    "question": "Sittuyin allows",
    "choices": [
      "Once-per-game queen jump on first move from setup",
      "Triple promotion",
      "Knight teleportation",
      "Castling"
    ],
    "correct": 0
  },
  {
    "question": "Sittuyin is closely related to",
    "choices": [
      "Shatranj",
      "Crazyhouse",
      "Backgammon",
      "Othello"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SittuyinChessSettings): SittuyinChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SittuyinChessState, action: SittuyinChessAction): SittuyinChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SittuyinChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
