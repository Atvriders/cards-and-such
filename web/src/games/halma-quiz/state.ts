import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HalmaQuizSettings { questions: "10"; }
export interface HalmaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HalmaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Halma is won by", choices: ["Filling the opposite corner with your pieces first", "Capturing all opponent pieces", "Surrounding opponent", "Placing all in the center"] as [string, string, string, string], correct: 0 },
  { question: "Halma was invented in", choices: ["1880s United States", "1500s Italy", "1990s Japan", "1700s France"] as [string, string, string, string], correct: 0 },
  { question: "Pieces in Halma move by", choices: ["Single step or chain of jumps over any piece", "Diagonal slides only", "Pushing other pieces", "Knights moves"] as [string, string, string, string], correct: 0 },
  { question: "Captures in Halma are", choices: ["Not part of the rules — no captures", "Mandatory", "By landing on opponent", "By surrounding"] as [string, string, string, string], correct: 0 },
  { question: "The Halma board is", choices: ["16x16 with corner camps", "8x8", "10x10", "A hex grid"] as [string, string, string, string], correct: 0 },
  { question: "Players in Halma can be", choices: ["Two or four", "Always four", "Only two", "Six"] as [string, string, string, string], correct: 0 },
  { question: "A jump can be", choices: ["Chained over multiple pieces in one turn", "Limited to one per turn", "Only diagonal", "Only forward"] as [string, string, string, string], correct: 0 },
  { question: "Chinese Checkers descends from", choices: ["Halma — a hex-board derivative", "Snakes and Ladders", "Backgammon", "Mancala"] as [string, string, string, string], correct: 0 },
  { question: "Halma strategy emphasizes", choices: ["Building stepping stones for chained jumps", "Pure speed", "Capturing", "Defense only"] as [string, string, string, string], correct: 0 },
  { question: "Halma is named for", choices: ["The Greek word for jump", "A French inventor", "A Spanish town", "An English king"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HalmaQuizSettings): HalmaQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HalmaQuizState, action: HalmaQuizAction): HalmaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HalmaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
