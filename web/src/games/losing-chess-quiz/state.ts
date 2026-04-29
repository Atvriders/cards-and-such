import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LosingChessQuizSettings { questions: "10"; }
export interface LosingChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LosingChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The objective in Losing Chess is to", choices: ["Lose all your pieces or be stalemated", "Checkmate the king", "Promote a pawn", "Reach rank 8"], correct: 0 },
  { question: "Captures are", choices: ["Mandatory whenever possible", "Optional", "Forbidden", "Only by rooks"], correct: 0 },
  { question: "The king has", choices: ["No royal status — can be captured like any piece", "Royal immunity", "Two castles", "Special promotion"], correct: 0 },
  { question: "Pawn promotion choices include", choices: ["Promotion to king is also legal", "Only queen", "No promotion", "Always knight"], correct: 0 },
  { question: "Stalemate", choices: ["Wins for the stalemated player", "Is a draw", "Loses for the stalemated player", "Resets the board"], correct: 0 },
  { question: "Losing Chess is also called", choices: ["Antichess or Suicide Chess", "Pure Chess", "Modern Chess", "Speed Chess"], correct: 0 },
  { question: "Best-play results favor", choices: ["White (computationally proven)", "Black always", "Always a draw", "Black wins always"], correct: 0 },
  { question: "Multiple captures are resolved by", choices: ["Choosing any one capturing move", "Mandatory longest sequence", "Random choice", "Skipping turn"], correct: 0 },
  { question: "Castling in Losing Chess is", choices: ["Generally not allowed in most rule sets", "Required", "Always allowed", "King-side only"], correct: 0 },
  { question: "The variant tests primarily", choices: ["Tactical foresight under capture obligations", "Memorization of openings", "Endgame technique only", "Dice rolling"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LosingChessQuizSettings): LosingChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LosingChessQuizState, action: LosingChessQuizAction): LosingChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LosingChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
