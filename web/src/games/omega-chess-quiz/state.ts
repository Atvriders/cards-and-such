import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OmegaChessQuizSettings { questions: "10"; }
export interface OmegaChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OmegaChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Omega Chess uses a", choices: ["10×10 board with four corner squares", "8×8 board", "12×12 board", "Hex"], correct: 0 },
  { question: "The two new pieces are", choices: ["Wizard and Champion", "Cannon and elephant", "Archbishop and chancellor", "Lion and dragon"], correct: 0 },
  { question: "The Champion moves like", choices: ["A leaper (jumps to specific squares)", "Standard rook", "Standard bishop", "Pawn"], correct: 0 },
  { question: "The Wizard moves like", choices: ["A nightrider-like leaper", "Standard knight", "Pawn", "King"], correct: 0 },
  { question: "Designed by", choices: ["Daniel C. Macdonald", "Bobby Fischer", "V. R. Parton", "Reiner Knizia"], correct: 0 },
  { question: "Pawn promotion is", choices: ["Standard", "Only champion", "Forbidden", "Only wizard"], correct: 0 },
  { question: "Year of release", choices: ["1992", "1850", "2010", "1972"], correct: 0 },
  { question: "The variant aims to", choices: ["Add fairy pieces while preserving classical feel", "Speed up", "Replace FIDE", "Add dice"], correct: 0 },
  { question: "Castling in Omega Chess", choices: ["Adapted to the wider board", "Forbidden", "Required", "Replaces promotion"], correct: 0 },
  { question: "Omega Chess is classified as a", choices: ["Fairy chess variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OmegaChessQuizSettings): OmegaChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OmegaChessQuizState, action: OmegaChessQuizAction): OmegaChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OmegaChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
