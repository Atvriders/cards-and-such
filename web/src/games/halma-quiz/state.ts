import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HalmaQuizSettings { questions: "10"; }
export interface HalmaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HalmaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Halma was invented in", choices: ["1883 or 1884 by an American surgeon", "Ancient Egypt", "Medieval Europe", "1990s"] as [string, string, string, string], correct: 0 },
  { question: "Halma is played on a", choices: ["16x16 square board", "8x8 board", "Hex grid", "9x9 board"] as [string, string, string, string], correct: 0 },
  { question: "The objective of Halma is to", choices: ["Move all your pieces into the opposing camp", "Capture pieces", "Form a line", "Surround the opponent"] as [string, string, string, string], correct: 0 },
  { question: "In Halma, pieces move", choices: ["One step or by jumping over adjacent pieces, including chained jumps", "Only one step", "Like chess kings only", "Diagonally only"] as [string, string, string, string], correct: 0 },
  { question: "Captures in Halma", choices: ["Do not occur; jumped pieces remain", "Remove jumped pieces", "Send them back to start", "Promote them"] as [string, string, string, string], correct: 0 },
  { question: "Halma was invented by", choices: ["Dr. George Howard Monks", "Lewis Carroll", "Sid Sackson", "Reiner Knizia"] as [string, string, string, string], correct: 0 },
  { question: "Halma is the ancestor of", choices: ["Chinese Checkers", "Backgammon", "Mancala", "Risk"] as [string, string, string, string], correct: 0 },
  { question: "In two-player Halma, each player has", choices: ["19 pieces in their corner", "10 pieces", "30 pieces", "5 pieces"] as [string, string, string, string], correct: 0 },
  { question: "Multi-player Halma supports", choices: ["Two or four players using corner camps", "Five players", "Up to ten players", "Only solo play"] as [string, string, string, string], correct: 0 },
  { question: "A classic Halma move is the", choices: ["Long chained jump across the board", "Castling maneuver", "Promotion to queen", "Diagonal capture"] as [string, string, string, string], correct: 0 },
  { question: "The name 'Halma' comes from the Greek meaning", choices: ["Jump", "Wisdom", "Victory", "Path"] as [string, string, string, string], correct: 0 },
  { question: "Halma was popular in", choices: ["Late Victorian-era parlour gaming", "The Stone Age", "1990s arcades", "Modern e-sports"] as [string, string, string, string], correct: 0 },
  { question: "Pieces may jump over", choices: ["Either friendly or enemy pieces if the next square is empty", "Only friendly pieces", "Only enemy pieces", "Only the corner piece"] as [string, string, string, string], correct: 0 },
  { question: "Halma is classified as a", choices: ["Race game with no captures", "Capture game", "Trick-taking game", "Bidding game"] as [string, string, string, string], correct: 0 },
  { question: "In four-player Halma, players' camps are", choices: ["At the four corners of the board", "On the four sides only", "All in the center", "Randomly placed"] as [string, string, string, string], correct: 0 },
  { question: "A 'short' jump in Halma is", choices: ["Over one adjacent piece into the empty square beyond", "Two squares straight", "A diagonal slide", "Across the whole board"] as [string, string, string, string], correct: 0 },
  { question: "Halma was first commercially produced by", choices: ["E. I. Horsman in the 1880s", "Hasbro", "Mattel", "Days of Wonder"] as [string, string, string, string], correct: 0 },
  { question: "Diagonal moves in Halma are", choices: ["Allowed (8-directional movement)", "Forbidden", "Allowed only for the king", "Limited to start"] as [string, string, string, string], correct: 0 },
  { question: "A game ends in Halma when", choices: ["A player fills the opposite camp with their pieces", "A king is captured", "Time runs out", "All pieces are jumped"] as [string, string, string, string], correct: 0 },
  { question: "If a player can move into the opposite camp but blocks themselves later, the rule is", choices: ["You may not move a piece out of the opposite camp once entered", "There is no rule", "Pieces explode", "Pieces respawn"] as [string, string, string, string], correct: 0 },
  { question: "Halma's strategic depth comes from", choices: ["Building chains of pieces for long jumps", "Random dice rolls", "Card draws", "Auctions"] as [string, string, string, string], correct: 0 },
  { question: "Chinese Checkers differs from Halma by", choices: ["Using a six-pointed star hexagonal board", "Using cards", "Using dice", "Not allowing jumps"] as [string, string, string, string], correct: 0 },
  { question: "Halma is generally considered a", choices: ["Game of pure skill with no randomness", "Game of pure chance", "Mostly luck-based", "Bluffing game"] as [string, string, string, string], correct: 0 },
  { question: "In Halma, the camp is the", choices: ["Triangular or square region of the board you start in", "Outside area", "Center five squares", "Edge of the board"] as [string, string, string, string], correct: 0 },
  { question: "A 'hop' in Halma is also called", choices: ["A jump", "A slide", "A swap", "A pass"] as [string, string, string, string], correct: 0 },
  { question: "Halma is played without", choices: ["Dice or cards", "A board", "Pieces", "Rules"] as [string, string, string, string], correct: 0 },
  { question: "To win Halma efficiently, players often", choices: ["Build ladders of pieces to chain-jump across", "Hide pieces", "Trade with opponents", "Use timers"] as [string, string, string, string], correct: 0 },
  { question: "Halma was patented in the United States in", choices: ["The 1880s", "The 1500s", "The 1950s", "The 2000s"] as [string, string, string, string], correct: 0 },
  { question: "In Halma, a piece can move at most one square non-jumping per turn", choices: ["True; otherwise it must jump", "False; pieces slide", "False; multi-square steps", "False; only diagonal"] as [string, string, string, string], correct: 0 },
  { question: "Halma's influence on board game design includes", choices: ["Spawning the entire genre of corner-to-corner race games", "Inventing trick-taking", "Inventing dice", "Inventing checkmate"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HalmaQuizSettings): HalmaQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HalmaQuizState, action: HalmaQuizAction): HalmaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HalmaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
