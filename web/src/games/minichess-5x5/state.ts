import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Minichess5x5Settings { questions: "10"; }
export interface Minichess5x5State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Minichess5x5Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Minichess 5×5 board?", choices: ["25 squares", "64", "36", "100"], correct: 0 },
  { question: "Famous designer?", choices: ["Martin Gardner", "Bobby Fischer", "Glinski", "Capablanca"], correct: 0 },
  { question: "Pieces per side (Gardner)?", choices: ["King, queen, rook, bishop, knight + 5 pawns", "16", "8", "32"], correct: 0 },
  { question: "Pawns: how many?", choices: ["5 (one per file)", "8", "16", "1"], correct: 0 },
  { question: "Pawn double-step at start?", choices: ["No (board too small)", "Yes", "Only on file e", "Only after capture"], correct: 0 },
  { question: "Castling?", choices: ["Forbidden", "Yes", "Only king-side", "Only queen-side"], correct: 0 },
  { question: "Game-theoretic value?", choices: ["Solved as draw / known result depending on rules", "White always wins", "Black always wins", "Stalemate"], correct: 0 },
  { question: "Promotion rank?", choices: ["5th rank", "8th rank", "1st", "Center"], correct: 0 },
  { question: "Best opening principle?", choices: ["Don't waste tempo — every move matters", "Push h-pawn", "Castle long", "Resign"], correct: 0 },
  { question: "Average game length?", choices: ["~20–30 moves", "100+", "200+", "5"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Minichess5x5Settings): Minichess5x5State {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Minichess5x5State, action: Minichess5x5Action): Minichess5x5State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Minichess5x5State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
