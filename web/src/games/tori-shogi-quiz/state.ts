import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ToriShogiQuizSettings { questions: "10"; }
export interface ToriShogiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ToriShogiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tori Shogi is played on a", choices: ["7×7 board", "9×9 board", "8×8 board", "Hex grid"], correct: 0 },
  { question: "The pieces are named after", choices: ["Birds (phoenix, crane, crow, etc.)", "Castle types", "Standard chess", "Modern military"], correct: 0 },
  { question: "The Phoenix is the", choices: ["King-equivalent piece", "Pawn", "Knight", "Rook"], correct: 0 },
  { question: "Drops follow", choices: ["Standard Shogi drop rules", "No drops", "Always required", "Forbidden"], correct: 0 },
  { question: "Designer of Tori Shogi", choices: ["Toyota Genryu (1828)", "Bobby Fischer", "V. R. Parton", "Reiner Knizia"], correct: 0 },
  { question: "The variant is", choices: ["Compact and fast", "Long and slow", "Race-only", "Drop-only"], correct: 0 },
  { question: "Promotion happens in", choices: ["The opponent's nearest ranks", "Rank 1", "Center", "No promotion"], correct: 0 },
  { question: "Tori Shogi was reconstructed in", choices: ["The 19th century", "2000s", "1500s", "Heian era"], correct: 0 },
  { question: "The Crane and Crow pieces are", choices: ["Distinct piece types", "Same", "Pawns", "Kings"], correct: 0 },
  { question: "Tori Shogi is classified as a", choices: ["Themed Shogi variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },

  { question: "The board is", choices: ["7 files × 7 ranks (49 squares)", "5×5", "9×9", "8×8"], correct: 0 },
  { question: "Each side starts with", choices: ["16 pieces", "20 pieces", "8 pieces", "40 pieces"], correct: 0 },
  { question: "The Swallow piece is the", choices: ["Pawn-equivalent", "King", "Rook", "Knight"], correct: 0 },
  { question: "The Falcon moves", choices: ["Like a Silver General with extra moves", "Like a rook", "Diagonally only", "Backward only"], correct: 0 },
  { question: "The Quail pieces have", choices: ["Asymmetric moves (left/right different)", "Identical moves", "No moves", "Random moves"], correct: 0 },
  { question: "Drop rule for Swallow follows", choices: ["Standard nifu (no two on a file)", "No restriction", "Free drop", "Forbidden"], correct: 0 },
  { question: "Tori Shogi means", choices: ["\"Bird Shogi\" in Japanese", "River Shogi", "Castle Shogi", "Mini Shogi"], correct: 0 },
  { question: "The Phoenix moves like a", choices: ["Standard Shogi king (one square any direction)", "Queen", "Rook", "Knight"], correct: 0 },
  { question: "Tori Shogi is enjoyed for", choices: ["Compact, sharp tactical play", "Long endgames", "Pure luck", "Card draws"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ToriShogiQuizSettings): ToriShogiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ToriShogiQuizState, action: ToriShogiQuizAction): ToriShogiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ToriShogiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
