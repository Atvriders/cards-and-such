import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JanggiQuizSettings { questions: "10"; }
export interface JanggiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JanggiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Janggi is played on a", choices: ["9×10 board similar to Xiangqi", "8×8", "9×9", "Hex"], correct: 0 },
  { question: "The General (king) moves within the", choices: ["Palace (3×3 grid)", "Whole board", "Diagonal only", "Back rank only"], correct: 0 },
  { question: "The Cannon captures by", choices: ["Jumping over a non-cannon piece", "Standard line", "Diagonal", "Knight jump"], correct: 0 },
  { question: "Pawns in Janggi", choices: ["Move forward and sideways", "Forward only", "Diagonally", "Backward"], correct: 0 },
  { question: "The Elephant moves", choices: ["Like a stretched knight (specific L-pattern)", "Like FIDE bishop", "Like a rook", "Like a pawn"], correct: 0 },
  { question: "Janggi is the national game of", choices: ["Korea", "China", "Japan", "Thailand"], correct: 0 },
  { question: "A passing move in Janggi is", choices: ["Allowed (rare in chess variants)", "Forbidden", "Required", "Counts as a check"], correct: 0 },
  { question: "Player setup in Janggi is", choices: ["Flexible between two pre-game piece arrangements", "Fixed FIDE", "Random", "Pawn only"], correct: 0 },
  { question: "Castling in Janggi is", choices: ["Not present", "Required", "Standard", "Replaces promotion"], correct: 0 },
  { question: "Janggi is classified as a", choices: ["Regional East-Asian chess variant", "FIDE rule", "Race game", "Card variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: JanggiQuizSettings): JanggiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JanggiQuizState, action: JanggiQuizAction): JanggiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JanggiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
