import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EmbassyChessSettings { questions: "10"; }
export interface EmbassyChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EmbassyChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Embassy Chess board?", choices: ["10×8", "8×8", "10×10", "12×8"], correct: 0 },
  { question: "Two new pieces?", choices: ["Chancellor and Archbishop", "Wizard and Champion", "Hawk and Elephant", "Lion and Dragon"], correct: 0 },
  { question: "Archbishop moves as?", choices: ["Bishop + knight", "Rook + knight", "Queen + knight", "King"], correct: 0 },
  { question: "Chancellor moves as?", choices: ["Rook + knight", "Bishop + knight", "Queen + knight", "King"], correct: 0 },
  { question: "Designer?", choices: ["Kevin Hill / Capablanca lineage", "Bobby Fischer", "Glinski", "Carroll"], correct: 0 },
  { question: "Pawn double-step?", choices: ["Standard from 2nd rank", "Forbidden", "Triple step", "One step only"], correct: 0 },
  { question: "Castling?", choices: ["Adapted for 10-file board", "Forbidden", "Same as classical", "Only short"], correct: 0 },
  { question: "Promotion rank?", choices: ["8 (top rank)", "10", "5", "First"], correct: 0 },
  { question: "Why introduce Archbishop & Chancellor?", choices: ["Add tactical richness without removing classical pieces", "Replace queens", "Replace bishops", "Replace pawns"], correct: 0 },
  { question: "Compared to Capablanca Chess?", choices: ["Slightly different starting setup", "Identical", "Smaller board", "Larger board"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: EmbassyChessSettings): EmbassyChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EmbassyChessState, action: EmbassyChessAction): EmbassyChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EmbassyChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
