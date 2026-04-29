import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChineseCheckers2pSettings { questions: "10"; }
export interface ChineseCheckers2pState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChineseCheckers2pAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "2-Player Chinese Checkers uses", choices: ["Two opposing points of the star", "All six points", "A square board", "Hex without star"], correct: 0 },
  { question: "Each player has", choices: ["10 marbles", "6 marbles", "20 marbles", "1 marble"], correct: 0 },
  { question: "Goal is to", choices: ["Move all marbles to the opposite point", "Capture all enemy marbles", "Reach center", "Promote three"], correct: 0 },
  { question: "A turn consists of", choices: ["Moving one marble one step or chaining hops", "Two moves", "No move", "Three moves"], correct: 0 },
  { question: "A hop requires", choices: ["An adjacent marble (yours or opponent's) to jump over", "Empty squares only", "Captures", "Dice roll"], correct: 0 },
  { question: "Captures occur", choices: ["Never (no captures in Chinese Checkers)", "On every hop", "Only with hops over enemies", "By landing on enemies"], correct: 0 },
  { question: "The game is also called", choices: ["Sternhalma in Germany", "Halma classic", "Pachisi", "Reversi"], correct: 0 },
  { question: "Best opening strategy", choices: ["Build hop ladders toward the goal point", "Sit still", "Charge straight ahead", "Refuse to hop"], correct: 0 },
  { question: "Game length is roughly", choices: ["20–40 minutes", "5 minutes", "Multi-day", "One move"], correct: 0 },
  { question: "The game's origin", choices: ["19th-century Germany (modern form)", "Ancient China", "Modern USA", "Medieval France"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChineseCheckers2pSettings): ChineseCheckers2pState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChineseCheckers2pState, action: ChineseCheckers2pAction): ChineseCheckers2pState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChineseCheckers2pState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
