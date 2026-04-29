import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MiniShogiQuizSettings { questions: "10"; }
export interface MiniShogiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MiniShogiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mini Shogi is played on a", choices: ["5×5 board", "9×9 board", "8×8 board", "Hex grid"], correct: 0 },
  { question: "Each side has", choices: ["6 pieces (king, rook, bishop, gold, silver, pawn)", "8 pieces", "16 pieces", "20 pieces"], correct: 0 },
  { question: "Captured pieces are", choices: ["Dropped back as in standard Shogi", "Removed", "Promoted", "Sent to opponent"], correct: 0 },
  { question: "Promotion zone is", choices: ["The opponent's nearest rank", "All ranks", "No promotion", "Forbidden"], correct: 0 },
  { question: "Mini Shogi is also called", choices: ["Gogo Shogi", "Mini Game", "Speed Shogi", "Hex Shogi"], correct: 0 },
  { question: "Designer of Mini Shogi", choices: ["Shigenobu Kusumoto (1970)", "Bobby Fischer", "V. R. Parton", "Reiner Knizia"], correct: 0 },
  { question: "The pawn drop restriction (nifu)", choices: ["Applies as in regular Shogi", "Is removed", "Is doubled", "Is reversed"], correct: 0 },
  { question: "Game length is", choices: ["Typically short — fast tactical play", "Always long", "Six hours", "Days"], correct: 0 },
  { question: "Bishop and rook in Mini Shogi", choices: ["Move diagonally and orthogonally any distance respectively", "Are pawns", "Are kings", "Can leap"], correct: 0 },
  { question: "Mini Shogi was designed for", choices: ["Quick learning of Shogi mechanics", "Olympic chess", "Pure casual fun", "Bullet"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MiniShogiQuizSettings): MiniShogiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MiniShogiQuizState, action: MiniShogiQuizAction): MiniShogiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MiniShogiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
