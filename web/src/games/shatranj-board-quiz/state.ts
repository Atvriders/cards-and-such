import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShatranjBoardQuizSettings { questions: "10"; }
export interface ShatranjBoardQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShatranjBoardQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Shatranj is the predecessor of", choices: ["Modern chess", "Backgammon", "Mancala", "Go"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj originated in", choices: ["Persia, evolving from Indian chaturanga", "China", "Japan", "Egypt"] as [string, string, string, string], correct: 0 },
  { question: "The Shatranj board is", choices: ["8x8, like modern chess", "9x9", "10x10", "A hex grid"] as [string, string, string, string], correct: 0 },
  { question: "In Shatranj, the queen is replaced by", choices: ["The Ferz, which moves one square diagonally", "Two queens", "A general", "A knight"] as [string, string, string, string], correct: 0 },
  { question: "In Shatranj, the bishop is replaced by", choices: ["The Alfil, which jumps two squares diagonally", "A second knight", "A pawn", "A rook"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj pieces include", choices: ["Shah, Ferz, Alfil, Faras, Rukh, and Baidaq", "King, Queen, Bishop, Knight, Rook, Pawn", "Just kings", "Just pawns"] as [string, string, string, string], correct: 0 },
  { question: "The Shah is the equivalent of", choices: ["The king in modern chess", "The queen", "The bishop", "The pawn"] as [string, string, string, string], correct: 0 },
  { question: "The Faras moves like", choices: ["A modern chess knight", "A pawn", "A bishop", "A rook"] as [string, string, string, string], correct: 0 },
  { question: "The Rukh moves like", choices: ["A modern chess rook", "A pawn", "A bishop", "A knight"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in Shatranj (Baidaq)", choices: ["Move and capture much like modern chess pawns but only one square forward", "Move two squares always", "Move backward", "Capture sideways"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj was played in", choices: ["The Islamic Golden Age, 7th-15th centuries", "The 20th century", "Ancient Egypt", "Modern Europe"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj's win conditions include", choices: ["Checkmate, stalemate (counts as a win), and bare king (capturing all pieces)", "Three checks", "Promotion", "Reaching eighth rank"] as [string, string, string, string], correct: 0 },
  { question: "Bare king in Shatranj means", choices: ["Capturing all opposing pieces except the king is a win", "The king starts naked", "The king has no clothes", "A draw condition"] as [string, string, string, string], correct: 0 },
  { question: "Stalemate in Shatranj is", choices: ["A win for the stalemating side", "A draw", "A loss for the stalemating side", "Reset"] as [string, string, string, string], correct: 0 },
  { question: "Castling did not exist in Shatranj because", choices: ["The rule was a later European invention in the 15th century", "Castles were not allowed", "Kings could fly", "Pieces moved differently"] as [string, string, string, string], correct: 0 },
  { question: "The Ferz movement (one square diagonally) made it", choices: ["A weak piece compared to the modern queen", "A stronger piece than the queen", "Equal to a knight", "A pawn"] as [string, string, string, string], correct: 0 },
  { question: "The Alfil jump made it", choices: ["Confined to only eight squares of the board", "Stronger than a modern bishop", "Like a queen", "Like a king"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj was a popular pastime among", choices: ["Caliphs and scholars in the Abbasid era", "Roman gladiators", "Vikings", "Aztec kings"] as [string, string, string, string], correct: 0 },
  { question: "The earliest written Shatranj problems are called", choices: ["Mansubat", "Endgame studies", "Tabiyat", "Both A and C are correct names"] as [string, string, string, string], correct: 0 },
  { question: "Famous Shatranj players included", choices: ["As-Suli, who wrote a treatise on the game", "Bobby Fischer", "Garry Kasparov", "Magnus Carlsen"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj traveled westward from Persia to", choices: ["Europe via Spain (Andalusia) and Sicily", "China only", "South America", "The Pacific Islands"] as [string, string, string, string], correct: 0 },
  { question: "The transition from Shatranj to modern chess featured", choices: ["Stronger pieces (queen and bishop) and pawn double-step", "Smaller boards", "New colors only", "Weaker queens"] as [string, string, string, string], correct: 0 },
  { question: "In Shatranj, the queen was promoted only when", choices: ["A pawn reached the last rank (became a Ferz)", "On the seventh rank", "Mid-game", "Anytime"] as [string, string, string, string], correct: 0 },
  { question: "The Ferz promotion was weaker than modern queening because", choices: ["The Ferz only moved diagonally one square", "Promotion did not exist", "Pawns disappeared", "Pieces multiplied"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj's name is derived from", choices: ["The Sanskrit word chaturanga (four divisions)", "Arabic for war", "Persian for king", "Latin for play"] as [string, string, string, string], correct: 0 },
  { question: "In modern terms, Shatranj is", choices: ["Mostly an endgame study tradition with original opening setups", "An entirely different game", "A card game", "A dice game"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj problems often involve", choices: ["Forcing checkmate in a given number of moves", "Building structures", "Capturing flags", "Promoting first"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj is now mainly played by", choices: ["History enthusiasts and chess variant fans", "Tournament chess players", "Children only", "Computer programs only"] as [string, string, string, string], correct: 0 },
  { question: "In Shatranj, the king is", choices: ["Important and is the focus of checkmate, but also vulnerable to bare-king loss", "Removed", "Free to move two squares", "Replaceable"] as [string, string, string, string], correct: 0 },
  { question: "Shatranj remains historically significant as", choices: ["The link between chaturanga and modern chess", "The first card game", "The first dice game", "A football precursor"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ShatranjBoardQuizSettings): ShatranjBoardQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShatranjBoardQuizState, action: ShatranjBoardQuizAction): ShatranjBoardQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShatranjBoardQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
