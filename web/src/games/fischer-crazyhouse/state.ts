import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FischerCrazyhouseSettings { questions: "10"; }
export interface FischerCrazyhouseState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FischerCrazyhouseAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Combined variant: starting position?", choices: ["One of 960 random Chess960 setups", "Standard chess setup", "Empty board", "All pawns"], correct: 0 },
  { question: "Drop rule: captured pieces?", choices: ["Go to your hand to drop later", "Removed", "Sent to partner", "Promoted"], correct: 0 },
  { question: "Castling in Chess960 follows?", choices: ["Special Chess960 castling rules", "Normal castling", "Forbidden", "Drop king"], correct: 0 },
  { question: "Why is opening prep almost useless here?", choices: ["960 starts × dropping = no theory", "Theory still applies", "No openings exist", "Pieces are different"], correct: 0 },
  { question: "Piece on a corner square (a1) at start: what's likely?", choices: ["Could be any rook/knight/bishop/queen", "Always a rook", "Always a knight", "Always king"], correct: 0 },
  { question: "Pawns dropped: where can they go?", choices: ["Any rank except 1st and 8th", "Anywhere", "Only ranks 2-7 home side", "Only on 4th"], correct: 0 },
  { question: "After 1.e4, opponent drops a knight on f3. What does that mean?", choices: ["They had captured a knight earlier", "Illegal move", "Free piece", "Promoted"], correct: 0 },
  { question: "Defensive principle in Fischer-Crazyhouse?", choices: ["Watch for in-hand drop forks", "Promote first", "Trade everything", "Castle long"], correct: 0 },
  { question: "Why develop minor pieces fast?", choices: ["Loose pieces become drop-magnets", "More space", "More pawns", "Trade fast"], correct: 0 },
  { question: "Mating principle?", choices: ["Drop pieces near king for sudden mate", "Promote", "Run king", "Trade queens"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FischerCrazyhouseSettings): FischerCrazyhouseState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FischerCrazyhouseState, action: FischerCrazyhouseAction): FischerCrazyhouseState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FischerCrazyhouseState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
