import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BreakthroughCheckersQuizSettings { questions: "10"; }
export interface BreakthroughCheckersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BreakthroughCheckersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Breakthrough is won by", choices: ["Reaching the opposite back rank with any pawn", "Capturing the king", "Surrounding opponent", "Filling the board"] as [string, string, string, string], correct: 0 },
  { question: "Breakthrough has only", choices: ["Pawns — no other pieces", "Pawns and kings", "Knights and bishops", "Rooks only"] as [string, string, string, string], correct: 0 },
  { question: "Pawns move", choices: ["One square forward or diagonally forward", "In knight L-shapes", "Like chess kings", "Backwards too"] as [string, string, string, string], correct: 0 },
  { question: "Pawns capture", choices: ["Diagonally forward only", "Straight ahead", "Like chess rooks", "By jumping like checkers"] as [string, string, string, string], correct: 0 },
  { question: "The board for Breakthrough is usually", choices: ["8x8 with all pawns on the first two ranks", "Hex grid", "5x5", "12x12"] as [string, string, string, string], correct: 0 },
  { question: "Breakthrough was invented by", choices: ["Dan Troyka", "Bobby Fischer", "Dr. Reiner Knizia", "Edsger Dijkstra"] as [string, string, string, string], correct: 0 },
  { question: "Promotion in Breakthrough is", choices: ["Automatic win when reaching opposite rank", "To queen on rank 8", "Forbidden", "To rook"] as [string, string, string, string], correct: 0 },
  { question: "Breakthrough strategy emphasizes", choices: ["Race tempo and weak-pawn protection", "Castling rights", "Bishop pairs", "Mahjong-style melds"] as [string, string, string, string], correct: 0 },
  { question: "Pawn captures are", choices: ["Optional, not mandatory", "Mandatory like checkers", "Forbidden", "Three-step"] as [string, string, string, string], correct: 0 },
  { question: "The variant is", choices: ["A modern abstract strategy classic", "A pure-luck game", "A trick-taking card game", "A racing dice game"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BreakthroughCheckersQuizSettings): BreakthroughCheckersQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BreakthroughCheckersQuizState, action: BreakthroughCheckersQuizAction): BreakthroughCheckersQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BreakthroughCheckersQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
