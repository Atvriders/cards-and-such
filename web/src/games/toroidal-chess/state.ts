import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ToroidalChessSettings { questions: "10"; }
export interface ToroidalChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ToroidalChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Toroidal board topology?", choices: ["Donut (torus): wraps in both directions", "Cylinder", "Sphere", "Plane"], correct: 0 },
  { question: "Effect on rooks?", choices: ["Move infinitely on either axis", "Limited 8", "Diagonal only", "One step"], correct: 0 },
  { question: "Edge of the board?", choices: ["No edge — every square is interior", "Marked in red", "Wall", "Corner only"], correct: 0 },
  { question: "Promotion in toroidal chess?", choices: ["Tricky — no 'far rank' (rules vary)", "Rank 8", "Center", "Anywhere"], correct: 0 },
  { question: "King safety?", choices: ["Very poor — no corner", "Excellent", "Same", "Impossible to check"], correct: 0 },
  { question: "Tactic example: knight on c3 attacks?", choices: ["Squares including wrap-around far side", "Only normal 8", "All squares", "None"], correct: 0 },
  { question: "Why is checkmate hard?", choices: ["No place to corner the king", "King is invincible", "No queens", "No bishops"], correct: 0 },
  { question: "Castling?", choices: ["Usually disabled", "Allowed", "Always forced", "Replaced"], correct: 0 },
  { question: "Endgame heuristic?", choices: ["Use multiple pieces to net the king from all sides", "Trade everything", "Promote first", "Run king"], correct: 0 },
  { question: "Mathematical interest?", choices: ["Studied in topological game theory", "None", "Only history", "Only AI"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ToroidalChessSettings): ToroidalChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ToroidalChessState, action: ToroidalChessAction): ToroidalChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ToroidalChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
