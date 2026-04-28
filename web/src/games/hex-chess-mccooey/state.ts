import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HexChessMccooeySettings { questions: "10"; }
export interface HexChessMccooeyState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HexChessMccooeyAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "McCooey hex chess board?", choices: ["91 hex cells", "64 squares", "100 squares", "81 hexes"], correct: 0 },
  { question: "How many bishops per side?", choices: ["2", "3", "4", "1"], correct: 1 },
  { question: "Pawn movement in McCooey?", choices: ["One forward (slightly different from Glinski)", "Two squares", "Diagonal only", "Sideways"], correct: 0 },
  { question: "Pawn captures?", choices: ["Two adjacent forward hexes", "Backward", "All directions", "Same as forward"], correct: 0 },
  { question: "King movement on hex grid?", choices: ["12 surrounding directions (6 hex-step + 6 diagonal)", "8 squares", "4 directions", "Any distance"], correct: 0 },
  { question: "Knight in hex chess?", choices: ["Leap to non-adjacent hex via 2-and-1 pattern", "Same as 8x8 knight", "Cannot leap", "Two hexes only"], correct: 0 },
  { question: "Queen moves?", choices: ["All ranks/files/diagonals on hex grid", "Only ranks", "Only diagonal", "One step"], correct: 0 },
  { question: "Three bishops cover what?", choices: ["Three different colored diagonals", "Same color", "All hexes", "Random"], correct: 0 },
  { question: "Hex chess is famous for?", choices: ["Wider tactical scope than 8×8", "Smaller boards", "Round shape", "No diagonals"], correct: 0 },
  { question: "McCooey vs Glinski: difference?", choices: ["Slightly different starting setup and pawn rules", "Different sized boards", "Different number of players", "Same"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HexChessMccooeySettings): HexChessMccooeyState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HexChessMccooeyState, action: HexChessMccooeyAction): HexChessMccooeyState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HexChessMccooeyState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
