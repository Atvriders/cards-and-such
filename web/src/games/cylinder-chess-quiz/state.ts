import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CylinderChessQuizSettings { questions: "10"; }
export interface CylinderChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CylinderChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Cylinder chess wraps", choices: ["The a- and h-files (left-right edges)", "Top and bottom", "Both directions", "Diagonally"], correct: 0 },
  { question: "A rook on a-file can move to", choices: ["h-file by going 'past the edge'", "Only forward", "Only backward", "Random rank"], correct: 0 },
  { question: "Bishops gain", choices: ["New long diagonals that wrap around", "Nothing — bishops play normally", "Less power", "Drop ability"], correct: 0 },
  { question: "Pawns in Cylinder Chess", choices: ["Move forward as in standard chess", "Wrap files like rooks", "Promote anywhere", "Capture all directions"], correct: 0 },
  { question: "Castling rules are", choices: ["Standard chess castling", "Forbidden", "Required", "Replaces promotion"], correct: 0 },
  { question: "The variant deepens", choices: ["Diagonal and rank attacks dramatically", "Pure pawn play", "Endgame theory", "Knight maneuvers"], correct: 0 },
  { question: "The h- and a-files become", choices: ["Identical (adjacent) due to wrapping", "Locked", "Removed", "Random"], correct: 0 },
  { question: "Cylinder Chess is classified as", choices: ["A topology-based fairy variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },
  { question: "Players are", choices: ["Two", "Four", "One", "Three"], correct: 0 },
  { question: "Strategically, the variant", choices: ["Heavily favors attacking play", "Always favors black", "Always draws", "Always favors king-side"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CylinderChessQuizSettings): CylinderChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CylinderChessQuizState, action: CylinderChessQuizAction): CylinderChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CylinderChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
