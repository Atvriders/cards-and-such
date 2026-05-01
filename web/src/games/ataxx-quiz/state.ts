import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AtaxxQuizSettings { questions: "10"; }
export interface AtaxxQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AtaxxQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ataxx is a board game in which pieces", choices: ["Either clone one square or jump two squares", "Move like chess kings", "Slide like checkers", "Rotate"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx is typically played on", choices: ["A 7x7 grid", "An 8x8 grid", "A 5x5 grid", "A hex grid"] as [string, string, string, string], correct: 0 },
  { question: "When a piece is placed adjacent to enemy pieces, those enemy pieces", choices: ["Are converted to your color", "Are captured and removed", "Are frozen", "Move randomly"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx originated as", choices: ["An arcade game by Leland in 1990", "An ancient board game", "A children's toy", "A computer-only game"] as [string, string, string, string], correct: 0 },
  { question: "The starting position of Ataxx places", choices: ["Two pieces of each color in opposite corners", "Pieces in the center", "All pieces on the edge", "Random pieces"] as [string, string, string, string], correct: 0 },
  { question: "A clone move in Ataxx", choices: ["Adds a new piece adjacent to an existing one", "Removes a piece", "Captures all enemies", "Skips your turn"] as [string, string, string, string], correct: 0 },
  { question: "A jump move in Ataxx", choices: ["Moves a piece exactly two squares away", "Moves a piece one square", "Removes the piece", "Adds two pieces"] as [string, string, string, string], correct: 0 },
  { question: "The game ends when", choices: ["The board is full or one side has no pieces", "A king is captured", "A line is formed", "Time runs out"] as [string, string, string, string], correct: 0 },
  { question: "The winner of Ataxx is the player with", choices: ["The most pieces at the end", "The fewest pieces", "The first to fill a row", "The one who jumped most"] as [string, string, string, string], correct: 0 },
  { question: "If a player has no legal moves, they", choices: ["Pass and the opponent continues", "Lose immediately", "Get a free piece", "Restart"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx influenced the design of", choices: ["Infection-style abstract games", "Poker", "Mahjong", "Chess960"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx is also known as", choices: ["Slime, Spot, or Infection in various ports", "Hex", "Othello", "Reversi"] as [string, string, string, string], correct: 0 },
  { question: "A converted piece in Ataxx", choices: ["Acts immediately as your own piece", "Becomes a wall", "Is removed", "Is invisible"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx is a perfect-information game", choices: ["Yes, with no hidden state", "No, it has hidden cards", "It uses dice", "It involves bluffing"] as [string, string, string, string], correct: 0 },
  { question: "The maximum distance a single Ataxx move can cover is", choices: ["Two squares (jump)", "One square", "Three squares", "Diagonally only"] as [string, string, string, string], correct: 0 },
  { question: "Cloning is generally preferable to jumping because", choices: ["It increases your piece count", "It is faster", "It captures more", "It is required"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx was popularized on home computers in the", choices: ["Early 1990s", "1970s", "2010s", "1960s"] as [string, string, string, string], correct: 0 },
  { question: "Two-player Ataxx is", choices: ["A zero-sum perfect-information game", "A cooperative game", "A trick-taking game", "A push-your-luck game"] as [string, string, string, string], correct: 0 },
  { question: "Computer programs play Ataxx using", choices: ["Alpha-beta search and heuristics", "Pure random play", "Card counting", "Bluff detection"] as [string, string, string, string], correct: 0 },
  { question: "On a 7x7 board, the total number of squares is", choices: ["49", "64", "81", "36"] as [string, string, string, string], correct: 0 },
  { question: "In Ataxx blockers (forbidden squares) can appear in", choices: ["Some variants to alter the playfield", "Standard play", "Tournament rules only", "Never"] as [string, string, string, string], correct: 0 },
  { question: "A jump move converts adjacent enemies", choices: ["Yes, then the piece appears at the destination", "No, captures only", "Only on diagonals", "Only on edges"] as [string, string, string, string], correct: 0 },
  { question: "The arcade Ataxx cabinet was released by", choices: ["Leland Corporation", "Atari", "Sega", "Nintendo"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx with no clones would be", choices: ["A jumping piece game similar to Lines of Action", "Identical to checkers", "Faster than chess", "Unsolvable"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx is sometimes used as", choices: ["A test for game-AI techniques", "A gambling game", "A storytelling game", "A children's puzzle"] as [string, string, string, string], correct: 0 },
  { question: "The traditional starting layout has", choices: ["Each color in two opposite corners", "All sixteen pieces on the back rank", "Two stacks in the middle", "Random placement"] as [string, string, string, string], correct: 0 },
  { question: "In Ataxx, the longest possible chain conversion", choices: ["Affects all squares orthogonally and diagonally adjacent to the destination", "Reaches across the whole board", "Goes only one direction", "Is limited to two enemies"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx contrasts with Othello in that pieces are", choices: ["Placed and moved, not just placed", "Placed only once", "Always flipped", "Drawn from a deck"] as [string, string, string, string], correct: 0 },
  { question: "Computer Ataxx is generally", choices: ["Strongly solved for small boards", "Unsolved for any board", "Solved only with neural nets", "An open problem"] as [string, string, string, string], correct: 0 },
  { question: "The minimum number of pieces a player can have and still play is", choices: ["One", "Zero", "Three", "Five"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AtaxxQuizSettings): AtaxxQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AtaxxQuizState, action: AtaxxQuizAction): AtaxxQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AtaxxQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
