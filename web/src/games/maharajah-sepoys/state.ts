import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MaharajahSepoysSettings { questions: "10"; }
export interface MaharajahSepoysState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MaharajahSepoysAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Maharajah moves like a", choices: ["Queen plus knight (amazon)", "Pawn", "Rook only", "Bishop only"], correct: 0 },
  { question: "The Sepoys are", choices: ["A standard 16-piece chess army", "Eight pawns only", "Two knights", "Three queens"], correct: 0 },
  { question: "The Sepoy goal is to", choices: ["Checkmate the Maharajah", "Capture all pawns", "Promote", "Take the rook"], correct: 0 },
  { question: "The Maharajah wins by", choices: ["Capturing the Sepoy king", "Promoting", "Reaching rank 8", "Checking 3 times"], correct: 0 },
  { question: "Number of Maharajah pieces", choices: ["1", "2", "8", "16"], correct: 0 },
  { question: "The Sepoys' main weapon is", choices: ["Coordinated piece-play surrounding the Maharajah", "Sole rook", "Lone king", "Bishops alone"], correct: 0 },
  { question: "With perfect play this game", choices: ["Favors the Sepoys (full army wins)", "Favors the Maharajah always", "Is always a draw", "Cannot end"], correct: 0 },
  { question: "Castling for Sepoys is", choices: ["Standard chess castling", "Disabled", "Required move 1", "Replaces king"], correct: 0 },
  { question: "Origin of the variant", choices: ["Indian colonial-era pastime", "Modern internet creation", "FIDE-sanctioned 1924", "Russian school"], correct: 0 },
  { question: "Best Sepoy strategy", choices: ["Restrict the Maharajah's squares; avoid fork ranges", "Push king up the board", "Trade everything", "Solo queen attack"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MaharajahSepoysSettings): MaharajahSepoysState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MaharajahSepoysState, action: MaharajahSepoysAction): MaharajahSepoysState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MaharajahSepoysState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
