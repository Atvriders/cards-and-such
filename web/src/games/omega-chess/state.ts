import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OmegaChessSettings { questions: "10"; }
export interface OmegaChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OmegaChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Omega Chess board?", choices: ["10×10 plus 4 corner squares", "10×10 only", "8×8", "12×12"], correct: 0 },
  { question: "Two new fairy pieces?", choices: ["Wizard and Champion", "Chancellor and Archbishop", "Hawk and Elephant", "Lion and Dragon"], correct: 0 },
  { question: "Wizard moves as?", choices: ["Camel-like (3,1) leaper plus diagonal step", "Bishop", "Rook", "Knight"], correct: 0 },
  { question: "Champion moves as?", choices: ["2-step orthogonal/diagonal leaper", "Queen", "Bishop", "Pawn"], correct: 0 },
  { question: "Inventor?", choices: ["Daniel C. Macdonald (1992)", "Capablanca", "Glinski", "Fischer"], correct: 0 },
  { question: "Corner squares hold?", choices: ["The Wizards at start", "Pawns", "Kings", "Queens"], correct: 0 },
  { question: "Pawns: how many?", choices: ["10 per side", "8", "16", "5"], correct: 0 },
  { question: "Promotion rank?", choices: ["10th rank", "8th", "5th", "First"], correct: 0 },
  { question: "Castling?", choices: ["Yes — adapted to 10-file board", "Forbidden", "Long only", "Random"], correct: 0 },
  { question: "Game complexity?", choices: ["Higher than classical chess", "Lower", "Same", "Trivial"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OmegaChessSettings): OmegaChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OmegaChessState, action: OmegaChessAction): OmegaChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OmegaChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
