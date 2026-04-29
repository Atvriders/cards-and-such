import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SaltaSettings { questions: "10"; }
export interface SaltaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SaltaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Salta board is", choices: ["10×10", "8×8", "12×12", "Hex"], correct: 0 },
  { question: "Each player has", choices: ["15 pieces with symbols", "30 pieces", "12 pieces", "8 pieces"], correct: 0 },
  { question: "Goal is to", choices: ["Move all your pieces to the opposite side, matching symbol-to-square", "Capture all opponents", "Reach center", "First to 3 jumps"], correct: 0 },
  { question: "Pieces move", choices: ["Diagonally one square or hop over an adjacent piece", "Orthogonally", "Like chess queens", "Like rooks"], correct: 0 },
  { question: "Captures occur", choices: ["Never — Salta has no captures", "On every hop", "Only on first move", "By landing on enemy"], correct: 0 },
  { question: "Salta was invented in", choices: ["Late 19th century Germany", "Ancient Rome", "Modern USA", "Medieval England"], correct: 0 },
  { question: "The name 'Salta' means", choices: ["I jump (Latin)", "Star", "Game", "Battlefield"], correct: 0 },
  { question: "Each piece has", choices: ["A unique symbol identifying its target square", "No markings", "A number 1–15", "A color only"], correct: 0 },
  { question: "Hops in Salta", choices: ["Can chain across multiple jumps", "Are not allowed", "Are random", "Replace promotion"], correct: 0 },
  { question: "Salta is part of the", choices: ["Abstract jump-game family", "Chess family", "Mancala family", "Race-with-dice family"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SaltaSettings): SaltaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SaltaState, action: SaltaAction): SaltaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SaltaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
