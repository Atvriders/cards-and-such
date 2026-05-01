import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SittuyinQuizSettings { questions: "10"; }
export interface SittuyinQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SittuyinQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sittuyin opens with", choices: ["Players placing their pieces freely behind their pawns", "Standard FIDE setup", "Random shuffled pieces", "Empty board"], correct: 0 },
  { question: "The board is", choices: ["8×8", "9×9", "10×10", "Hex"], correct: 0 },
  { question: "The Sit-ke (queen-like) moves", choices: ["One square diagonally only", "Like FIDE queen", "Like a rook", "Like a knight"], correct: 0 },
  { question: "Pawns advance toward", choices: ["The diagonal of the player's color", "Rank 8 only", "Rank 4", "Center"], correct: 0 },
  { question: "Pawn promotion is", choices: ["To Sit-ke when reaching designated squares", "To queen", "Forbidden", "To king"], correct: 0 },
  { question: "Sittuyin is from", choices: ["Myanmar (Burma)", "Thailand", "China", "Korea"], correct: 0 },
  { question: "Players setup their pieces in", choices: ["A flexible placement phase before play", "Standard FIDE order", "Random shuffled", "Reserved positions"], correct: 0 },
  { question: "Castling in Sittuyin is", choices: ["Not present", "Required", "Standard", "Replaces promotion"], correct: 0 },
  { question: "The Yathei (rook-like) moves like a", choices: ["FIDE rook", "Bishop", "Pawn", "King"], correct: 0 },
  { question: "Sittuyin is classified as a", choices: ["Regional Asian chess variant", "FIDE rule", "Race game", "Card variant"], correct: 0 },

  { question: "The Sittuyin board has pre-drawn", choices: ["Diagonal lines marking pawn promotion squares", "A river", "Palaces", "Hex cells"], correct: 0 },
  { question: "The Min Gyi is the", choices: ["King piece", "Pawn", "Rook", "Bishop"], correct: 0 },
  { question: "The Sin (elephant) moves", choices: ["One square diagonally or one forward", "Like FIDE bishop", "Two squares jumping", "Like a rook"], correct: 0 },
  { question: "The Myin (horse) moves", choices: ["Like a FIDE knight", "Like a rook", "One square", "Diagonally only"], correct: 0 },
  { question: "Sittuyin pawn promotion requires", choices: ["The Sit-ke to be off the board first", "Reaching last rank", "Capturing a queen", "Nothing"], correct: 0 },
  { question: "A promoted pawn is placed", choices: ["On any empty square the player chooses", "On the promotion square", "Off-board", "Adjacent to king"], correct: 0 },
  { question: "Pieces are traditionally", choices: ["Three-dimensional carved wood", "Flat kanji tiles", "Cards", "Glass disks"], correct: 0 },
  { question: "Stalemate in Sittuyin is generally", choices: ["A draw", "A win for stalemated side", "A loss for the king", "Forbidden"], correct: 0 },
  { question: "Sittuyin literally means", choices: ["\"Game of generals\" in Burmese", "Lion game", "Tiger chess", "River chess"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SittuyinQuizSettings): SittuyinQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SittuyinQuizState, action: SittuyinQuizAction): SittuyinQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SittuyinQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
