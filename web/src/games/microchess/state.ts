import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MicrochessSettings { questions: "10"; }
export interface MicrochessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MicrochessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Microchess board size?", choices: ["5×4 (or 4×5)", "8×8", "6×6", "3×3"], correct: 0 },
  { question: "Pieces per side?", choices: ["King + minor + rook + pawn (4 pieces)", "16", "8", "12"], correct: 0 },
  { question: "Designer?", choices: ["Glimne / Hellsten variant", "Fischer", "Glinski", "Capablanca"], correct: 0 },
  { question: "Pawn promotion rank?", choices: ["Rank 5 (top of board)", "Rank 8", "Rank 4", "Never"], correct: 0 },
  { question: "Castling?", choices: ["No castling on tiny board", "Yes", "Long only", "Short only"], correct: 0 },
  { question: "Why is microchess solved?", choices: ["Tiny state space — computers solved it perfectly", "Too complex", "No solution", "Always a draw"], correct: 0 },
  { question: "Game length?", choices: ["Often 10–25 moves", "100+", "300+", "1 move"], correct: 0 },
  { question: "Best piece on tiny board?", choices: ["Rook (long lines)", "Pawn", "King", "Bishop"], correct: 0 },
  { question: "Result of perfect play?", choices: ["Known game-theoretic value (often draw or first-player win, depending on variant)", "Always white wins", "Always black wins", "Random"], correct: 0 },
  { question: "Best opening idea?", choices: ["Activate the rook immediately", "Push pawn", "Castle", "Trade"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MicrochessSettings): MicrochessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MicrochessState, action: MicrochessAction): MicrochessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MicrochessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
