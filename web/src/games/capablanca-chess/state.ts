import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CapablancaChessSettings { questions: "10"; }
export interface CapablancaChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CapablancaChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capablanca Chess board?", choices: ["10×8", "10×10", "8×8", "12×8"], correct: 0 },
  { question: "Designer?", choices: ["José Raúl Capablanca", "Bobby Fischer", "Glinski", "Steinitz"], correct: 0 },
  { question: "Year of design?", choices: ["1920s", "1850s", "1970s", "2000s"], correct: 0 },
  { question: "Two added pieces?", choices: ["Chancellor (rook+knight) & Archbishop (bishop+knight)", "Hawk & Elephant", "Wizard & Champion", "Lion & Dragon"], correct: 0 },
  { question: "Why Capablanca proposed it?", choices: ["He felt classical chess was too drawish at top level", "For fun", "Olympic event", "Educational"], correct: 0 },
  { question: "Pieces per side?", choices: ["18", "16", "20", "12"], correct: 0 },
  { question: "Pawn promotion rank?", choices: ["8th", "10th", "5th", "First"], correct: 0 },
  { question: "Castling?", choices: ["Standard adapted to 10-file board", "Forbidden", "Long only", "Same as classical"], correct: 0 },
  { question: "Difference vs Embassy Chess?", choices: ["Slightly different starting square positions", "Different sized board", "Different pieces", "No difference"], correct: 0 },
  { question: "Why isn't it more popular?", choices: ["Classical chess has too much theory & history", "Too easy", "Too random", "No piece"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CapablancaChessSettings): CapablancaChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CapablancaChessState, action: CapablancaChessAction): CapablancaChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CapablancaChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
