import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KyotoShogiQuizSettings { questions: "10"; }
export interface KyotoShogiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KyotoShogiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Kyoto Shogi is played on a", choices: ["5×5 board", "9×9 board", "7×7 board", "Hex"], correct: 0 },
  { question: "Pieces flip between", choices: ["Two different piece types each move", "One type only", "Random types", "Captured"], correct: 0 },
  { question: "The variant emphasizes", choices: ["Movement diversity through flipping", "Pure positional play", "Race tactics", "Drops only"], correct: 0 },
  { question: "Kyoto Shogi is named after", choices: ["Kyoto, Japan", "Tokyo", "Nara", "Yokohama"], correct: 0 },
  { question: "Number of pieces per side", choices: ["Five", "Twenty", "Forty", "One"], correct: 0 },
  { question: "The flip mechanic resembles", choices: ["Promotion happening every move", "Capture", "Castling", "Drops"], correct: 0 },
  { question: "Kyoto Shogi was created by", choices: ["Tamiya Katsuya", "Bobby Fischer", "V. R. Parton", "Reiner Knizia"], correct: 0 },
  { question: "Drops in Kyoto Shogi are", choices: ["Standard Shogi drops with flip mechanic", "Forbidden", "Required", "Reset"], correct: 0 },
  { question: "Game length is typically", choices: ["Short, sharp", "Always long", "Days", "Bullet only"], correct: 0 },
  { question: "Kyoto Shogi is classified as a", choices: ["Mini Shogi fairy variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },

  { question: "Each side starts with", choices: ["Five pieces (King, Tokin, Silver, Knight, Lance)", "Twenty pieces", "Two kings", "Pawns only"], correct: 0 },
  { question: "When a piece moves, it", choices: ["Flips to its paired piece type", "Stays the same", "Promotes only at end", "Captures itself"], correct: 0 },
  { question: "A dropped piece enters", choices: ["As one of the two paired sides (player choice)", "Always face up", "Always face down", "Captured"], correct: 0 },
  { question: "The Tokin pairs with", choices: ["Pawn", "Silver", "Knight", "King"], correct: 0 },
  { question: "The Silver pairs with", choices: ["Bishop", "Rook", "Pawn", "King"], correct: 0 },
  { question: "The Knight pairs with", choices: ["Gold", "Pawn", "King", "Lance"], correct: 0 },
  { question: "The Lance pairs with", choices: ["Rook (in many editions)", "Pawn", "King", "Knight"], correct: 0 },
  { question: "Kyoto Shogi designs are credited to", choices: ["Tamiya Katsuya in the 1970s", "Bobby Fischer", "V. R. Parton", "Reiner Knizia"], correct: 0 },
  { question: "The board has", choices: ["25 squares (5×5)", "49", "81", "64"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KyotoShogiQuizSettings): KyotoShogiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KyotoShogiQuizState, action: KyotoShogiQuizAction): KyotoShogiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KyotoShogiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
