import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DarkChessSettings { questions: "10"; }
export interface DarkChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DarkChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Dark Chess vision?", choices: ["Your pieces and squares THEY attack", "Whole board", "Only kings", "Only your back rank"], correct: 0 },
  { question: "Win condition?", choices: ["Capture opponent's king (no check rule)", "Standard checkmate", "Three checks", "Stalemate"], correct: 0 },
  { question: "Best early move idea?", choices: ["Develop minor pieces to extend vision", "Push h-pawn", "Castle blind", "Trade"], correct: 0 },
  { question: "If you walk into an unseen attack?", choices: ["You lose the piece", "You get warned", "Move undone", "Trade forced"], correct: 0 },
  { question: "Bishop value here?", choices: ["High — long diagonals reveal much board", "Low", "Same", "Useless"], correct: 0 },
  { question: "Knight value?", choices: ["Reveals 8 squares — useful scout", "Low", "None", "Negative"], correct: 0 },
  { question: "Castling?", choices: ["Allowed normally", "Forbidden", "Reveals king", "Costs turn"], correct: 0 },
  { question: "Most common blunder?", choices: ["Moving into unseen pieces' attack", "Promoting", "Trading queens", "Castling early"], correct: 0 },
  { question: "Information warfare aspect?", choices: ["Bluff and probing moves matter", "None", "Random", "Only material"], correct: 0 },
  { question: "How to scout opponent's back rank?", choices: ["Send a probing piece toward suspected square", "Resign", "Promote", "Trade"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DarkChessSettings): DarkChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DarkChessState, action: DarkChessAction): DarkChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DarkChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
