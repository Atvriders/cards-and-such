import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AsymmetricChessSettings { questions: "10"; }
export interface AsymmetricChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AsymmetricChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Asymmetric Chess uses", choices: ["Two different armies of equal value", "Two identical armies", "Random pieces each turn", "Only pawns"], correct: 0 },
  { question: "The armies are designed to be", choices: ["Equally strong but tactically distinct", "Wildly unbalanced", "Identical to FIDE", "Pawn-only"], correct: 0 },
  { question: "The most famous designer is", choices: ["Ralph Betza (Chess with Different Armies)", "Garry Kasparov", "Capablanca alone", "Bobby Fischer"], correct: 0 },
  { question: "A typical alternate army contains", choices: ["Fairy pieces with non-standard moves", "Only pawns", "Eight queens", "Only the king"], correct: 0 },
  { question: "Game balance is verified by", choices: ["Computer playtesting and human matches", "Pure theory", "Coin flip", "Astrology"], correct: 0 },
  { question: "Asymmetric Chess typically uses", choices: ["A standard 8×8 board", "10×10 board", "Hex grid", "12×8 board"], correct: 0 },
  { question: "Pawns in Asymmetric Chess", choices: ["Usually behave normally to anchor balance", "Can leap", "Cannot promote", "Move sideways"], correct: 0 },
  { question: "Castling rules are", choices: ["Adapted per army to preserve balance", "Disabled", "Required", "Replaced with teleport"], correct: 0 },
  { question: "A key strategic skill is", choices: ["Recognizing how your unique pieces interact", "Memorizing standard openings", "Avoiding tactics", "Playing only endgames"], correct: 0 },
  { question: "Asymmetric Chess belongs to the", choices: ["Fairy-chess family", "FIDE classical family", "Card-game family", "Dice-game family"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AsymmetricChessSettings): AsymmetricChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AsymmetricChessState, action: AsymmetricChessAction): AsymmetricChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AsymmetricChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
