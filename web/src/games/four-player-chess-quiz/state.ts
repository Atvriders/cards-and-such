import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FourPlayerChessQuizSettings { questions: "10"; }
export interface FourPlayerChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FourPlayerChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Four-player chess is played by", choices: ["Four players, each with their own army", "Two players with extra pieces", "One player solo", "Eight players"] as [string, string, string, string], correct: 0 },
  { question: "The four-player chess board is typically", choices: ["A cross-shaped 14x14 region with corners cut", "A standard 8x8 board", "A 10x10 board", "A hex grid"] as [string, string, string, string], correct: 0 },
  { question: "Each player in four-player chess has", choices: ["A standard set of 16 chess pieces", "Eight pieces", "Twenty pieces", "No pieces"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess is often played in", choices: ["Teams (Red+Yellow vs. Blue+Green) or free-for-all", "Pairs only", "Solo only", "Three-team format"] as [string, string, string, string], correct: 0 },
  { question: "Each player's starting position is", choices: ["On their own three-rank section of the board", "On a single square", "On the center", "On the edges only"] as [string, string, string, string], correct: 0 },
  { question: "In four-player chess, when a player is checkmated, their pieces", choices: ["Remain on the board, frozen or captured by the eliminator", "Are removed entirely", "Become the eliminator's pieces in some rules", "Promote to queens"] as [string, string, string, string], correct: 0 },
  { question: "In team four-player chess, the game ends when", choices: ["Both members of one team are checkmated", "Time runs out", "A pawn promotes", "All players promote"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess online is featured on", choices: ["Chess.com", "Lichess only", "Magnus Carlsen's website only", "FIDE.com only"] as [string, string, string, string], correct: 0 },
  { question: "In four-player chess, players move", choices: ["In clockwise order around the board", "Simultaneously", "Counterclockwise only", "When ready"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in four-player chess promote on", choices: ["The eighth rank from their own starting position", "The center of the board", "Anywhere", "Never"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess strategy involves", choices: ["Diplomacy and alliances in free-for-all", "No interaction", "Card play", "Bidding"] as [string, string, string, string], correct: 0 },
  { question: "In four-player chess, capturing an opponent's king", choices: ["Eliminates that player but the game continues", "Ends the game", "Promotes the king", "Resets the board"] as [string, string, string, string], correct: 0 },
  { question: "Free-for-all four-player chess scoring rewards", choices: ["Captures and survival; the last player or highest score wins", "Pawn promotions only", "Time saved", "Castling"] as [string, string, string, string], correct: 0 },
  { question: "In four-player chess, castling is", choices: ["Allowed normally for each player", "Forbidden", "Mandatory", "Replaced with a coin flip"] as [string, string, string, string], correct: 0 },
  { question: "The four-player chess board's center", choices: ["Is contested by all four players", "Is empty", "Is reserved for kings", "Has no squares"] as [string, string, string, string], correct: 0 },
  { question: "Each player has how many pawns in four-player chess?", choices: ["Eight, like standard chess", "Sixteen", "Four", "Twelve"] as [string, string, string, string], correct: 0 },
  { question: "Common four-player chess variants include", choices: ["Bughouse-like rules and bug-house team rules", "Only one variant", "Card variants", "Solo variants"] as [string, string, string, string], correct: 0 },
  { question: "In team four-player chess, partners", choices: ["Sit across from each other on the board", "Sit next to each other", "Don't matter for play", "Can swap pieces"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess en passant", choices: ["Applies normally for each player", "Is removed", "Doubles", "Is reversed"] as [string, string, string, string], correct: 0 },
  { question: "If a player runs out of time, their pieces", choices: ["Become inert and the player is eliminated", "Move randomly", "Promote", "Reset"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess has been played at", choices: ["Casual events and online platforms; some tournaments exist", "FIDE championships only", "Olympic events", "World Cups only"] as [string, string, string, string], correct: 0 },
  { question: "The cross-shaped board has how many squares?", choices: ["196 in the cross-shape (14x14 with corners cut)", "64", "100", "256"] as [string, string, string, string], correct: 0 },
  { question: "In four-player chess, a player whose king is in check", choices: ["Must respond as in standard chess", "Can ignore it", "Must promote", "Must castle"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess promotes alliances in", choices: ["Free-for-all mode where temporary teamwork is common", "Team mode only", "Solo mode", "Bullet only"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess can include", choices: ["Variants with different starting positions and piece sets", "Only one fixed setup", "Cards", "Dice"] as [string, string, string, string], correct: 0 },
  { question: "The Chess.com four-player chess rating system", choices: ["Tracks separate ratings for variants", "Combines all chess ratings", "Has no ratings", "Uses Elo from FIDE"] as [string, string, string, string], correct: 0 },
  { question: "In four-player chess, time controls", choices: ["Are independent for each player", "Are shared among all", "Use one team clock per side", "Are unlimited only"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess strategy requires", choices: ["Awareness of all three opponents at once", "Ignoring others", "Bidding", "Card counting"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in four-player chess move", choices: ["Forward toward the center, with capturing diagonally", "Backward only", "Sideways", "Diagonally only"] as [string, string, string, string], correct: 0 },
  { question: "Four-player chess is sometimes called", choices: ["Chess for Four", "Mini Chess", "Bughouse", "Hex Chess"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FourPlayerChessQuizSettings): FourPlayerChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FourPlayerChessQuizState, action: FourPlayerChessQuizAction): FourPlayerChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FourPlayerChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
