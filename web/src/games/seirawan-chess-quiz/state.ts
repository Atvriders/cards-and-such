import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SeirawanChessQuizSettings { questions: "10"; }
export interface SeirawanChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SeirawanChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Seirawan Chess introduces", choices: ["The Hawk and the Elephant pieces", "Cannon and elephant", "Lion and dragon", "Wizard and champion"], correct: 0 },
  { question: "The new pieces enter via", choices: ["Gating: drop one when its starting square's piece moves", "Captures", "Promotion", "Castling"], correct: 0 },
  { question: "The Hawk moves like", choices: ["A bishop+knight", "A rook", "A pawn", "A king"], correct: 0 },
  { question: "The Elephant moves like", choices: ["A rook+knight", "A bishop", "A pawn", "A king"], correct: 0 },
  { question: "Designer is", choices: ["Yasser Seirawan", "Bobby Fischer", "Reiner Knizia", "V. R. Parton"], correct: 0 },
  { question: "The board is", choices: ["Standard 8×8", "10×8", "9×9", "Hex"], correct: 0 },
  { question: "Gating is performed", choices: ["When a back-rank piece first moves", "Any move", "Only on captures", "Only by pawns"], correct: 0 },
  { question: "Pawn promotion is", choices: ["Standard, with hawk/elephant available", "Only to queen", "Forbidden", "Only to bishop"], correct: 0 },
  { question: "The variant enters mainstream chess via", choices: ["Online play and casual events", "Olympic Games", "World Championship", "FIDE rule"], correct: 0 },
  { question: "Seirawan Chess is classified as a", choices: ["Modern fairy variant with classical feel", "FIDE rule", "Race game", "Card variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SeirawanChessQuizSettings): SeirawanChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SeirawanChessQuizState, action: SeirawanChessQuizAction): SeirawanChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SeirawanChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
