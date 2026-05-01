import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LosingChessQuizSettings { questions: "10"; }
export interface LosingChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LosingChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Losing Chess is also called", choices: ["Antichess or Suicide Chess", "Speed Chess", "Bullet Chess", "King-of-the-Hill"] as [string, string, string, string], correct: 0 },
  { question: "In Losing Chess, the goal is to", choices: ["Lose all your pieces or be stalemated", "Checkmate the opponent", "Promote first", "Castle quickly"] as [string, string, string, string], correct: 0 },
  { question: "Captures in Losing Chess are", choices: ["Mandatory if available", "Optional", "Forbidden", "Only on diagonals"] as [string, string, string, string], correct: 0 },
  { question: "If multiple captures are available, you", choices: ["May choose any", "Must take the first listed", "Must take the highest value", "Cannot capture"] as [string, string, string, string], correct: 0 },
  { question: "The king in Losing Chess", choices: ["Has no special check or castling status", "Must castle on move 10", "Cannot move", "Promotes to queen"] as [string, string, string, string], correct: 0 },
  { question: "Pawns may promote to", choices: ["Any piece including a king in many rule sets", "Only queen", "Only rook", "Only knight"] as [string, string, string, string], correct: 0 },
  { question: "Losing Chess was solved by", choices: ["Mark Watkins in 2016, showing it as a White win", "Claude Shannon", "Garry Kasparov", "AlphaZero"] as [string, string, string, string], correct: 0 },
  { question: "The first move in solved Losing Chess that wins for White is", choices: ["1. e3", "1. e4", "1. d4", "1. Nf3"] as [string, string, string, string], correct: 0 },
  { question: "Stalemate in Losing Chess is", choices: ["A win for the stalemated player", "A loss", "A draw", "Reversed"] as [string, string, string, string], correct: 0 },
  { question: "Losing Chess is popular on", choices: ["Lichess and other online sites", "OTB tournaments", "Cardrooms", "Casino floors"] as [string, string, string, string], correct: 0 },
  { question: "In Losing Chess, en passant", choices: ["Is generally allowed and may be forced", "Is removed", "Counts as two captures", "Is illegal"] as [string, string, string, string], correct: 0 },
  { question: "If you have no pieces left first, you", choices: ["Win the game", "Lose the game", "Draw", "Promote"] as [string, string, string, string], correct: 0 },
  { question: "In Losing Chess, the king cannot be checked because", choices: ["Check rules are removed; the king can be captured normally", "Kings are immortal", "Kings castle automatically", "There are no kings"] as [string, string, string, string], correct: 0 },
  { question: "Losing Chess is a", choices: ["Mis\u00e8re variant of chess", "Standard variant", "Hex variant", "Card variant"] as [string, string, string, string], correct: 0 },
  { question: "On Lichess, Losing Chess is called", choices: ["Antichess", "Crazyhouse", "Atomic", "King-of-the-Hill"] as [string, string, string, string], correct: 0 },
  { question: "In Losing Chess, the bishop's color rule", choices: ["Doesn't matter for promotion", "Restricts promotion", "Is reversed", "Limits captures"] as [string, string, string, string], correct: 0 },
  { question: "Promoting to king in Losing Chess gives the king", choices: ["Standard king moves with no special restrictions", "Queen moves", "Knight moves", "No moves"] as [string, string, string, string], correct: 0 },
  { question: "If two players both run out of pieces", choices: ["This cannot happen because captures are forced", "It's a draw", "Both win", "Both lose"] as [string, string, string, string], correct: 0 },
  { question: "Losing Chess strategy emphasizes", choices: ["Forcing captures that hurt the opponent", "Avoiding all moves", "Trading queens", "Building a fortress"] as [string, string, string, string], correct: 0 },
  { question: "Solving Losing Chess took how many years?", choices: ["Decades of analysis culminating in 2016", "Days", "Months", "Centuries"] as [string, string, string, string], correct: 0 },
  { question: "In Losing Chess, sacrifices", choices: ["Are common because losing material helps you", "Are forbidden", "Cost time", "Trigger explosions"] as [string, string, string, string], correct: 0 },
  { question: "Losing Chess is generally played at", choices: ["Fast time controls online", "Long classical times only", "Without clocks", "By correspondence only"] as [string, string, string, string], correct: 0 },
  { question: "Castling in Losing Chess is", choices: ["Not permitted (no special king rules)", "Mandatory", "Free", "Allowed once per game"] as [string, string, string, string], correct: 0 },
  { question: "The complexity of Losing Chess made it harder than", choices: ["Some standard chess endgames to solve", "Tic-tac-toe only", "Checkers only", "Connect Four only"] as [string, string, string, string], correct: 0 },
  { question: "In some Losing Chess variants, promotion to", choices: ["A king is allowed and creates dual kings", "Pawn is allowed", "Two queens at once is allowed", "No promotion"] as [string, string, string, string], correct: 0 },
  { question: "Forced capture rules originated", choices: ["From traditional chess variants in the 19th century", "In 2010", "From Shogi", "From Xiangqi"] as [string, string, string, string], correct: 0 },
  { question: "Losing Chess is a", choices: ["Combinatorial perfect-information game", "Bluffing game", "Card game", "Dice game"] as [string, string, string, string], correct: 0 },
  { question: "Mark Watkins's solution used", choices: ["A combination of computer search and analysis", "Pure manual analysis", "AlphaZero only", "A neural net only"] as [string, string, string, string], correct: 0 },
  { question: "In Losing Chess, draws are possible by", choices: ["Threefold repetition or insufficient material in some rule sets", "Always impossible", "Only via stalemate of both", "King-vs-king alone"] as [string, string, string, string], correct: 0 },
  { question: "The 'best move always must capture' rule means", choices: ["You cannot make a quiet move when a capture exists", "You can ignore captures", "You can swap pieces", "Captures cost time"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LosingChessQuizSettings): LosingChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LosingChessQuizState, action: LosingChessQuizAction): LosingChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LosingChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
