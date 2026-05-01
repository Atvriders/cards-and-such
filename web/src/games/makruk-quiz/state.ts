import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MakrukQuizSettings { questions: "10"; }
export interface MakrukQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MakrukQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Makruk pieces include the", choices: ["Khun, Met, Khon, Ma, Ruea, Bia", "King, queen, bishop only", "Pawn, knight, rook only", "Standard FIDE plus dragon"], correct: 0 },
  { question: "The Met (queen-like piece) moves", choices: ["One square diagonally only", "Like FIDE queen", "Like a rook", "Like a knight"], correct: 0 },
  { question: "The Khon (bishop-like) moves", choices: ["One square diagonally or one forward", "Like a FIDE bishop", "Like a rook", "Like a knight"], correct: 0 },
  { question: "Pawns (Bia) start on", choices: ["Rank 3 (their third rank)", "Rank 2", "Rank 1", "Rank 4"], correct: 0 },
  { question: "Pawn promotion happens on", choices: ["Rank 6", "Rank 8", "Rank 4", "No promotion"], correct: 0 },
  { question: "Pawns promote to", choices: ["Met (the queen-like piece)", "Queen", "King", "Rook"], correct: 0 },
  { question: "Makruk is the national game of", choices: ["Thailand", "Japan", "China", "Korea"], correct: 0 },
  { question: "The board is", choices: ["8×8 (no light/dark color distinction in some versions)", "9×9", "10×10", "Hex"], correct: 0 },
  { question: "Castling in Makruk is", choices: ["Not present", "Required", "Standard", "Replaces promotion"], correct: 0 },
  { question: "Endgame play emphasizes", choices: ["Slow approach due to short-range pieces", "Race plays", "Drop tactics", "Pure pawn play"], correct: 0 },

  { question: "The Ma (knight-like) moves", choices: ["Like a FIDE knight (L-shape)", "Like a rook", "Like a king", "Diagonally only"], correct: 0 },
  { question: "The Ruea (rook-like) moves", choices: ["Like a FIDE rook", "One square only", "Diagonally", "Like a knight"], correct: 0 },
  { question: "The Khun (king) moves", choices: ["One square in any direction", "Two squares", "Like a queen", "Only diagonally"], correct: 0 },
  { question: "Counting rules trigger when", choices: ["One side has insufficient mating material", "Always at move 50", "Never", "On promotion"], correct: 0 },
  { question: "Pieces are traditionally", choices: ["Pyramidal cone-shaped wood", "Flat tiles with kanji", "Cards", "Glass orbs"], correct: 0 },
  { question: "Initial pawn move advances", choices: ["One square only (no two-step)", "Two squares", "Three squares", "Backward"], correct: 0 },
  { question: "Stalemate in Makruk is", choices: ["A draw", "A loss for stalemated side", "A win for stalemated side", "Forbidden"], correct: 0 },
  { question: "Makruk is also called", choices: ["Thai chess", "Chinese chess", "Burmese chess", "Japanese chess"], correct: 0 },
  { question: "The Met starts adjacent to the", choices: ["Khun (king)", "Ruea", "Edge", "Pawn"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MakrukQuizSettings): MakrukQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MakrukQuizState, action: MakrukQuizAction): MakrukQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MakrukQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
