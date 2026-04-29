import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LeganChessQuizSettings { questions: "10"; }
export interface LeganChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LeganChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Legan Chess rotates the starting position by", choices: ["45 degrees (diagonal back rank)", "90 degrees", "180 degrees", "Not at all"], correct: 0 },
  { question: "Pawns advance toward", choices: ["The opposing diagonal corner", "Rank 8", "Rank 4", "Center"], correct: 0 },
  { question: "The board is still", choices: ["8×8", "9×9", "10×10", "Hex"], correct: 0 },
  { question: "The variant inventor", choices: ["Leonard J. Legan", "Bobby Fischer", "Reiner Knizia", "V. R. Parton"], correct: 0 },
  { question: "Pawn promotion happens at", choices: ["The opposing corner squares", "Rank 8", "Rank 1", "Anywhere"], correct: 0 },
  { question: "Diagonal pawn advance gives", choices: ["A unique strategic feel", "Same as standard", "Faster game", "Endless game"], correct: 0 },
  { question: "Bishops in Legan Chess", choices: ["Move standard diagonally — making them very strong", "Move horizontally", "Locked in place", "Replaced"], correct: 0 },
  { question: "Castling in Legan Chess", choices: ["Generally absent due to setup", "Required", "Standard", "Only king-side"], correct: 0 },
  { question: "The variant is classified as a", choices: ["Geometric chess variant", "FIDE rule", "Race game", "Card variant"], correct: 0 },
  { question: "Strategic key idea", choices: ["Control the long diagonal axis of advance", "Push h-pawn", "Pure pawn play", "Drops"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LeganChessQuizSettings): LeganChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LeganChessQuizState, action: LeganChessQuizAction): LeganChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LeganChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
