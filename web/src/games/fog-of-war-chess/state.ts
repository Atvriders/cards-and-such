import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FogOfWarChessSettings { questions: "10"; }
export interface FogOfWarChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FogOfWarChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Fog of War: what do you see?", choices: ["Whole board", "Only squares your pieces attack/occupy", "Only opponent's last move", "Only kings"], correct: 1 },
  { question: "Best opening goal in Fog of War?", choices: ["Develop quickly to extend vision", "Hide king", "Promote fast", "Trade queens"], correct: 0 },
  { question: "Knight on f3 — what does it reveal?", choices: ["Just its square", "All 8 knight-move squares", "Whole board", "Nothing"], correct: 1 },
  { question: "Why is the Bishop especially valuable in Fog of War?", choices: ["Long diagonals = wide vision", "It moves further", "It's protected", "It checks"], correct: 0 },
  { question: "You don't see the opponent's king. Win condition?", choices: ["Capture the king (no check rule)", "Checkmate as normal", "Stalemate", "Three checks"], correct: 0 },
  { question: "If your queen wanders into an unseen pawn's attack, you?", choices: ["Lose the queen", "Get a warning", "Get the move back", "Pawn becomes yours"], correct: 0 },
  { question: "Best piece to scout the back rank?", choices: ["Rook on the 7th, blind probe", "King", "Pawn", "Bishop"], correct: 0 },
  { question: "You suspect opposing king is on g8. How to verify?", choices: ["Move a piece that attacks g8", "Sacrifice a queen", "Resign", "Promote a pawn"], correct: 0 },
  { question: "Castling in Fog of War?", choices: ["Allowed normally", "Forbidden", "Costs a turn", "Reveals the board"], correct: 0 },
  { question: "Most blunders happen by?", choices: ["Moving into unseen attacks", "Promoting too early", "Castling", "Trading pieces"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FogOfWarChessSettings): FogOfWarChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FogOfWarChessState, action: FogOfWarChessAction): FogOfWarChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FogOfWarChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
