import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReversiTimedSettings { questions: "10"; }
export interface ReversiTimedState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReversiTimedAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Timed Reversi adds", choices: ["A per-move clock (blitz format)", "More discs", "Larger board", "Hex board"], correct: 0 },
  { question: "Board size", choices: ["8×8 (standard Reversi)", "10×10", "Hex grid", "6×6"], correct: 0 },
  { question: "Win condition", choices: ["Most discs of your color when the board fills (or no moves)", "First to flip 10 discs", "Capture the king", "Reach the last row"], correct: 0 },
  { question: "Standard starting setup uses", choices: ["Four center discs (two of each color, diagonally)", "Empty board", "Random placement", "All edges filled"], correct: 0 },
  { question: "A move requires", choices: ["Bracketing one or more enemy discs in a straight line", "Placing on any empty square", "Capturing a king", "Rolling dice"], correct: 0 },
  { question: "When you cannot move", choices: ["You pass; opponent moves again", "You lose immediately", "Game ends in draw", "You roll dice"], correct: 0 },
  { question: "Per-move clock typical setting", choices: ["10–30 seconds per move", "30 minutes per move", "No limit", "1 hour per move"], correct: 0 },
  { question: "Timed Reversi favors", choices: ["Pattern recognition and quick decision-making", "Long calculation", "Memorized opening trees", "Random play"], correct: 0 },
  { question: "Othello is the trademarked name for", choices: ["Reversi (essentially the same game)", "A different game entirely", "A chess variant", "A solitaire game"], correct: 0 },
  { question: "Corners in Reversi are", choices: ["Extremely valuable — they cannot be flipped", "Worthless", "Removed in timed mode", "Always flipped"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ReversiTimedSettings): ReversiTimedState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReversiTimedState, action: ReversiTimedAction): ReversiTimedState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReversiTimedState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
