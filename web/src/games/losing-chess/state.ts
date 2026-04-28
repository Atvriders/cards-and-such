import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LosingChessSettings { questions: "10"; }
export interface LosingChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LosingChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Losing Chess rule: if a capture is available, you must?", choices: ["Refuse it", "Take it (forced capture)", "Choose any move", "Castle first"], correct: 1 },
  { question: "Your only legal capture is Bxd7 but it loses your bishop. You should?", choices: ["Skip it", "Play Bxd7 — it's mandatory", "Play Ke2 instead", "Resign"], correct: 1 },
  { question: "Best opening move in Losing Chess to encourage piece loss?", choices: ["1.e4", "1.b3", "1.h3", "1.Nf3"], correct: 0 },
  { question: "If you have NO legal moves and aren't in check (stalemate), in Losing Chess you?", choices: ["Lose", "Win", "Draw", "Replay"], correct: 1 },
  { question: "Sacrifice opportunity: your Q on d1 can be taken by ...Bxd1. Best move?", choices: ["Move the queen away", "Force a capture toward the queen", "Block with a knight", "Castle"], correct: 1 },
  { question: "King in Losing Chess is?", choices: ["Royal as usual", "Just another piece — no checkmate", "Cannot be captured", "Always in check"], correct: 1 },
  { question: "Multiple captures available: which is BEST in Losing Chess?", choices: ["Whichever loses MORE material for you", "Whichever wins the most material", "Player chooses any", "The one that promotes a pawn"], correct: 0 },
  { question: "Pawn promotion in Losing Chess: best piece to promote to (often)?", choices: ["Queen", "Rook", "Knight or Bishop (less mobile)", "King"], correct: 2 },
  { question: "Why is the bishop pair sometimes a liability in Losing Chess?", choices: ["They block each other", "They form mutual capture chains hard to escape", "They give check", "They can't move"], correct: 1 },
  { question: "Endgame: lone bishop vs lone knight, both same color. Goal?", choices: ["Force the opponent to capture you", "Trade them", "Promote", "Stalemate them"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LosingChessSettings): LosingChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LosingChessState, action: LosingChessAction): LosingChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LosingChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
