import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThreePlayerChessSettings { questions: "10"; }
export interface ThreePlayerChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThreePlayerChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Three-Player Chess board?", choices: ["Hexagonal/triangular with three sectors", "Square 8x8", "Round", "Star"], correct: 0 },
  { question: "Turn order?", choices: ["Clockwise rotation", "Counterclockwise", "Random", "Simultaneous"], correct: 0 },
  { question: "Goal of the game?", choices: ["Last king standing", "First mate", "Most pieces", "Most moves"], correct: 0 },
  { question: "If player 2 is mated, what happens to their pieces?", choices: ["Frozen on the board (variant)", "Removed", "Yours", "Random"], correct: 0 },
  { question: "Pawn movement on the curving sector boundaries?", choices: ["Adjusts via the sector geometry", "Same as classic", "Can't cross", "Diagonal only"], correct: 0 },
  { question: "Strategic principle?", choices: ["Avoid being the obvious threat", "Always attack closer foe", "Promote first", "Trade queens"], correct: 0 },
  { question: "Best long-range piece across sectors?", choices: ["Queen / Bishop on long diagonals", "Knight", "Pawn", "King"], correct: 0 },
  { question: "Move sequence after you check player 2?", choices: ["Player 2 must respond, then player 3 plays", "All move", "Skip", "Random"], correct: 0 },
  { question: "Coalition tactic?", choices: ["Implicit agreement to focus on the leader", "Always trade", "Castle", "Attack weakest"], correct: 0 },
  { question: "Endgame heuristic with 2 players left?", choices: ["Convert to standard mate plan", "Triangulate", "Stalemate", "Resign"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ThreePlayerChessSettings): ThreePlayerChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThreePlayerChessState, action: ThreePlayerChessAction): ThreePlayerChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThreePlayerChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
