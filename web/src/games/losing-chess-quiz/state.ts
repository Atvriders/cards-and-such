import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LosingChessQuizSettings { questions: "10"; }
export interface LosingChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LosingChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Losing Chess (Antichess), the goal is to", choices: ["Lose all your pieces or be stalemated", "Checkmate the opponent's king", "Promote a pawn first", "Capture the queen"], correct: 0 },
  { question: "If a capture is available on your turn, you must", choices: ["Make a capture (captures are mandatory)", "Choose any move you like", "Castle if possible", "Pass the turn"], correct: 0 },
  { question: "In Losing Chess, the king is", choices: ["A normal piece with no royal status — it can be captured", "Always royal as in standard chess", "Replaced by a queen", "Removed from the start"], correct: 0 },
  { question: "When a pawn reaches the last rank it may", choices: ["Promote to any piece including a king", "Promote only to a queen", "Be captured automatically", "Stay as a pawn"], correct: 0 },
  { question: "If you have multiple legal captures you", choices: ["Choose any one of them", "Must take the highest-valued piece", "Must take with the lowest-valued piece", "Skip your turn"], correct: 0 },
  { question: "Stalemate in Antichess is", choices: ["A win for the stalemated player", "A draw as in standard chess", "A loss for the stalemated player", "Illegal to reach"], correct: 0 },
  { question: "Castling in Antichess is", choices: ["Disallowed in most rule sets (no royal king)", "Always required on move 5", "Done with the queen instead", "Identical to standard chess"], correct: 0 },
  { question: "A common opening principle in Antichess is", choices: ["Avoid moves that let your pieces be forced to capture profitably", "Develop knights before bishops", "Castle as early as possible", "Push the central pawns two squares"], correct: 0 },
  { question: "Antichess is sometimes also called", choices: ["Suicide chess or Giveaway chess", "Bughouse", "Three-check chess", "Atomic chess"], correct: 0 },
  { question: "Pawns in Antichess capture", choices: ["Diagonally, exactly as in standard chess", "Straight forward", "Sideways", "Any direction"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LosingChessQuizSettings): LosingChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LosingChessQuizState, action: LosingChessQuizAction): LosingChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LosingChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
