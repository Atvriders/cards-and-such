import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CrazyhouseChessSettings { questions: "10"; }
export interface CrazyhouseChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CrazyhouseChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Captured pieces in Crazyhouse",
    "choices": [
      "Become reusable in the captor's reserve",
      "Are removed from the game",
      "Are returned to original color",
      "Are auto-promoted"
    ],
    "correct": 0
  },
  {
    "question": "Dropping a piece counts as",
    "choices": [
      "A move",
      "A pause",
      "A turn skip",
      "An illegal move"
    ],
    "correct": 0
  },
  {
    "question": "Pawns may be dropped on",
    "choices": [
      "Any rank except 1 and 8",
      "Any rank including 1 and 8",
      "Only rank 5",
      "Anywhere"
    ],
    "correct": 0
  },
  {
    "question": "A promoted piece, when captured, returns as",
    "choices": [
      "A pawn (its original form)",
      "A queen",
      "Removed permanently",
      "Same promoted piece"
    ],
    "correct": 0
  },
  {
    "question": "Board size in Crazyhouse?",
    "choices": [
      "Standard 8x8",
      "10x10",
      "9x9",
      "12x12"
    ],
    "correct": 0
  },
  {
    "question": "Initial position is",
    "choices": [
      "Standard chess (or Chess960 for variant Crazyhouse)",
      "Empty board",
      "Random pieces only",
      "Pieces in reserves"
    ],
    "correct": 0
  },
  {
    "question": "Drop checks are",
    "choices": [
      "Allowed and common",
      "Forbidden",
      "Only on rank 1",
      "Only by knight"
    ],
    "correct": 0
  },
  {
    "question": "Strategically, why is the king extra vulnerable?",
    "choices": [
      "Pieces can drop near the king any move",
      "Pieces multiply automatically",
      "King moves are reduced",
      "Queens are weaker"
    ],
    "correct": 0
  },
  {
    "question": "Common Crazyhouse opening trap?",
    "choices": [
      "Quickly trading and dropping pieces around the king",
      "Castling long always",
      "Pushing all pawns to rank 5",
      "Keeping all queens off-board"
    ],
    "correct": 0
  },
  {
    "question": "Crazyhouse can be combined with",
    "choices": [
      "Chess960 starting position",
      "No other variants",
      "Only Backgammon",
      "Only Antichess"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CrazyhouseChessSettings): CrazyhouseChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CrazyhouseChessState, action: CrazyhouseChessAction): CrazyhouseChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CrazyhouseChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
