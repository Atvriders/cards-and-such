import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CrazyhousePuzzleSettings { questions: "10"; }
export interface CrazyhousePuzzleState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CrazyhousePuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Crazyhouse, a captured piece", choices: ["Goes to the captor's reserve to be dropped later", "Is removed from the game", "Returns to its starting square", "Becomes a pawn"], correct: 0 },
  { question: "Pawns dropped from the reserve cannot land on", choices: ["The first or eighth rank", "Central squares", "The c-file", "Dark squares"], correct: 0 },
  { question: "A piece dropped to deliver immediate checkmate is", choices: ["Legal — drop-mates are a core tactic", "Forbidden by rule", "Only legal with knights", "Allowed only after move 20"], correct: 0 },
  { question: "When a promoted pawn is captured, it returns as", choices: ["A pawn in the captor's reserve", "A queen", "Whatever it promoted to", "Nothing — it's removed"], correct: 0 },
  { question: "Dropping a piece consumes", choices: ["One full move (your turn)", "Two moves", "Half a move", "No move at all"], correct: 0 },
  { question: "Crazyhouse is the solo-player adaptation of", choices: ["Bughouse", "Suicide chess", "Xiangqi", "Shogi"], correct: 0 },
  { question: "A dropped piece appears on the board with", choices: ["The same color as the player dropping it", "A neutral color", "The opposite color", "Random color"], correct: 0 },
  { question: "A typical Crazyhouse time control online is", choices: ["Blitz or bullet", "Correspondence (days per move)", "Classical 90+30", "Untimed"], correct: 0 },
  { question: "King safety in Crazyhouse is especially fragile because", choices: ["Drops allow surprise mating attacks from holes near the king", "Kings cannot castle", "Kings move two squares", "Pawns are stronger"], correct: 0 },
  { question: "The rook's role in Crazyhouse opening play is often", choices: ["Weakened — exchanging it gives the opponent a powerful drop", "Stronger than the queen", "To attack on rank 1 only", "Identical to standard chess"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CrazyhousePuzzleSettings): CrazyhousePuzzleState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CrazyhousePuzzleState, action: CrazyhousePuzzleAction): CrazyhousePuzzleState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CrazyhousePuzzleState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
