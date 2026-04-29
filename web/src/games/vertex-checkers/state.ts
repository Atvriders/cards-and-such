import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VertexCheckersSettings { questions: "10"; }
export interface VertexCheckersState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VertexCheckersAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Vertex Checkers pieces move to", choices: ["Vertices of grid triangles", "Squares only", "Hex centers", "Star points"], correct: 0 },
  { question: "The board is", choices: ["Triangular", "Square 8×8", "Hexagonal", "Round"], correct: 0 },
  { question: "Each vertex connects to", choices: ["Up to six neighbors (depending on position)", "Always 4 neighbors", "Always 8", "Always 1"], correct: 0 },
  { question: "Captures are", choices: ["By jumping over an adjacent enemy to an empty vertex", "Diagonal-only", "Forbidden", "Random"], correct: 0 },
  { question: "Goal of the game", choices: ["Capture or block all opponent pieces", "Promote three pieces", "Reach the apex vertex", "Lose all pieces"], correct: 0 },
  { question: "Compared with square checkers, Vertex offers", choices: ["More movement directions per piece", "Fewer directions", "Identical movement", "No captures"], correct: 0 },
  { question: "Pieces promote when", choices: ["Reaching the opposite end of the triangle", "Capturing a king", "After 5 moves", "Never"], correct: 0 },
  { question: "Best opening principle", choices: ["Control central vertices for maximum mobility", "Hug the corners", "Sacrifice all pieces", "Promote immediately"], correct: 0 },
  { question: "Vertex Checkers is a member of the", choices: ["Checkers/draughts family", "Chess family", "Card-game family", "Race-game family"], correct: 0 },
  { question: "Multi-jump captures are", choices: ["Allowed and often required", "Forbidden", "King-only", "Random"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: VertexCheckersSettings): VertexCheckersState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VertexCheckersState, action: VertexCheckersAction): VertexCheckersState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VertexCheckersState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
