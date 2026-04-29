import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AnnanShogiQuizSettings { questions: "10"; }
export interface AnnanShogiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AnnanShogiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Annan Shogi, a piece moves like", choices: ["The friendly piece directly behind it", "Itself only", "A queen", "A pawn"], correct: 0 },
  { question: "If no friendly piece is behind, the piece", choices: ["Cannot move", "Moves twice", "Captures only", "Drops"], correct: 0 },
  { question: "The board is", choices: ["9×9 standard shogi board", "5×5", "8×8", "Hex"], correct: 0 },
  { question: "Drops follow", choices: ["Standard shogi drop rules", "Are forbidden", "Are doubled", "Are limited to back rank"], correct: 0 },
  { question: "The variant emphasizes", choices: ["Coordination and back-line synergy", "Pure tactics", "Race play", "Drops only"], correct: 0 },
  { question: "Promotion in Annan Shogi", choices: ["Follows standard shogi promotion", "Forbidden", "Always required", "Random"], correct: 0 },
  { question: "The variant comes from", choices: ["Japan", "Korea", "China", "Thailand"], correct: 0 },
  { question: "A king with no piece behind it", choices: ["Moves only as itself", "Cannot move", "Captures", "Promotes"], correct: 0 },
  { question: "Pawns dropped on the same file are", choices: ["Forbidden (nifu rule)", "Required", "Allowed", "Free"], correct: 0 },
  { question: "Annan Shogi is classified as a", choices: ["Shogi fairy variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AnnanShogiQuizSettings): AnnanShogiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AnnanShogiQuizState, action: AnnanShogiQuizAction): AnnanShogiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AnnanShogiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
