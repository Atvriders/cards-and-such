import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AliceChessSettings { questions: "10"; }
export interface AliceChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AliceChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Alice Chess: how many boards?", choices: ["2", "1", "3", "4"], correct: 0 },
  { question: "After moving, the piece?", choices: ["Transports to mirror square on the OTHER board", "Stays", "Vanishes", "Captures"], correct: 0 },
  { question: "Required: the destination square on the other board must be?", choices: ["Empty", "Occupied", "Same color", "Same piece"], correct: 0 },
  { question: "Captures must follow normal capture rules on?", choices: ["The piece's current board (before transport)", "Mirror board", "Both", "Neither"], correct: 0 },
  { question: "King in check on board A — must escape considering?", choices: ["Threats on the other board after transport too", "Only board A", "Only board B", "No checks"], correct: 0 },
  { question: "Inventor of Alice Chess?", choices: ["V. R. Parton", "Lewis Carroll", "Bobby Fischer", "Capablanca"], correct: 0 },
  { question: "Why is calculation harder?", choices: ["Position effectively spans two boards", "More pieces", "Fewer pieces", "Smaller board"], correct: 0 },
  { question: "Common blunder?", choices: ["Forgetting the piece moves to the other board", "Promoting too soon", "Castling early", "Trading queens"], correct: 0 },
  { question: "Start position?", choices: ["Standard pieces all on board A; B is empty", "Split pieces", "Random", "All on B"], correct: 0 },
  { question: "Tactical opportunity?", choices: ["Pieces on B are unprotected by board-A pieces", "Always safe", "Always attacked", "Equal protection"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AliceChessSettings): AliceChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AliceChessState, action: AliceChessAction): AliceChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AliceChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
