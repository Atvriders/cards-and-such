import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShatranjQuizSettings { questions: "10"; }
export interface ShatranjQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShatranjQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Shatranj pieces include the", choices: ["Shah, Firzan, Fil, Faras, Rukh, Baidaq", "King, queen, bishop only", "Pawn, knight, rook only", "Pawn only"], correct: 0 },
  { question: "The Firzan (queen-like) moves", choices: ["One square diagonally only", "Like FIDE queen", "Like a rook", "Like a knight"], correct: 0 },
  { question: "The Fil (bishop-like) moves", choices: ["Two squares diagonally, leaping", "Like FIDE bishop", "Like a rook", "Like a knight"], correct: 0 },
  { question: "Pawns promote to", choices: ["Firzan only", "Queen", "Rook", "King"], correct: 0 },
  { question: "Shatranj predates modern chess by", choices: ["Several centuries", "A few years", "One year", "Same era"], correct: 0 },
  { question: "The board is", choices: ["8×8 (uncolored)", "9×9", "10×10", "Hex"], correct: 0 },
  { question: "Shatranj reached medieval Europe via", choices: ["Islamic Spain and the Mediterranean", "Northern Russia only", "China", "Mexico"], correct: 0 },
  { question: "Castling in Shatranj is", choices: ["Not present", "Required", "Standard", "Replaces promotion"], correct: 0 },
  { question: "The variant disappeared in popularity around", choices: ["1500 (when modern chess emerged)", "2000", "1800", "Today still popular"], correct: 0 },
  { question: "Shatranj is", choices: ["The direct ancestor of modern chess", "Unrelated to chess", "A card game", "A race game"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ShatranjQuizSettings): ShatranjQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShatranjQuizState, action: ShatranjQuizAction): ShatranjQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShatranjQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
