import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RacingKingsChessSettings { questions: "10"; }
export interface RacingKingsChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RacingKingsChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Goal of Racing Kings?",
    "choices": [
      "Race your king to rank 8",
      "Capture the queen",
      "Promote first",
      "Stalemate the opponent"
    ],
    "correct": 0
  },
  {
    "question": "Initial position has all pieces on",
    "choices": [
      "Ranks 1 and 2 along one side of board",
      "Standard chess setup",
      "Random Chess960 ranks",
      "10x8 board"
    ],
    "correct": 0
  },
  {
    "question": "Are checks legal in Racing Kings?",
    "choices": [
      "No, giving check is illegal",
      "Yes, freely allowed",
      "Only via discovered check",
      "Only on rank 8"
    ],
    "correct": 0
  },
  {
    "question": "Black wins by reaching",
    "choices": [
      "Rank 8 with their king",
      "Rank 1 with their king",
      "Either rank 1 or 8",
      "Capturing white king"
    ],
    "correct": 0
  },
  {
    "question": "If both kings reach rank 8 on consecutive moves, draws are awarded if",
    "choices": [
      "Both reach within the same move pair",
      "Black is on move",
      "The clock expires",
      "Never—first to reach wins always"
    ],
    "correct": 0
  },
  {
    "question": "Castling rights in Racing Kings are",
    "choices": [
      "Disallowed",
      "Standard",
      "Only kingside",
      "Only queenside"
    ],
    "correct": 0
  },
  {
    "question": "Pawns in Racing Kings",
    "choices": [
      "Are removed; there are no pawns",
      "Are present but cannot promote",
      "Move two squares only",
      "Promote on rank 4"
    ],
    "correct": 0
  },
  {
    "question": "Best opening principle?",
    "choices": [
      "Develop knights toward the side of the board to escort the king",
      "Push central pawns",
      "Trade queens",
      "Castle kingside fast"
    ],
    "correct": 0
  },
  {
    "question": "Typical winning king route uses",
    "choices": [
      "Knight and bishop screens to dodge checks",
      "Direct dash up the open file",
      "Hiding behind own pawns",
      "Jumping over enemy pieces"
    ],
    "correct": 0
  },
  {
    "question": "Racing Kings is classified as",
    "choices": [
      "A chess variant",
      "A poker variant",
      "A backgammon style",
      "A Go variant"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RacingKingsChessSettings): RacingKingsChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RacingKingsChessState, action: RacingKingsChessAction): RacingKingsChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RacingKingsChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
