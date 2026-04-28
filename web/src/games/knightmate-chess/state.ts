import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KnightmateChessSettings { questions: "10"; }
export interface KnightmateChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KnightmateChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Royal piece in Knightmate?", choices: ["Knight (instead of king)", "Queen", "Rook", "Bishop"], correct: 0 },
  { question: "Each side has how many royal knights at start?", choices: ["1 (others are 'commoners' if any)", "2", "0", "4"], correct: 0 },
  { question: "Pawns promote to?", choices: ["Royal pieces (other knights, etc.)", "Queen only", "King", "Bishop"], correct: 0 },
  { question: "Goal of the game?", choices: ["Checkmate the royal knight", "Capture all pawns", "Reach last rank", "Trade pieces"], correct: 0 },
  { question: "Why is the knight special here?", choices: ["It can't be captured (royal); must be mated", "It moves further", "It can promote", "It castles"], correct: 0 },
  { question: "Standard king becomes?", choices: ["A 'man' or commoner non-royal piece", "Same as before", "A queen", "Vanishes"], correct: 0 },
  { question: "Threat on the royal knight is called?", choices: ["Check (on the knight)", "Pin", "Fork", "Discovery"], correct: 0 },
  { question: "Strategy: knights are slow attackers, so attacks need?", choices: ["Coordination of multiple pieces", "One queen", "Long pawns", "No development"], correct: 0 },
  { question: "Smothered mate (knight king)?", choices: ["Possible — block all 8 knight moves", "Impossible", "Only with rook", "Only with queen"], correct: 0 },
  { question: "Inventor?", choices: ["Bruce Zimov / Ralph Betza tradition", "Bobby Fischer", "Glinski", "Carroll"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KnightmateChessSettings): KnightmateChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KnightmateChessState, action: KnightmateChessAction): KnightmateChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KnightmateChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
