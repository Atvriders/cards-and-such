import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface XiangqiBlindSettings { questions: "10"; }
export interface XiangqiBlindState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type XiangqiBlindAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Blind Opening Xiangqi hides", choices: ["River-side starting positions until revealed", "The whole board", "Only the king", "Only the cannons"], correct: 0 },
  { question: "Standard Xiangqi board is", choices: ["9×10 with river", "8×8", "10×10", "Hex grid"], correct: 0 },
  { question: "The river divides", choices: ["The two halves of the board", "Players' hands", "Cannons from infantry", "Generals from advisors"], correct: 0 },
  { question: "Pieces are revealed", choices: ["Once moved or captured", "Never", "After 10 moves", "Only by referee"], correct: 0 },
  { question: "The general (king) is", choices: ["Confined to the palace 3×3", "Free to roam", "Removed in this variant", "Always exposed"], correct: 0 },
  { question: "The cannon captures by", choices: ["Jumping a single intervening piece", "Sliding only", "Diagonal jumps", "Knight-like leaps"], correct: 0 },
  { question: "Blind Opening adds", choices: ["A bluffing/discovery layer", "A new piece type", "A larger board", "A second river"], correct: 0 },
  { question: "The horse (knight) is", choices: ["Blockable by an adjacent piece", "Unblockable like a chess knight", "A long-range slider", "A pawn"], correct: 0 },
  { question: "Win condition is", choices: ["Checkmate the opposing general", "Reach the river", "Capture all cannons", "First to 3 captures"], correct: 0 },
  { question: "Best strategy in Blind Opening", choices: ["Develop conservatively until enemy positions are revealed", "Charge wildly", "Sacrifice all cannons", "Refuse to move"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: XiangqiBlindSettings): XiangqiBlindState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: XiangqiBlindState, action: XiangqiBlindAction): XiangqiBlindState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: XiangqiBlindState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
