import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FogOfWarQuizSettings { questions: "10"; }
export interface FogOfWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FogOfWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Fog of War chess is a variant where", choices: ["Players cannot see the opponent's pieces", "All pieces are hidden", "There is no king", "Cards replace pieces"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War is also known as", choices: ["Dark chess or Hide-and-Seek chess", "Speed chess", "King-of-the-Hill", "Chess960"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, a player sees", choices: ["Their own pieces and squares attacked or occupied by their pieces", "All pieces", "Only the king", "Only pawns"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War is played on", choices: ["A standard 8x8 chessboard", "A 10x10 board", "A hex grid", "A 6x6 board"] as [string, string, string, string], correct: 0 },
  { question: "Capturing the king in Fog of War", choices: ["Wins the game (no checkmate; the king can be taken directly)", "Doesn't end the game", "Promotes the king", "Resets the board"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War rules", choices: ["Reveal pieces only when they enter your line of sight", "Show all pieces always", "Hide your own pieces too", "Show pieces only at game end"] as [string, string, string, string], correct: 0 },
  { question: "Common Fog of War platforms include", choices: ["Chess.com and Lichess", "Only physical boards", "Only Mahjong sites", "No platforms"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, you may make a move that", choices: ["Lands on your own piece because you don't see opponent pieces", "Captures only enemy pieces", "Splits in half", "Promotes immediately"] as [string, string, string, string], correct: 0 },
  { question: "Castling in Fog of War is", choices: ["Allowed normally with standard restrictions", "Forbidden", "Mandatory", "Reversed"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, opponents may", choices: ["Move pieces secretly without your knowledge", "Always see your moves", "Only move pawns", "Skip turns"] as [string, string, string, string], correct: 0 },
  { question: "If your move attempts an illegal capture due to hidden pieces", choices: ["The game informs you and you must select another move", "The move is forced through", "You lose the game", "The opponent wins"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War rewards", choices: ["Anticipation, scouting moves, and careful piece deployment", "Memorization of openings", "Random play", "Card counting"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, a check on your king", choices: ["Is sometimes invisible until you attempt a wrong move", "Is always visible", "Cannot occur", "Auto-resolves"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War uses", choices: ["Hidden information, unlike standard chess", "Perfect information", "Cards", "Dice"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War's strategy involves", choices: ["Deduction about opponent moves", "Pure brute-force calculation", "Card draws", "Pure luck"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, pawns capture diagonally", choices: ["As in standard chess (when you can see the target)", "Only forward", "In any direction", "Cannot capture"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War is sometimes called", choices: ["Dark chess in chess variant communities", "Speed chess", "Bullet chess", "Auction chess"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, scouting refers to", choices: ["Sending pieces to reveal portions of the board", "Sending all pieces forward", "Hiding pieces", "Skipping turns"] as [string, string, string, string], correct: 0 },
  { question: "Computers playing Fog of War need", choices: ["Probabilistic reasoning over hidden information", "Standard chess engines unchanged", "Card counters", "Dice probability"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War games typically last", choices: ["Slightly longer than standard games due to information uncertainty", "Much shorter", "The same length", "No length"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War is part of the family of", choices: ["Imperfect-information chess variants", "Race games", "Card games", "Auction games"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, the king is", choices: ["The most important piece (must be protected from capture)", "Removed", "Replaced by a queen", "Doubled"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War combines", choices: ["Chess with elements of hidden-information games like Stratego", "Chess with card games", "Chess with Mancala", "Chess with Go"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, en passant", choices: ["Applies but the opponent's pawn move may be invisible", "Is removed", "Is doubled", "Is reversed"] as [string, string, string, string], correct: 0 },
  { question: "If a piece is captured in Fog of War, the player whose piece was captured", choices: ["Sees the capture and the capturer's piece", "Doesn't see anything", "Loses the game", "Promotes a piece"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War helps players develop", choices: ["Intuition and memory of opponent likely positions", "Pure tactical calculation", "Card counting", "Auction skills"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War is less popular than standard chess but", choices: ["Has a dedicated following on online platforms", "Has no following", "Is FIDE-mandated", "Is Olympic"] as [string, string, string, string], correct: 0 },
  { question: "In Fog of War, the visibility region", choices: ["Updates each turn as pieces move", "Is fixed", "Is random", "Doesn't exist"] as [string, string, string, string], correct: 0 },
  { question: "If you cannot make any visible legal move in Fog of War", choices: ["The result depends on the rule set (often loss or stalemate)", "You always win", "You always draw", "You always lose"] as [string, string, string, string], correct: 0 },
  { question: "Fog of War's appeal is", choices: ["The novel mix of chess strategy and bluff/deduction", "Pure memorization", "Pure luck", "Card play"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FogOfWarQuizSettings): FogOfWarQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FogOfWarQuizState, action: FogOfWarQuizAction): FogOfWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FogOfWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
