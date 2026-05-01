import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarseillaisQuizSettings { questions: "10"; }
export interface MarseillaisQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarseillaisQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Marseillais chess, after the first move each player makes", choices: ["Two moves per turn", "Three moves per turn", "One move per turn", "Five moves per turn"], correct: 0 },
  { question: "White's opening turn is", choices: ["Just one move (to balance Black's reply)", "Two moves", "Three moves", "No moves"], correct: 0 },
  { question: "If you give check on your first move of a two-move turn, you", choices: ["Must end your turn immediately (cannot make the second move)", "Get a bonus move", "Continue normally", "Lose your turn"], correct: 0 },
  { question: "If your king is in check at the start of your turn, you must", choices: ["Get out of check on the first move of the pair", "Ignore the check", "Skip your turn", "Resign"], correct: 0 },
  { question: "Within your two moves you may", choices: ["Move the same piece twice", "Only move different pieces", "Only capture", "Only push pawns"], correct: 0 },
  { question: "Castling counts as", choices: ["One of your two moves", "The whole turn", "Two moves", "Forbidden"], correct: 0 },
  { question: "En passant in Marseillais is", choices: ["Available only on the move immediately after the two-square advance", "Always available for the rest of the game", "Forbidden", "Allowed only by the king"], correct: 0 },
  { question: "The variant is named after", choices: ["The French city of Marseille", "A 19th-century Russian master", "A type of opening", "The Marseillais regiment"], correct: 0 },
  { question: "Balanced Marseillais (a popular sub-variant) gives White", choices: ["Only one move on the first turn so Black isn't disadvantaged", "Three moves on the first turn", "Two captures only", "A free queen move"], correct: 0 },
  { question: "Marseillais favors", choices: ["Sharp combinational attacks and king hunts", "Quiet maneuvering", "Pawn endgames", "Symmetric opening play"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MarseillaisQuizSettings): MarseillaisQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MarseillaisQuizState, action: MarseillaisQuizAction): MarseillaisQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MarseillaisQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
