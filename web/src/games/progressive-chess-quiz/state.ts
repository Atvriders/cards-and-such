import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ProgressiveChessQuizSettings { questions: "10"; }
export interface ProgressiveChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ProgressiveChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Progressive (Scotch) chess, each turn a player makes", choices: ["One more move than the previous turn (1, then 2, then 3, ...)", "Exactly two moves", "One move always", "Three moves always"], correct: 0 },
  { question: "White's first turn consists of", choices: ["1 move", "2 moves", "3 moves", "0 moves"], correct: 0 },
  { question: "Black's first turn consists of", choices: ["2 moves", "1 move", "3 moves", "Same as White"], correct: 0 },
  { question: "Within a multi-move turn you may", choices: ["Move the same piece multiple times", "Only move different pieces each move", "Only capture", "Only promote"], correct: 0 },
  { question: "Giving check during your turn is", choices: ["Usually only allowed as the LAST move of the sequence (rules vary)", "Forbidden completely", "Required on every move", "Only allowed first"], correct: 0 },
  { question: "If you cannot complete your full sequence of moves,", choices: ["You lose (in most rule sets)", "Your turn just ends", "You skip a move", "The game is drawn"], correct: 0 },
  { question: "En passant captures in Progressive", choices: ["Must be made on the move immediately following the pawn's two-square advance within the turn", "Are forbidden", "Last forever", "Only happen on rank 5"], correct: 0 },
  { question: "Castling counts as", choices: ["A single move within the sequence", "Two moves", "The whole turn", "Forbidden"], correct: 0 },
  { question: "Progressive chess favors", choices: ["Sharp tactics and long combinations", "Slow positional play", "Pawn endgames", "Symmetric setups"], correct: 0 },
  { question: "Another name for the variant is", choices: ["Scotch Chess or Italian Progressive Chess", "Antichess", "Atomic Chess", "Three-check Chess"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ProgressiveChessQuizSettings): ProgressiveChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ProgressiveChessQuizState, action: ProgressiveChessQuizAction): ProgressiveChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ProgressiveChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
