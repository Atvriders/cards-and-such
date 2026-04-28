import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChuShogiSettings { questions: "10"; }
export interface ChuShogiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChuShogiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chu Shogi is played on a board of?", choices: ["8x8", "9x9", "12x12", "19x19"], correct: 2 },
  { question: "Each side has how many pieces in Chu Shogi?", choices: ["20", "36", "40", "46"], correct: 3 },
  { question: "Chu Shogi's most famous piece is the?", choices: ["Bishop", "Knight", "Lion", "Queen"], correct: 2 },
  { question: "The Lion can?", choices: ["Make double moves", "Move only diagonally", "Promote only", "Skip turns"], correct: 0 },
  { question: "The literal meaning of 'Chu' is?", choices: ["Middle", "Big", "Small", "Top"], correct: 0 },
  { question: "Chu Shogi was historically played in?", choices: ["Modern Japan only", "Medieval/early Japan", "Korea", "China"], correct: 1 },
  { question: "Compared to standard Shogi, Chu Shogi is?", choices: ["Smaller and faster", "Larger and more complex", "Identical", "Cardless"], correct: 1 },
  { question: "The Lion's special move is?", choices: ["Two-step capture", "Castling", "Pawn double", "Promotion only"], correct: 0 },
  { question: "Chu Shogi pieces include forms like?", choices: ["Phoenix and Kirin", "Bishops only", "Tanks", "Walls"], correct: 0 },
  { question: "A Chu Shogi match might last?", choices: ["1 minute", "30 minutes", "Many hours", "Always 10 minutes"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChuShogiSettings): ChuShogiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChuShogiState, action: ChuShogiAction): ChuShogiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChuShogiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
