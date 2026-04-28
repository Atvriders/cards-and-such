import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CircularChessSettings { questions: "10"; }
export interface CircularChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CircularChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Circular Chess board?", choices: ["4 concentric rings around the center", "8x8 grid", "Hexagons", "Triangle"], correct: 0 },
  { question: "Rook movement?", choices: ["Wraps around the circle along its ring/file", "Limited 8 squares", "Diagonal only", "One step"], correct: 0 },
  { question: "Pawns promote on?", choices: ["Far side of the ring (specific arc)", "Any square", "Center", "Outer edge"], correct: 0 },
  { question: "No corners means?", choices: ["No castling traditionally", "Pieces vanish", "More pieces", "Smaller board"], correct: 0 },
  { question: "Bishop wrap-around?", choices: ["Diagonals continue across ring boundaries", "Stops at edge", "Doesn't move", "Wraps only one way"], correct: 0 },
  { question: "Queen in circular chess?", choices: ["Combines rook & bishop wrap moves", "Cannot move", "Only one square", "Same as king"], correct: 0 },
  { question: "Game origin?", choices: ["Medieval/Persian variant revived modern", "1990s computer", "Ancient China", "USA"], correct: 0 },
  { question: "Each side has how many pieces?", choices: ["Standard 16", "32", "8", "4"], correct: 0 },
  { question: "Strategy: control the center means?", choices: ["Control the inner ring", "8x8 center squares", "Edges", "All rings"], correct: 0 },
  { question: "Why are wrap captures shocking?", choices: ["Threats come from 'behind'", "Always check", "Always mate", "Always trade"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CircularChessSettings): CircularChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CircularChessState, action: CircularChessAction): CircularChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CircularChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
