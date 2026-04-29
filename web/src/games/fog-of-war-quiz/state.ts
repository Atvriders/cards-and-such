import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FogOfWarQuizSettings { questions: "10"; }
export interface FogOfWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FogOfWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Fog of War (Dark) Chess, you see", choices: ["Your own pieces and squares they attack", "All squares", "Only opponent pieces", "Only the kings"], correct: 0 },
  { question: "Discovering opponent pieces happens by", choices: ["Moving into squares your pieces can attack", "Asking opponent", "Random reveal", "Captures only"], correct: 0 },
  { question: "The game ends when", choices: ["A king is captured (no check announced)", "Standard checkmate", "Three checks", "Stalemate"], correct: 0 },
  { question: "Check is", choices: ["Not announced — you must figure it out", "Always announced", "Forbidden", "Three needed"], correct: 0 },
  { question: "The variant is also known as", choices: ["Dark Chess", "Bullet Chess", "Speed Chess", "Open Chess"], correct: 0 },
  { question: "Pieces revealed during a turn", choices: ["Become hidden again next turn unless still in vision", "Stay revealed forever", "Are removed", "Captured automatically"], correct: 0 },
  { question: "Stalemate is", choices: ["Possible and counted as draw", "Forbidden", "Wins", "Loses"], correct: 0 },
  { question: "The variant tests", choices: ["Inferential reasoning under hidden information", "Pure tactics", "Memorization", "Endgame theory"], correct: 0 },
  { question: "Fog of War is best supported on", choices: ["Online platforms with a server arbiter", "OTB", "Correspondence", "Mail chess"], correct: 0 },
  { question: "A castling move", choices: ["Is allowed if requirements still hold (your knowledge)", "Forbidden", "Required", "Only king-side"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FogOfWarQuizSettings): FogOfWarQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FogOfWarQuizState, action: FogOfWarQuizAction): FogOfWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FogOfWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
