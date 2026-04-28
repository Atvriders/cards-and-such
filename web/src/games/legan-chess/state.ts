import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LeganChessSettings { questions: "10"; }
export interface LeganChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LeganChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Legan Chess starting orientation?", choices: ["Pieces on diagonal corner (a1 corner = your pieces)", "Standard ranks", "Random", "Same as classical"], correct: 0 },
  { question: "Pawns move toward?", choices: ["Diagonally toward opposite corner", "Forward", "Sideways", "Backward"], correct: 0 },
  { question: "Pawn captures?", choices: ["Orthogonally rather than diagonally (rotated)", "Diagonal", "Backward", "Sideways only"], correct: 0 },
  { question: "Designer?", choices: ["Leonid Legan (1932)", "Fischer", "Glinski", "Capablanca"], correct: 0 },
  { question: "Promotion happens on?", choices: ["Opposite-corner squares", "Rank 8", "File a", "All edges"], correct: 0 },
  { question: "Castling?", choices: ["Disabled or rotated", "Standard", "Forbidden", "Only long"], correct: 0 },
  { question: "Effect of rotated geometry?", choices: ["All standard tactical motifs are reflected/altered", "Same as classical", "No change", "Random"], correct: 0 },
  { question: "King initial position?", choices: ["Near corner (along rotated home rank)", "Center", "Random", "On the edge"], correct: 0 },
  { question: "Diagonal rooks?", choices: ["No — rooks still move orthogonally", "Yes", "Wrap", "Diagonal only"], correct: 0 },
  { question: "Why is the variant interesting?", choices: ["Puzzle-like rethinking of classical patterns", "Same game", "Trivial", "Random"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LeganChessSettings): LeganChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LeganChessState, action: LeganChessAction): LeganChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LeganChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
