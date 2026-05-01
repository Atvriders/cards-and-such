import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThreeCheckQuizSettings { questions: "10"; }
export interface ThreeCheckQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThreeCheckQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Three-Check chess, you win by", choices: ["Delivering check three times", "Checkmating", "Capturing the queen", "Promoting first"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check is played on", choices: ["A standard 8x8 chessboard", "A 6x6 board", "A hex grid", "A 10x10 board"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, regular checkmate", choices: ["Is also a win, in addition to three checks", "Is not possible", "Is not a win", "Counts as two checks"] as [string, string, string, string], correct: 0 },
  { question: "Each check counts as", choices: ["One progress point toward the three-check goal", "One captured piece", "One pawn promotion", "One time penalty"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check is popular on", choices: ["Lichess as a variant", "Postal chess only", "Chess960 events only", "Casino floors"] as [string, string, string, string], correct: 0 },
  { question: "Castling in Three-Check is", choices: ["Allowed as in standard chess", "Forbidden", "Mandatory", "Reversed"] as [string, string, string, string], correct: 0 },
  { question: "Pawns promote in Three-Check as", choices: ["Standard chess promotion rules", "Always to queen", "Never", "Promotion is removed"] as [string, string, string, string], correct: 0 },
  { question: "A discovered check counts as", choices: ["One check (or one combined check if double)", "Two separate checks", "No checks", "Three checks"] as [string, string, string, string], correct: 0 },
  { question: "A double check counts as", choices: ["One check, not two", "Two checks", "Three checks", "Half a check"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check is a", choices: ["Chess variant with an alternate winning condition", "Card game", "Race game", "Trick-taking game"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check rewards", choices: ["Aggressive play and king attacks", "Defensive setups only", "Queen trades", "Endgame technique"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, perpetual check leads to", choices: ["A win for the checking side after three checks", "A draw", "A loss for the checker", "A reset"] as [string, string, string, string], correct: 0 },
  { question: "If a player has zero remaining check tolerance and is checked again,", choices: ["They lose the game", "They win", "They draw", "They promote"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, players track", choices: ["The number of checks each side has been given", "Captured pieces only", "Time spent", "Promotions"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check uses the standard chess starting position", choices: ["Yes", "No", "Sometimes", "Only with Chess960"] as [string, string, string, string], correct: 0 },
  { question: "If you accept a queen sacrifice that gives check in Three-Check,", choices: ["The check still counts toward the goal", "The sacrifice is illegal", "Checks are erased", "It is a draw"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, drawing rules", choices: ["Mostly follow standard chess (50-move, repetition)", "Are removed entirely", "Use Atomic rules", "Are random"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check originated as a", choices: ["Chess variant invented by enthusiasts and standardized online", "Tournament-only ruleset", "Children's game", "Computer-only ruleset"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, defending against perpetual check is", choices: ["Critical to avoid losing the game", "Unimportant", "Impossible", "Required only when material is equal"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, exchange sacrifices to deliver checks are", choices: ["Common and often justified", "Forbidden", "Cost double", "Awarded with bonus checks"] as [string, string, string, string], correct: 0 },
  { question: "Pawn structures in Three-Check tend to be", choices: ["Less important than king safety and check threats", "More important than usual", "Identical to standard chess", "Reversed"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, the king's safety", choices: ["Is the foremost priority", "Doesn't matter", "Matters less than usual", "Is irrelevant"] as [string, string, string, string], correct: 0 },
  { question: "Computers play Three-Check using", choices: ["Search engines adapted for the variant's evaluation", "Random move generators", "Card-based AI", "Endgame tablebases only"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, a knight check from h6 to f5 (for example)", choices: ["Counts as a single check toward the three-check goal", "Counts as two checks", "Doesn't count", "Counts as a half"] as [string, string, string, string], correct: 0 },
  { question: "If material is equal but check counts differ, the game is", choices: ["Won by the side closer to three checks delivered", "Always drawn", "Always won by White", "Always won by Black"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check time controls are commonly", choices: ["Bullet, blitz, or rapid online", "Classical only", "Correspondence only", "Untimed only"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, an early Bxh7+ sacrifice", choices: ["Can be sound because each check carries extra value", "Is always unsound", "Is forbidden", "Costs two checks"] as [string, string, string, string], correct: 0 },
  { question: "In Three-Check, opening theory", choices: ["Is less developed than standard chess but exists", "Doesn't exist", "Is identical to standard chess", "Is identical to Atomic"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check requires both standard chess principles and", choices: ["Awareness of check counts on both sides", "Card counting", "Dice probability", "Auction valuation"] as [string, string, string, string], correct: 0 },
  { question: "Three-Check ends when", choices: ["A player checks the opponent for the third time, or normal chess result", "Time runs out only", "A draw is offered", "A piece reaches the eighth rank"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ThreeCheckQuizSettings): ThreeCheckQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThreeCheckQuizState, action: ThreeCheckQuizAction): ThreeCheckQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThreeCheckQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
