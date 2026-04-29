import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GothicCheckersSettings { questions: "10"; }
export interface GothicCheckersState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GothicCheckersAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Gothic Checkers board is", choices: ["Standard 8×8", "10×10", "12×12", "Hex"], correct: 0 },
  { question: "Men can move", choices: ["Diagonally in all four directions", "Forward only", "Backward only", "Orthogonally"], correct: 0 },
  { question: "Captures are", choices: ["Mandatory", "Optional", "Forbidden", "King-only"], correct: 0 },
  { question: "Kings move", choices: ["Long-range diagonally in any direction", "One square only", "Orthogonally", "Like chess knights"], correct: 0 },
  { question: "Compared to English Draughts, men in Gothic", choices: ["Move and capture in all four diagonal directions", "Are weaker", "Cannot capture", "Are kings instantly"], correct: 0 },
  { question: "Promotion is on", choices: ["The opponent's back row", "Center 4 squares", "Any square", "The middle rank"], correct: 0 },
  { question: "Win condition", choices: ["Capture or block all opponent pieces", "Promote three pieces", "Reach center", "Lose all pieces"], correct: 0 },
  { question: "Gothic vs international draughts", choices: ["Smaller board (8×8) but with all-direction men", "Larger board", "Same rules", "Hex grid"], correct: 0 },
  { question: "A typical opening principle", choices: ["Develop pieces toward the center while keeping the back rank", "Charge the king side immediately", "Sacrifice all pieces", "Refuse to capture"], correct: 0 },
  { question: "Gothic Checkers is part of the", choices: ["Draughts family", "Chess family", "Backgammon family", "Mancala family"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GothicCheckersSettings): GothicCheckersState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GothicCheckersState, action: GothicCheckersAction): GothicCheckersState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GothicCheckersState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
