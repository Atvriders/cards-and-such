import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HasamiShogiSettings { questions: "10"; }
export interface HasamiShogiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HasamiShogiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The word 'Hasami' refers to?", choices: ["Cutting/sandwiching", "Climbing", "Spinning", "Folding"], correct: 0 },
  { question: "Hasami Shogi uses Shogi pieces but only the?", choices: ["King", "Pawn", "Knight", "Lance"], correct: 1 },
  { question: "Hasami Shogi is played on a board of?", choices: ["5x5", "7x7 or 9x9", "11x11", "19x19"], correct: 1 },
  { question: "Capturing in Hasami Shogi requires?", choices: ["A jump", "Sandwiching opponent piece", "Surrounding all sides", "Reaching a goal"], correct: 1 },
  { question: "Pieces in Hasami Shogi move?", choices: ["Diagonally only", "Orthogonally", "Like a knight", "Anywhere"], correct: 1 },
  { question: "A common Hasami win is to?", choices: ["Form 5-in-a-row", "Reach final rank", "Make checkmate", "Capture all"], correct: 0 },
  { question: "Each side starts with how many pawns (9x9)?", choices: ["7", "8", "9", "10"], correct: 2 },
  { question: "Hasami Shogi is good for teaching?", choices: ["Shogi tactics", "Writing", "Math", "Music"], correct: 0 },
  { question: "Hasami captures can be?", choices: ["Single-piece sandwich", "Multi-piece simultaneous", "Diagonal", "Random"], correct: 1 },
  { question: "Hasami Shogi is essentially?", choices: ["A pawn-only Shogi tactical exercise", "A king-only Shogi", "A dice game", "A solitaire"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HasamiShogiSettings): HasamiShogiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HasamiShogiState, action: HasamiShogiAction): HasamiShogiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HasamiShogiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
