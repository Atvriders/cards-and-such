import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RifleChessSettings { questions: "10"; }
export interface RifleChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RifleChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Rifle Chess capture rule?", choices: ["Capturing piece does NOT move; the captured piece is removed", "Standard capture", "Both pieces removed", "Captures forbidden"], correct: 0 },
  { question: "Designer?", choices: ["W. B. Seabrook / classic fairy chess (mid-20th c.)", "Fischer", "Capablanca", "Glinski"], correct: 0 },
  { question: "Pawns rifle-capture diagonally and?", choices: ["Stay on their square", "Move to capture square", "Move two squares", "Promote immediately"], correct: 0 },
  { question: "King 'rifle' captures?", choices: ["Yes — king shoots adjacent piece without moving", "No king captures", "Only knights", "Only diagonal"], correct: 0 },
  { question: "Defensive shock?", choices: ["Pieces protected only if rifle-attacker can be blocked or removed", "Same as standard", "Castling defends", "King always safe"], correct: 0 },
  { question: "En passant?", choices: ["Disabled or modified depending on ruleset", "Same as classical", "Forbidden", "Mandatory"], correct: 0 },
  { question: "Pin tactic?", choices: ["Less effective — attacker doesn't need to move", "More effective", "Disappears", "Same"], correct: 0 },
  { question: "Best heuristic?", choices: ["Watch for remote captures from undefended distances", "Trade queens", "Castle long", "Promote"], correct: 0 },
  { question: "Mating principle?", choices: ["Find rifle attacker that king cannot evade", "Standard mate", "Three checks", "Two queens"], correct: 0 },
  { question: "Tactical motif: queen on h5 rifle-takes Nf7 — what changes?", choices: ["Knight removed; queen still on h5", "Queen moves to f7", "Both removed", "Nothing"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RifleChessSettings): RifleChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RifleChessState, action: RifleChessAction): RifleChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RifleChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
