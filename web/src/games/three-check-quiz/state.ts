import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThreeCheckQuizSettings { questions: "10"; }
export interface ThreeCheckQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThreeCheckQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Three-Check is won by", choices: ["Delivering check three times to the opponent", "Three captures", "Three pawn promotions", "Reaching rank 3"], correct: 0 },
  { question: "Standard checkmate", choices: ["Still wins immediately", "Doesn't count", "Counts as one check", "Loses"], correct: 0 },
  { question: "A player can also win by", choices: ["Delivering checkmate at any point", "Three pawn moves", "Capturing queen", "Stalemate"], correct: 0 },
  { question: "Tracking checks is done", choices: ["By a counter for each side", "Verbally only", "Via flag", "By write-down only"], correct: 0 },
  { question: "Aggressive opening play is", choices: ["Common — quick checks are valuable", "Discouraged", "Forbidden", "Always wrong"], correct: 0 },
  { question: "Defending against repeated checks", choices: ["Becomes a key positional skill", "Is impossible", "Forbidden", "Always wins"], correct: 0 },
  { question: "Three-Check supports", choices: ["Standard FIDE pieces with normal moves", "Drop pieces", "Fairy pieces only", "Dice rolls"], correct: 0 },
  { question: "Castling in Three-Check", choices: ["Standard chess castling allowed", "Forbidden", "Counts as check", "Required"], correct: 0 },
  { question: "The variant rewards", choices: ["Tactical king-safety awareness", "Mancala patience", "Memorized endgames", "Pure pawn play"], correct: 0 },
  { question: "Three-Check is most often played", choices: ["On Lichess and casual venues", "World Championship", "Olympic Games", "Correspondence only"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ThreeCheckQuizSettings): ThreeCheckQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThreeCheckQuizState, action: ThreeCheckQuizAction): ThreeCheckQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThreeCheckQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
