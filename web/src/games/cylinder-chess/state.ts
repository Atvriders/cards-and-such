import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CylinderChessSettings { questions: "10"; }
export interface CylinderChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CylinderChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Cylinder Chess: which file is adjacent to a?", choices: ["h", "b", "e", "None"], correct: 0 },
  { question: "Rook movement?", choices: ["Can wrap horizontally around the cylinder", "Limited to 8 squares", "Diagonal only", "Stuck at edge"], correct: 0 },
  { question: "Bishop wrap?", choices: ["Diagonals wrap around the cylinder", "No wrap", "Only files", "Only ranks"], correct: 0 },
  { question: "Promotion rank?", choices: ["Same as standard chess (rank 8)", "Rank 1", "Center", "Any rank"], correct: 0 },
  { question: "Castling rule?", choices: ["Usually disabled (boundary issues)", "Enabled", "Only king-side", "Only queen-side"], correct: 0 },
  { question: "Most surprising tactic?", choices: ["Wrap-attack on the king from the 'far' side", "Promote", "Trade queens", "Castle long"], correct: 0 },
  { question: "King safety?", choices: ["Hard to find a 'corner' to hide", "Same as classic", "Safer", "Cannot be checked"], correct: 0 },
  { question: "Knight movement?", choices: ["Same L-shape; unaffected by wrap", "Slides", "Cannot move", "Two squares only"], correct: 0 },
  { question: "Game age?", choices: ["19th-century invention", "21st-century", "Ancient Persia", "Roman"], correct: 0 },
  { question: "Best heuristic?", choices: ["Always check both wrap directions", "Ignore wrap", "Just play normal chess", "Pawn rush"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CylinderChessSettings): CylinderChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CylinderChessState, action: CylinderChessAction): CylinderChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CylinderChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
