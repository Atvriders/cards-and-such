import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HexChessShafranSettings { questions: "10"; }
export interface HexChessShafranState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HexChessShafranAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Shafran hex chess board cells?", choices: ["70", "91", "100", "64"], correct: 0 },
  { question: "Distinguishing feature vs Glinski?", choices: ["Different cell layout/orientation", "Square cells", "More pieces", "No bishops"], correct: 0 },
  { question: "Pawns: how many per side?", choices: ["Around 9 (matches geometry)", "16", "8", "4"], correct: 0 },
  { question: "Bishops/side?", choices: ["3", "2", "1", "4"], correct: 0 },
  { question: "Country of origin?", choices: ["Soviet Union (1939)", "Hungary", "Poland", "Italy"], correct: 0 },
  { question: "Pawn promotion edge?", choices: ["Opposite far edge of board", "Center", "Anywhere", "Same edge"], correct: 0 },
  { question: "Knight movement style?", choices: ["Hex 2-1 leap", "Square L", "One step", "Three steps"], correct: 0 },
  { question: "Castling in Shafran?", choices: ["No castling on hex board", "Standard", "Long only", "Short only"], correct: 0 },
  { question: "Compared to Glinski, Shafran is?", choices: ["Less popular but still played", "More popular", "Identical", "Older"], correct: 0 },
  { question: "Best opening principle?", choices: ["Develop on the long diagonals", "Push pawns blindly", "Trade early", "King-side only"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HexChessShafranSettings): HexChessShafranState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HexChessShafranState, action: HexChessShafranAction): HexChessShafranState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HexChessShafranState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
