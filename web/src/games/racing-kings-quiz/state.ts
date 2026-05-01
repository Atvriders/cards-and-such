import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RacingKingsQuizSettings { questions: "10"; }
export interface RacingKingsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RacingKingsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Racing Kings, the goal is to", choices: ["Be the first king to reach the eighth rank", "Checkmate the opponent", "Promote first", "Capture all pieces"] as [string, string, string, string], correct: 0 },
  { question: "Racing Kings is played on", choices: ["A standard 8x8 chessboard", "A 6x6 board", "A 10x10 board", "A hex grid"] as [string, string, string, string], correct: 0 },
  { question: "In Racing Kings, check is", choices: ["Forbidden; no move may give check", "Allowed", "Required", "Optional"] as [string, string, string, string], correct: 0 },
  { question: "The starting position of Racing Kings has", choices: ["All pieces on the first two ranks (no pawns)", "A standard chess setup", "Random placement", "Pieces in the center"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in Racing Kings are", choices: ["Removed entirely from the game", "On the second rank", "On the seventh rank", "Promoted at start"] as [string, string, string, string], correct: 0 },
  { question: "If both kings reach the eighth rank in the same move sequence", choices: ["Black gets a chance to equalize, otherwise it is a draw", "White wins automatically", "Black wins automatically", "Both lose"] as [string, string, string, string], correct: 0 },
  { question: "White's king starts on", choices: ["a1 in standard Racing Kings", "e1", "d1", "h1"] as [string, string, string, string], correct: 0 },
  { question: "Racing Kings was popularized on", choices: ["Lichess as a variant", "Chess.com only", "Over-the-board mainly", "Postal chess"] as [string, string, string, string], correct: 0 },
  { question: "Castling in Racing Kings is", choices: ["Not allowed; the king must race", "Mandatory", "Free", "Allowed once"] as [string, string, string, string], correct: 0 },
  { question: "If a player gives check, the move is", choices: ["Illegal", "Legal", "Optional", "Required"] as [string, string, string, string], correct: 0 },
  { question: "If a player has no legal move (all moves give check), the result is", choices: ["Stalemate (draw or follows variant rules)", "Win for stalemated player", "Loss for stalemated player", "Reset"] as [string, string, string, string], correct: 0 },
  { question: "In Racing Kings, the king is", choices: ["The piece that must reach the goal rank", "Removed at start", "Replaced by a queen", "Sacrificed"] as [string, string, string, string], correct: 0 },
  { question: "Pieces other than the king in Racing Kings", choices: ["Move and capture as in standard chess", "Cannot move", "Move like checkers", "Are limited to two squares"] as [string, string, string, string], correct: 0 },
  { question: "Racing Kings is one of several", choices: ["Chess variants with non-standard goals", "Card games", "Dice games", "Trick-taking games"] as [string, string, string, string], correct: 0 },
  { question: "The black king starts on", choices: ["a2 typically (mirroring White on a1)", "h8", "e8", "d8"] as [string, string, string, string], correct: 0 },
  { question: "Racing Kings is a", choices: ["Race-based combinatorial game", "Bluffing game", "Auction game", "Card game"] as [string, string, string, string], correct: 0 },
  { question: "Knights in Racing Kings", choices: ["Move as in standard chess", "Cannot leap pieces", "Move like rooks", "Are removed"] as [string, string, string, string], correct: 0 },
  { question: "A common strategy is to", choices: ["Develop the king toward the eighth rank quickly while blocking the opponent", "Trade queens immediately", "Castle", "Promote pieces"] as [string, string, string, string], correct: 0 },
  { question: "If both kings reach the goal at the end of the same turn pair", choices: ["The result is a draw (Black's turn balances)", "White wins", "Black wins", "It is replayed"] as [string, string, string, string], correct: 0 },
  { question: "Black has a slight disadvantage because", choices: ["White moves first toward the eighth rank", "Black's king is heavier", "Black has fewer pieces", "Black cannot castle"] as [string, string, string, string], correct: 0 },
  { question: "Racing Kings forbids", choices: ["Any move that places either king in check", "Diagonal moves", "Knight moves", "Pawn promotion"] as [string, string, string, string], correct: 0 },
  { question: "If you cannot move your king without checking, you", choices: ["Move another piece if legal, else it's stalemate", "Lose immediately", "Win automatically", "Promote"] as [string, string, string, string], correct: 0 },
  { question: "On Lichess, Racing Kings games are usually played at", choices: ["Fast time controls", "Classical only", "Without clocks", "Correspondence only"] as [string, string, string, string], correct: 0 },
  { question: "If White's king reaches the eighth rank and Black's king is one move away", choices: ["Black gets a final move; if it ties, the game is a draw", "Black loses", "Black wins", "Black promotes"] as [string, string, string, string], correct: 0 },
  { question: "In Racing Kings, queens are", choices: ["Used aggressively to block or escort", "Removed", "Demoted", "Frozen"] as [string, string, string, string], correct: 0 },
  { question: "Racing Kings has elements of", choices: ["A board race in addition to tactical play", "Trick-taking", "Auction", "Worker placement"] as [string, string, string, string], correct: 0 },
  { question: "If a king has no legal forward path due to opponent threats, the player", choices: ["Must reroute or block", "Skips the turn", "Loses the king", "Resets"] as [string, string, string, string], correct: 0 },
  { question: "The minimum number of moves to win is", choices: ["Eight in theory but rarely achievable", "Two", "One", "Twenty"] as [string, string, string, string], correct: 0 },
  { question: "If neither king reaches the eighth rank, the game is", choices: ["A draw by stalemate or repetition", "Won by White", "Won by Black", "Replayed"] as [string, string, string, string], correct: 0 },
  { question: "Racing Kings emphasizes", choices: ["King mobility and tempo", "Pawn structure", "Knight outposts", "Rook coordination"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RacingKingsQuizSettings): RacingKingsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RacingKingsQuizState, action: RacingKingsQuizAction): RacingKingsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RacingKingsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
