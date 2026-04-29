import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpartanChessQuizSettings { questions: "10"; }
export interface SpartanChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpartanChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Spartan Chess pits", choices: ["A Spartan army (special pieces) against a standard army", "Two standard armies", "Two Spartan armies", "Pawns vs queens"], correct: 0 },
  { question: "The Spartan king-piece is called", choices: ["The General (or Warlord)", "The King", "The Lieutenant", "The Pawn"], correct: 0 },
  { question: "Lieutenants in Spartan Chess move like", choices: ["Modified bishops/knights", "Pawns", "Rooks", "Kings"], correct: 0 },
  { question: "The variant designer is", choices: ["Steven Streetman", "V. R. Parton", "Bobby Fischer", "Reiner Knizia"], correct: 0 },
  { question: "Persian (standard) army has", choices: ["Standard chess pieces", "Spartan pieces", "Mixed pieces", "Pawns only"], correct: 0 },
  { question: "The board size is", choices: ["8×8", "9×9", "10×10", "Hex"], correct: 0 },
  { question: "Spartan Chess emphasizes", choices: ["Asymmetric strategic balance", "Pawn race", "Drop mechanics", "Hex moves"], correct: 0 },
  { question: "Pawn promotion in Spartan Chess can result in", choices: ["Different choices than standard", "Only queens", "No promotion", "Forced knights"], correct: 0 },
  { question: "The Spartan side often plays for", choices: ["Sharp tactical positions exploiting unique pieces", "Slow play", "Endgame technique", "Pure pawn play"], correct: 0 },
  { question: "Spartan Chess is classified as a", choices: ["Asymmetric fairy variant", "FIDE rule", "Race game", "Card variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SpartanChessQuizSettings): SpartanChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpartanChessQuizState, action: SpartanChessQuizAction): SpartanChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpartanChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
