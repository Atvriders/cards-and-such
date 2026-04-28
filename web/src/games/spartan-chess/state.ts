import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpartanChessSettings { questions: "10"; }
export interface SpartanChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpartanChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Spartan Chess pits?", choices: ["Spartans (fairy pieces) vs Persians (classic chess)", "Standard vs standard", "Two Spartan armies", "None"], correct: 0 },
  { question: "Key Spartan piece?", choices: ["Warlord (king-like leader, plus Lieutenants & Hoplites)", "Standard king", "Queen", "Bishop"], correct: 0 },
  { question: "Spartans have?", choices: ["Two kings (must mate both)", "One king", "No king", "Three kings"], correct: 0 },
  { question: "Hoplite (Spartan pawn) capture?", choices: ["Forward (not diagonal like classical pawns)", "Diagonal", "Backward", "Sideways"], correct: 0 },
  { question: "Designer?", choices: ["Steven Streetman", "Bobby Fischer", "Capablanca", "Glinski"], correct: 0 },
  { question: "Persian side uses?", choices: ["Standard chess pieces", "All Spartan pieces", "Random", "Larger pieces"], correct: 0 },
  { question: "Lieutenant moves like?", choices: ["Bishop with sideways step", "Knight", "Rook", "King"], correct: 0 },
  { question: "Captain moves like?", choices: ["Limited rook", "Queen", "Bishop", "Pawn"], correct: 0 },
  { question: "Win for Persians?", choices: ["Mate the Spartan king(s)", "Capture all Hoplites", "Promote", "Three checks"], correct: 0 },
  { question: "Asymmetric balance?", choices: ["Hand-tuned by playtests", "Random", "Equal pieces", "Unfair by design"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SpartanChessSettings): SpartanChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpartanChessState, action: SpartanChessAction): SpartanChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpartanChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
