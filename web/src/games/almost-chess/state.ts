import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AlmostChessSettings { questions: "10"; }
export interface AlmostChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AlmostChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Almost Chess change?", choices: ["Queen replaced by Chancellor (rook + knight)", "King removed", "Pawns doubled", "Bishop tripled"], correct: 0 },
  { question: "Chancellor moves as?", choices: ["Rook + knight", "Queen + knight", "Bishop + knight", "Rook + bishop"], correct: 0 },
  { question: "Designer?", choices: ["Ralph Betza tradition", "Bobby Fischer", "Carroll", "Capablanca"], correct: 0 },
  { question: "Game balance vs classical?", choices: ["Chancellor slightly weaker than queen on long diagonals", "Stronger", "Same", "Very weak"], correct: 0 },
  { question: "Start setup?", choices: ["Standard chess except queens replaced", "Random", "All pawns", "Empty"], correct: 0 },
  { question: "Promotion options?", choices: ["Includes Chancellor (no queens)", "Queen", "Standard", "None"], correct: 0 },
  { question: "Castling?", choices: ["Standard", "Forbidden", "King-side only", "Long only"], correct: 0 },
  { question: "Tactical novelty?", choices: ["Knight-rook forks from one piece", "Same as classical", "No tactics", "Slower"], correct: 0 },
  { question: "Endgame change?", choices: ["No queen-vs-rook studies; Chancellor endgames novel", "Same studies apply", "Trivial", "No endgame"], correct: 0 },
  { question: "Why 'Almost'?", choices: ["Almost identical to chess but for queen swap", "All rules different", "Same name as another", "No reason"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AlmostChessSettings): AlmostChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AlmostChessState, action: AlmostChessAction): AlmostChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AlmostChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
