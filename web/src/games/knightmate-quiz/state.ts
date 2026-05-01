import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KnightmateQuizSettings { questions: "10"; }
export interface KnightmateQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KnightmateQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Knightmate is a chess variant where", choices: ["Each side has a royal knight (mann) instead of a king", "Each side has two queens", "Pieces are removed", "Pawns are doubled"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, the king is replaced by", choices: ["A piece called the mann (or royal knight)", "An archbishop", "A queen", "A pawn"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, the knights become", choices: ["The royal pieces that must not be checkmated", "Pawns", "Queens", "Bishops"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate is played on", choices: ["A standard 8x8 chessboard", "A 6x6 board", "A 10x10 board", "A hex grid"] as [string, string, string, string], correct: 0 },
  { question: "The mann moves like", choices: ["A king (one square in any direction)", "A knight", "A rook", "A bishop"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, knights checkmate the mann", choices: ["Yes; if the mann is in checkmate by knight, the side loses", "No; knights are powerless", "Only with bishops", "Only via promotion"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate was invented by", choices: ["Bruce Zimov", "Bobby Fischer", "Sid Sackson", "Reiner Knizia"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, knights move", choices: ["Like standard knights (L-shaped)", "Like queens", "Like rooks", "Like bishops"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate's appeal is in", choices: ["The unusual royal piece dynamics", "Pure pawn race", "Card draws", "Auctions"] as [string, string, string, string], correct: 0 },
  { question: "Castling in Knightmate", choices: ["May or may not be allowed depending on the rule set", "Is mandatory", "Is forbidden", "Uses three rooks"] as [string, string, string, string], correct: 0 },
  { question: "Pawn promotion in Knightmate is to", choices: ["Standard pieces (queen, rook, bishop, knight)", "Mann", "Pawn", "King"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate's name reflects", choices: ["The knight's role as the royal piece", "Knights only winning", "A pun on knighthood", "The board shape"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, the mann's mobility is", choices: ["Limited like a king", "Like a queen", "Like a knight", "Unlimited"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate emphasizes", choices: ["Handling knight royalty and mann safety", "Pawn races", "Bishop pairs", "Rook coordination"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate has been played", choices: ["Among chess variant enthusiasts and online", "At FIDE championships", "Only by computers", "On stage"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, both sides start with", choices: ["Sixteen pieces in the standard back-rank arrangement (with mann replacing king)", "Eight pieces", "Twenty pieces", "Twelve pieces"] as [string, string, string, string], correct: 0 },
  { question: "If the mann is captured directly", choices: ["This is illegal in standard rules; checkmate ends the game", "The captures continue", "The game restarts", "It promotes"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate's tactical themes include", choices: ["Knight forks against the mann", "Card-based tactics", "Dice-based tactics", "Auction tactics"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate was first published in", choices: ["The mid-20th century by chess variant communities", "1900s online", "Ancient Egypt", "Modern e-sports"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate's official rules are documented at", choices: ["Chess Variants websites and books", "FIDE rules", "Olympic rules", "Card game rules"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate's color rules", choices: ["Allow standard light and dark square play", "Reverse colors", "Use four colors", "Use no colors"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, en passant", choices: ["Applies normally", "Is forbidden", "Is doubled", "Is reversed"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate's strategic complexity comes from", choices: ["Mann's vulnerability and knight's increased value", "Dice rolls", "Card draws", "Bidding"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, two knights against a mann", choices: ["Can deliver checkmate (unlike king vs. two knights)", "Cannot mate", "Always draw", "Are illegal"] as [string, string, string, string], correct: 0 },
  { question: "In Knightmate, pawn structure", choices: ["Still matters as in standard chess", "Doesn't matter", "Is reversed", "Has no impact"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate is a", choices: ["Chess variant with role-swapping pieces", "Card game", "Race game", "Trick-taking game"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate gives the knight value of", choices: ["Approximately equal to a king's role", "Zero", "Equal to a pawn", "Negative"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate's openings", choices: ["Differ from standard chess due to mann's reduced power", "Are identical to standard chess", "Don't exist", "Use cards"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate's appeal is that it", choices: ["Tests knight handling skills", "Tests memorization", "Tests dice luck", "Tests card play"] as [string, string, string, string], correct: 0 },
  { question: "Knightmate is often played", choices: ["Online via Chess Variants platforms", "FIDE-only", "Olympic events", "Postal chess only"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KnightmateQuizSettings): KnightmateQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KnightmateQuizState, action: KnightmateQuizAction): KnightmateQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KnightmateQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
