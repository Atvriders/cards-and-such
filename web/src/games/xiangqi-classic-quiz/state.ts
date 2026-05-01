import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface XiangqiClassicQuizSettings { questions: "10"; }
export interface XiangqiClassicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type XiangqiClassicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Xiangqi is also known as", choices: ["Chinese chess", "Japanese chess", "Korean chess", "Vietnamese chess"] as [string, string, string, string], correct: 0 },
  { question: "Xiangqi is played on", choices: ["A 9x10 grid (nine files, ten ranks) with the river", "An 8x8 board", "A hex board", "A 10x10 board"] as [string, string, string, string], correct: 0 },
  { question: "The river divides", choices: ["The two halves of the Xiangqi board", "Pieces from pawns", "Players from spectators", "Two phases of the game"] as [string, string, string, string], correct: 0 },
  { question: "In Xiangqi, the king (general) is confined to", choices: ["The palace, a 3x3 area", "The whole board", "The river only", "The corners"] as [string, string, string, string], correct: 0 },
  { question: "Cannons in Xiangqi capture by", choices: ["Jumping over exactly one piece (the screen)", "Sliding like rooks", "Diagonal moves", "Moving like knights"] as [string, string, string, string], correct: 0 },
  { question: "Cannons move (without capturing) like", choices: ["Rooks (any number of squares orthogonally)", "Knights", "Bishops", "Pawns only"] as [string, string, string, string], correct: 0 },
  { question: "The elephant in Xiangqi", choices: ["Cannot cross the river and moves two squares diagonally", "Moves like a queen", "Has no restrictions", "Is the strongest piece"] as [string, string, string, string], correct: 0 },
  { question: "The chariot moves like", choices: ["A modern chess rook", "A bishop", "A knight", "A pawn"] as [string, string, string, string], correct: 0 },
  { question: "The horse moves like", choices: ["A knight but cannot jump over pieces", "A modern knight", "A rook", "A bishop"] as [string, string, string, string], correct: 0 },
  { question: "Pawns (soldiers) in Xiangqi", choices: ["Move forward only, then sideways after crossing the river", "Move two squares always", "Move backward", "Move diagonally"] as [string, string, string, string], correct: 0 },
  { question: "The advisor in Xiangqi", choices: ["Stays within the palace and moves one square diagonally", "Moves like a queen", "Has no restriction", "Moves like a rook"] as [string, string, string, string], correct: 0 },
  { question: "In Xiangqi, the two generals (kings) cannot face each other on the same", choices: ["File without an intervening piece (flying general rule)", "Rank ever", "Diagonal", "River"] as [string, string, string, string], correct: 0 },
  { question: "Xiangqi originated in", choices: ["China, evolving over a millennium", "Korea", "Japan", "Vietnam"] as [string, string, string, string], correct: 0 },
  { question: "The Xiangqi pieces are placed on", choices: ["The intersections of lines, not in the squares", "Inside the squares", "On the edges only", "Stacked in piles"] as [string, string, string, string], correct: 0 },
  { question: "Each side starts with how many pieces in Xiangqi?", choices: ["Sixteen", "Twenty", "Twelve", "Thirty-two"] as [string, string, string, string], correct: 0 },
  { question: "The pawn count per side in Xiangqi is", choices: ["Five", "Eight", "Six", "Nine"] as [string, string, string, string], correct: 0 },
  { question: "Cannon-only checks are sometimes called", choices: ["Screen checks", "Open checks", "Flying checks", "River checks"] as [string, string, string, string], correct: 0 },
  { question: "In Xiangqi, perpetual chase or check", choices: ["Is forbidden under standard rules; the offending side loses or must vary", "Is encouraged", "Counts as a draw automatically", "Has no rule"] as [string, string, string, string], correct: 0 },
  { question: "Xiangqi notation uses", choices: ["A coordinate system based on files and ranks (often with Chinese characters)", "Standard chess notation only", "No notation", "Hieroglyphs"] as [string, string, string, string], correct: 0 },
  { question: "Famous Xiangqi players include", choices: ["Hu Ronghua and Wang Tianyi", "Bobby Fischer", "Magnus Carlsen", "Mikhail Tal"] as [string, string, string, string], correct: 0 },
  { question: "Xiangqi is one of the most popular board games in", choices: ["China and other East Asian countries", "Antarctica", "Europe only", "South America only"] as [string, string, string, string], correct: 0 },
  { question: "In Xiangqi, capturing the general results in", choices: ["Checkmate-style victory", "A draw", "A loss for the capturer", "A reset"] as [string, string, string, string], correct: 0 },
  { question: "The Xiangqi advisor is sometimes called the", choices: ["Guard", "Priest", "Knight", "Bishop"] as [string, string, string, string], correct: 0 },
  { question: "In Xiangqi, the king's title for the red side is often", choices: ["Shuai (Marshal)", "Shogun", "Tsar", "Pharaoh"] as [string, string, string, string], correct: 0 },
  { question: "The black side's king is often titled", choices: ["Jiang (General)", "Khan", "Sultan", "Caesar"] as [string, string, string, string], correct: 0 },
  { question: "Xiangqi requires players to", choices: ["Plan attacks across the river while protecting the palace", "Memorize card decks", "Roll dice", "Build cities"] as [string, string, string, string], correct: 0 },
  { question: "In Xiangqi, the cannon's screen", choices: ["Can be friendly or enemy, but exactly one piece must be jumped", "Only enemies", "Only friendlies", "Two pieces minimum"] as [string, string, string, string], correct: 0 },
  { question: "Xiangqi can be played at", choices: ["Various time controls including blitz and classical", "Only blitz", "Only correspondence", "Untimed only"] as [string, string, string, string], correct: 0 },
  { question: "Modern Xiangqi engines like", choices: ["BugChess and Cyclone are top programs", "Stockfish", "AlphaZero (originally)", "Deep Blue"] as [string, string, string, string], correct: 0 },
  { question: "Xiangqi's strategic complexity comes from", choices: ["Asymmetric pieces and palace constraints", "Random elements", "Card draws", "Bidding"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: XiangqiClassicQuizSettings): XiangqiClassicQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: XiangqiClassicQuizState, action: XiangqiClassicQuizAction): XiangqiClassicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: XiangqiClassicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
