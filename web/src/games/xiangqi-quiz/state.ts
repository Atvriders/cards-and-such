import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface XiangqiQuizSettings { questions: "10"; }
export interface XiangqiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type XiangqiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Xiangqi is played on a", choices: ["9×10 board with a river", "8×8 board", "9×9 board", "Hex"], correct: 0 },
  { question: "The Cannon captures by", choices: ["Jumping over exactly one piece", "Standard line attack", "Diagonal", "Knight L-jump"], correct: 0 },
  { question: "The General (king) stays in the", choices: ["Palace (3×3 grid)", "Center", "Anywhere", "Back rank only"], correct: 0 },
  { question: "Two Generals cannot face each other on", choices: ["The same file with no pieces between", "Diagonal", "Same rank", "Same color"], correct: 0 },
  { question: "Pawns cross the river to gain", choices: ["Sideways movement", "Backward movement", "Promotion", "Drop ability"], correct: 0 },
  { question: "The Elephant cannot cross the river", choices: ["True — bound to one side", "False", "Only at noon", "Only with king"], correct: 0 },
  { question: "Xiangqi is the national game of", choices: ["China", "Korea", "Japan", "Thailand"], correct: 0 },
  { question: "The Horse moves like the chess Knight but", choices: ["Can be blocked by adjacent pieces", "Cannot be blocked", "Identical", "Cannot capture"], correct: 0 },
  { question: "Castling in Xiangqi is", choices: ["Not present", "Required", "Standard", "Replaces promotion"], correct: 0 },
  { question: "The board has", choices: ["90 intersection points", "64 squares", "81 squares", "100 squares"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: XiangqiQuizSettings): XiangqiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: XiangqiQuizState, action: XiangqiQuizAction): XiangqiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: XiangqiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
