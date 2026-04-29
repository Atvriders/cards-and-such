import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AtomicChessQuizSettings { questions: "10"; }
export interface AtomicChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AtomicChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "When a capture occurs in Atomic Chess", choices: ["All adjacent (non-pawn) pieces are destroyed", "Only the captured piece is removed", "All pieces of the same color", "Nothing extra happens"], correct: 0 },
  { question: "Pawns are affected by explosions only when", choices: ["The pawn itself is captured (it dies normally)", "Always — pawns also explode", "Never", "Only on rank 4"], correct: 0 },
  { question: "A capture that would explode your own king is", choices: ["Illegal — you cannot self-destruct", "Allowed", "Wins automatically", "Reverses the move"], correct: 0 },
  { question: "Two kings on adjacent squares are", choices: ["Allowed in Atomic — they cannot attack each other", "Forbidden", "An automatic draw", "An illegal position"], correct: 0 },
  { question: "Check delivery in Atomic", choices: ["Often accomplished by exploding near the king", "Only possible by direct attack", "Forbidden", "Always by promotion"], correct: 0 },
  { question: "The variant favors", choices: ["Sharp tactical play with king-safety considerations", "Slow positional play", "Pawn endgames", "Bishop pairs"], correct: 0 },
  { question: "Castling rules are", choices: ["Standard, but exposed king is dangerous", "Forbidden", "Required", "Only queen-side"], correct: 0 },
  { question: "Pawn promotion is", choices: ["Standard chess promotion", "Forbidden", "Only to knight", "Reset"], correct: 0 },
  { question: "Suicide-explosion of opponent king wins by", choices: ["Capturing any piece adjacent to enemy king (it explodes)", "Reaching rank 8", "Three checks", "Stalemate"], correct: 0 },
  { question: "Atomic Chess is supported on", choices: ["Lichess and many online platforms", "Only correspondence", "Only OTB", "Discontinued everywhere"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AtomicChessQuizSettings): AtomicChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AtomicChessQuizState, action: AtomicChessQuizAction): AtomicChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AtomicChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
