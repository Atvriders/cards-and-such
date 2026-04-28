import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PreChessSettings { questions: "10"; }
export interface PreChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PreChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pre-Chess inventor?", choices: ["David Bronstein", "Bobby Fischer", "Glinski", "Capablanca"], correct: 0 },
  { question: "Setup phase?", choices: ["Both players freely place their back-rank pieces alternately", "Random", "Standard", "Identical mirror"], correct: 0 },
  { question: "Bishops must?", choices: ["Be on opposite-color squares", "Same color", "Anywhere", "On the same file"], correct: 0 },
  { question: "King and rook positions allow?", choices: ["Castling under Chess960-style rule", "No castling", "Only king-side", "Standard only"], correct: 0 },
  { question: "Why is opening prep weakened?", choices: ["960-like variability after setup", "Theory still applies", "No theory exists", "Random"], correct: 0 },
  { question: "Pawns at start?", choices: ["Standard 2nd-rank starting positions", "Random", "On 4th rank", "Variable"], correct: 0 },
  { question: "Each player places in turn?", choices: ["Alternating placement of one piece at a time", "All at once", "Random", "Diagonal"], correct: 0 },
  { question: "Strategic principle?", choices: ["React to opponent's setup signals", "Always same setup", "Random", "Trade queens"], correct: 0 },
  { question: "Best place for queen often?", choices: ["Near king for mutual support; varies by setup", "Always d1", "Always a1", "Always center"], correct: 0 },
  { question: "Compared to Chess960?", choices: ["Setup is chosen, not random", "Identical", "More random", "No setup"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PreChessSettings): PreChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PreChessState, action: PreChessAction): PreChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PreChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
