import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FogOfWarSettings { questions: "10"; }
export interface FogOfWarState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FogOfWarAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Visibility rule in Fog of War Chess?",
    "choices": [
      "You see only squares your pieces can move to",
      "Both players see all squares",
      "Only your own pieces are hidden",
      "Only the king is shown"
    ],
    "correct": 0
  },
  {
    "question": "Captures are revealed",
    "choices": [
      "When you capture an enemy piece",
      "Never — both players guess",
      "Only on promotion",
      "Only by check"
    ],
    "correct": 0
  },
  {
    "question": "Checks are",
    "choices": [
      "Never explicit; you must infer them",
      "Announced normally",
      "Always cause game end",
      "Forfeited automatically"
    ],
    "correct": 0
  },
  {
    "question": "Can the king walk into check unknowingly?",
    "choices": [
      "Yes — and that loses the game",
      "No, illegal moves blocked",
      "Yes — but the move resets",
      "Yes — and the king is invincible"
    ],
    "correct": 0
  },
  {
    "question": "How does one win Fog of War?",
    "choices": [
      "Capture the enemy king",
      "Standard checkmate",
      "Stalemate",
      "Promote two pawns"
    ],
    "correct": 0
  },
  {
    "question": "Fog of War is also called",
    "choices": [
      "Dark Chess",
      "Blind Chess (sometimes)",
      "Both A and B",
      "Crazyhouse"
    ],
    "correct": 0
  },
  {
    "question": "Pawn moves reveal",
    "choices": [
      "Only squares the pawn can move to",
      "All adjacent files",
      "Whole file",
      "Nothing—pawns are hidden"
    ],
    "correct": 0
  },
  {
    "question": "Knight visibility extends to",
    "choices": [
      "The eight L-shaped target squares",
      "Ring around the knight",
      "Whole row",
      "Whole board"
    ],
    "correct": 0
  },
  {
    "question": "Best opening principle?",
    "choices": [
      "Develop pieces for maximum board coverage",
      "Stay still and wait",
      "Sacrifice queen early",
      "Castle long always"
    ],
    "correct": 0
  },
  {
    "question": "Fog of War is supported on",
    "choices": [
      "Lichess and similar variant servers",
      "FIDE-rated only",
      "Only handheld sets",
      "Only physical chessboards"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FogOfWarSettings): FogOfWarState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FogOfWarState, action: FogOfWarAction): FogOfWarState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FogOfWarState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
