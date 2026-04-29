import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HordeChessQuizSettings { questions: "10"; }
export interface HordeChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HordeChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Horde side controls", choices: ["32–36 pawns and pawn-like material", "A normal chess army", "Knights only", "Eight pawns"], correct: 0 },
  { question: "Black wins by", choices: ["Capturing all white pawns", "Promoting eight pawns", "Reaching rank 1", "Three checks"], correct: 0 },
  { question: "White (the Horde) wins by", choices: ["Checkmating the black king", "Reaching rank 8", "Capturing the queen", "Stalemate"], correct: 0 },
  { question: "Horde pawns can", choices: ["Promote on rank 8 like normal pawns", "Never promote", "Only become knights", "Move backwards"], correct: 0 },
  { question: "The first rank for white pawns means", choices: ["They can move two squares from rank 1 or 2", "Always two squares", "Locked in place", "Only diagonal"], correct: 0 },
  { question: "The Horde has", choices: ["No king — no checkmate possible against white", "A standard king", "Two kings", "A queen-king"], correct: 0 },
  { question: "Tactically, black usually plays", choices: ["With piece coordination to clear the front", "Solo king run", "Pawn races", "Castling"], correct: 0 },
  { question: "The Horde variant is studied as", choices: ["An asymmetric chess problem", "An opening line", "A bullet variant", "A pawn-only puzzle"], correct: 0 },
  { question: "Initial pawn formation for the Horde is", choices: ["Two ranks of pawns plus extra pawns", "One rank of 8", "Standard", "Eight pawns"], correct: 0 },
  { question: "Horde pawns can be captured", choices: ["Yes, by any black piece", "Only by black pawns", "Never", "Only on dark squares"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HordeChessQuizSettings): HordeChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HordeChessQuizState, action: HordeChessQuizAction): HordeChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HordeChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
