import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShogiQuizSettings { questions: "10"; }
export interface ShogiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShogiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Shogi is played on a", choices: ["9×9 board", "8×8 board", "5×5 board", "Hex grid"], correct: 0 },
  { question: "Captured pieces", choices: ["Go to the captor's hand and may be dropped", "Are removed forever", "Go to the bank", "Promote"], correct: 0 },
  { question: "Promotion happens in", choices: ["The opponent's three nearest ranks", "Rank 8", "Random rank", "Forbidden"], correct: 0 },
  { question: "Pawns drop with restrictions; one is", choices: ["No two unpromoted pawns on the same file (nifu)", "Always allowed", "Drop on rank 1", "Drop captures"], correct: 0 },
  { question: "The king-equivalent piece is called the", choices: ["Osho (general's king)", "Pawn", "Bishop", "Knight"], correct: 0 },
  { question: "The Bishop in Shogi moves", choices: ["Diagonally any distance", "One square diagonally", "Like a knight", "Forward"], correct: 0 },
  { question: "Shogi is the national chess of", choices: ["Japan", "Korea", "China", "Thailand"], correct: 0 },
  { question: "Mating with a dropped pawn is", choices: ["Forbidden (uchifuzume rule)", "Required", "Allowed", "Free"], correct: 0 },
  { question: "Promoted pieces", choices: ["Gain extra movement abilities", "Lose movement", "Disappear", "Become pawns"], correct: 0 },
  { question: "Shogi pieces are typically", choices: ["Wedge-shaped tiles with kanji", "Round chips", "Card-like", "Carved 3D"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ShogiQuizSettings): ShogiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShogiQuizState, action: ShogiQuizAction): ShogiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShogiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
