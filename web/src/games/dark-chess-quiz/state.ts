import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DarkChessQuizSettings { questions: "10"; }
export interface DarkChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DarkChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Dark Chess each player sees", choices: ["Only squares their own pieces attack/occupy", "All squares", "Only opponent pieces", "Random squares"], correct: 0 },
  { question: "Capture announces", choices: ["Just the capture, not opponent piece info", "All info", "Nothing", "Promotes pawn"], correct: 0 },
  { question: "Check is", choices: ["Often not announced", "Always announced", "Forbidden", "Three required"], correct: 0 },
  { question: "The variant ends when", choices: ["A king is captured", "Standard mate", "Stalemate", "Three checks"], correct: 0 },
  { question: "Dark Chess is sometimes called", choices: ["Fog of War Chess", "Bullet Chess", "Speed Chess", "Open Chess"], correct: 0 },
  { question: "The challenge is", choices: ["Inferring opponent moves with limited info", "Memorizing openings", "Pure tactics", "Endgame theory"], correct: 0 },
  { question: "Pawns and pieces stay hidden until", choices: ["They enter your vision range", "Captured", "Promoted", "End of game"], correct: 0 },
  { question: "Stalemate is", choices: ["A draw, as in standard", "A loss", "A win", "Forbidden"], correct: 0 },
  { question: "Dark Chess is best supported", choices: ["Online with server arbiters", "Over the board", "Correspondence", "Mail"], correct: 0 },
  { question: "Castling in Dark Chess", choices: ["Allowed if your knowledge supports it", "Forbidden", "Required", "Only king-side"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DarkChessQuizSettings): DarkChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DarkChessQuizState, action: DarkChessQuizAction): DarkChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DarkChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
