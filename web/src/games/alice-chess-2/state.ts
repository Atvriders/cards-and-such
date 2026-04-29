import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AliceChess2Settings { questions: "10"; }
export interface AliceChess2State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AliceChess2Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "How many boards in Alice Chess?",
    "choices": [
      "Two",
      "One",
      "Three",
      "Four"
    ],
    "correct": 0
  },
  {
    "question": "After moving, the piece travels to",
    "choices": [
      "The mirror square on the other board",
      "Captured",
      "A random square",
      "Stays on same board"
    ],
    "correct": 0
  },
  {
    "question": "A move is legal only if",
    "choices": [
      "The mirror square is empty on the other board",
      "The piece has been on board A before",
      "It captures a king",
      "The opponent allows it"
    ],
    "correct": 0
  },
  {
    "question": "Captures happen on",
    "choices": [
      "The board the piece moves on, not the mirror board",
      "The mirror board only",
      "Both boards simultaneously",
      "Outside the board"
    ],
    "correct": 0
  },
  {
    "question": "Which famous author inspired the name?",
    "choices": [
      "Lewis Carroll",
      "Tolstoy",
      "Tolkien",
      "Charles Dickens"
    ],
    "correct": 0
  },
  {
    "question": "Pawns in Alice Chess",
    "choices": [
      "Move and switch boards as usual",
      "Cannot switch boards",
      "Promote backward",
      "Capture diagonally backward"
    ],
    "correct": 0
  },
  {
    "question": "Castling in Alice Chess is",
    "choices": [
      "Tricky—pieces split between boards complicate it",
      "Forbidden entirely",
      "Mandatory move 3",
      "Only kingside"
    ],
    "correct": 0
  },
  {
    "question": "Common opening errors include",
    "choices": [
      "Hanging pieces by ignoring the second board",
      "Pushing the f-pawn",
      "Trading queens",
      "Castling early"
    ],
    "correct": 0
  },
  {
    "question": "Alice Chess is classified as",
    "choices": [
      "A fairy chess variant",
      "Standard FIDE rule",
      "A card game",
      "A race game"
    ],
    "correct": 0
  },
  {
    "question": "Which key phrase describes Alice Chess?",
    "choices": [
      "Through the looking glass",
      "Knight's tour",
      "The Caissa puzzle",
      "Endgame fortress"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AliceChess2Settings): AliceChess2State {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AliceChess2State, action: AliceChess2Action): AliceChess2State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AliceChess2State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
