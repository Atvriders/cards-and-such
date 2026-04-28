import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ScottishProgressiveSettings { questions: "10"; }
export interface ScottishProgressiveState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ScottishProgressiveAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Scottish Progressive: check must be?", choices: ["Answered immediately (turn ends)", "Ignored", "Delayed", "Only by capture"], correct: 0 },
  { question: "Move count grows?", choices: ["1, 2, 3, 4 ... per turn", "Always 1", "Always 2", "Random"], correct: 0 },
  { question: "If your final move of the turn is a check?", choices: ["Opponent then begins their (longer) turn", "Game ends", "You lose", "Restart"], correct: 0 },
  { question: "If you give check mid-turn?", choices: ["Your turn ends immediately (Scottish rule)", "Continue", "Mate", "Free move"], correct: 0 },
  { question: "Compared to Italian Progressive, Scottish is?", choices: ["Stricter on intermediate checks", "Identical", "Easier", "No checks allowed"], correct: 0 },
  { question: "Mate definition?", choices: ["You complete a move sequence ending in check the opponent can't escape on their next turn", "Standard mate", "Queen capture", "King capture"], correct: 0 },
  { question: "Tactical idea?", choices: ["Save check for last in your sequence", "Check first", "Never check", "Trade queens"], correct: 0 },
  { question: "Typical complexity?", choices: ["Calculation explodes — move 4, 5, 6 sequences", "Simple", "Linear", "Same as classical"], correct: 0 },
  { question: "Castling?", choices: ["Counts as one move within your sequence", "Free move", "Forbidden", "Special turn"], correct: 0 },
  { question: "Pawn promotion?", choices: ["Counts as the move that promotes (no extra)", "Free move", "Two moves", "None"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ScottishProgressiveSettings): ScottishProgressiveState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ScottishProgressiveState, action: ScottishProgressiveAction): ScottishProgressiveState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ScottishProgressiveState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
