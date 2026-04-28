import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LosAlamosChessSettings { questions: "10"; }
export interface LosAlamosChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LosAlamosChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Los Alamos board size?", choices: ["6×6", "8×8", "5×5", "10×10"], correct: 0 },
  { question: "Year and origin?", choices: ["1956 — Los Alamos lab AI", "1972 — Reykjavík", "1851 London", "2000 IBM"], correct: 0 },
  { question: "Bishops in Los Alamos?", choices: ["No bishops", "Two", "One", "Three"], correct: 0 },
  { question: "Pawns can?", choices: ["Move only one square (no two-step opener)", "Move two squares", "Move backwards", "Capture sideways"], correct: 0 },
  { question: "Castling allowed?", choices: ["No (no room)", "Yes both sides", "King-side only", "Queen-side only"], correct: 0 },
  { question: "Pieces per side?", choices: ["6 pawns + R N Q K N R = 12", "16", "8", "10"], correct: 0 },
  { question: "Promotion rank?", choices: ["6th rank (last rank on small board)", "8th", "5th", "First"], correct: 0 },
  { question: "Why was the game invented?", choices: ["Computer chess hardware too weak for full chess", "Educational toy", "Olympic event", "Royal court"], correct: 0 },
  { question: "Who beat the program in 1956?", choices: ["A young woman who had just learned chess", "Magnus Carlsen", "Bobby Fischer", "Kasparov"], correct: 0 },
  { question: "Modern relevance?", choices: ["Historic milestone in AI", "Top engine today", "ICCF event", "FIDE rated"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LosAlamosChessSettings): LosAlamosChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LosAlamosChessState, action: LosAlamosChessAction): LosAlamosChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LosAlamosChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
