import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DianaChessSettings { questions: "10"; }
export interface DianaChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DianaChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Diana Chess swaps which piece for a leaper?", choices: ["Queen", "Rook", "Bishop", "Knight"], correct: 0 },
  { question: "The leaper is best described as", choices: ["A short-range jumping piece", "A sliding rook", "A pawn", "A king"], correct: 0 },
  { question: "Board size is", choices: ["8×8", "10×10", "9×9", "5×5"], correct: 0 },
  { question: "Diana refers to", choices: ["The Roman goddess of the hunt", "A 19th-century champion", "A chess software", "An opening"], correct: 0 },
  { question: "Compared with the queen, the leaper is", choices: ["Less powerful but harder to block", "More powerful", "Equally powerful", "Identical"], correct: 0 },
  { question: "Pawn rules are", choices: ["Standard chess pawn rules", "Move three squares", "No promotion", "Capture forward"], correct: 0 },
  { question: "Castling in Diana Chess", choices: ["Allowed as in standard", "Forbidden", "King-side only", "Queen-side only"], correct: 0 },
  { question: "Best opening principle?", choices: ["Develop minor pieces; respect leaper jumps", "Push h-pawn", "Trade leapers immediately", "Move king out"], correct: 0 },
  { question: "Endgames in Diana", choices: ["Often turn on king-and-leaper coordination", "Always drawn", "Mate is impossible", "Pawn race only"], correct: 0 },
  { question: "Diana Chess is classified as a", choices: ["Fairy-chess variant", "Standard FIDE rule", "Card game", "Race game"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DianaChessSettings): DianaChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DianaChessState, action: DianaChessAction): DianaChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DianaChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
