import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CrazyhousePuzzleSettings { questions: "10"; }
export interface CrazyhousePuzzleState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CrazyhousePuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Crazyhouse, captured pieces", choices: ["Go to the captor's hand to drop later", "Are removed forever", "Become pawns", "Switch sides"], correct: 0 },
  { question: "Dropping a piece counts as", choices: ["A normal move", "Two moves", "A capture", "Castling"], correct: 0 },
  { question: "Pawns cannot be dropped on", choices: ["The first or eighth rank", "The center squares", "Dark squares", "Light squares"], correct: 0 },
  { question: "A piece dropped to give immediate check is", choices: ["Allowed", "Forbidden", "Counted twice", "Reduces hand"], correct: 0 },
  { question: "Promoted pawns when captured become", choices: ["Pawns again in the captor's hand", "Queens", "Removed", "Frozen"], correct: 0 },
  { question: "Crazyhouse derives from", choices: ["Bughouse, played solo", "Standard chess", "Xiangqi", "Halma"], correct: 0 },
  { question: "Drop-mate threats are", choices: ["Common and dangerous", "Impossible", "Only on rank 1", "Always queen-mates"], correct: 0 },
  { question: "Time controls usually used", choices: ["Blitz or bullet", "Days per move", "Three-hour classical", "No clock"], correct: 0 },
  { question: "Pieces dropped on the board are", choices: ["The same color as the dropper", "Random color", "Opposite color", "Neutral"], correct: 0 },
  { question: "Crazyhouse is best classified as", choices: ["A Chess + drop-mechanic variant", "A card game", "A race game", "A Go variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CrazyhousePuzzleSettings): CrazyhousePuzzleState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CrazyhousePuzzleState, action: CrazyhousePuzzleAction): CrazyhousePuzzleState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CrazyhousePuzzleState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
