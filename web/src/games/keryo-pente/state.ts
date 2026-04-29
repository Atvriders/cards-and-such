import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KeryoPenteSettings { questions: "10"; }
export interface KeryoPenteState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KeryoPenteAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Keryo-Pente is a variant of", choices: ["Pente", "Gomoku", "Go", "Reversi"], correct: 0 },
  { question: "Players capture by", choices: ["Bracketing pairs or triples of stones in a line", "Surrounding diagonally", "Crossing the river", "Promoting"], correct: 0 },
  { question: "Win conditions include", choices: ["Five in a row OR enough captures", "Five in a row only", "Capture the king", "Reach the center"], correct: 0 },
  { question: "Capture-count win is typically", choices: ["A higher threshold than Pente", "Lower than Pente", "Removed", "Set to 1"], correct: 0 },
  { question: "Board is", choices: ["19×19 or 15×15", "8×8", "10×10", "Hex"], correct: 0 },
  { question: "First player must usually", choices: ["Play the center stone", "Pass first move", "Capture first", "Move randomly"], correct: 0 },
  { question: "Compared with Pente, Keryo-Pente is", choices: ["More strategic due to more capture-count", "Easier", "Identical", "Smaller board"], correct: 0 },
  { question: "Pieces are placed", choices: ["On intersections (Go-style)", "On squares", "On edges", "Diagonally only"], correct: 0 },
  { question: "A 'tria' is", choices: ["An open three (a key threat)", "A capture", "A win condition", "A draw"], correct: 0 },
  { question: "Keryo-Pente is part of the", choices: ["M-in-a-row family", "Chess family", "Card family", "Mancala family"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KeryoPenteSettings): KeryoPenteState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KeryoPenteState, action: KeryoPenteAction): KeryoPenteState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KeryoPenteState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
