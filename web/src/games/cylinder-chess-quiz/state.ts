import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CylinderChessQuizSettings { questions: "10"; }
export interface CylinderChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CylinderChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Cylinder chess, the board is treated as if", choices: ["The a-file and h-file are joined into a cylinder", "Rank 1 and rank 8 are joined", "All four edges wrap", "The board is hexagonal"], correct: 0 },
  { question: "A rook on a4 can therefore", choices: ["Travel rightward off h4 and reappear on a4 from the other side", "Only move within the original 8x8", "Jump like a knight", "Move backwards only"], correct: 0 },
  { question: "Bishops in Cylinder chess can", choices: ["Wrap diagonally around the side edges", "Only move on light squares", "Move like rooks", "Not move at all"], correct: 0 },
  { question: "The top and bottom edges (ranks 1 and 8)", choices: ["Are NOT connected — only the side files wrap", "Are also wrapped (toroidal board)", "Are removed", "Allow only pawns"], correct: 0 },
  { question: "Pawns in Cylinder chess capture", choices: ["Diagonally, including across the wrap when applicable", "Only straight ahead", "Only on the central files", "Backwards"], correct: 0 },
  { question: "Castling in Cylinder chess is", choices: ["Generally allowed but the king's path still must be safe", "Forbidden", "Done with the queen", "Required every game"], correct: 0 },
  { question: "Knights in Cylinder chess", choices: ["Also wrap around the side edges in their L-shaped jumps", "Cannot wrap — they only move within 8 files", "Move like bishops", "Move only one square"], correct: 0 },
  { question: "A queen on d4 has", choices: ["More attacking squares than in standard chess due to wrap-around lines", "Fewer squares", "The same exact reach", "No attacking squares at all"], correct: 0 },
  { question: "A common Cylinder chess tactic is", choices: ["Surprise attacks by pieces wrapping behind the enemy king", "Slow pawn pushes", "Quiet maneuvering", "Avoiding the center"], correct: 0 },
  { question: "The variant is sometimes called", choices: ["Anchor-ring chess (a related toroidal cousin) or just Cylinder Chess", "Antichess", "Atomic Chess", "Bughouse"], correct: 0 },
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
