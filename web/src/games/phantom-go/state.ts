import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhantomGoSettings { questions: "10"; }
export interface PhantomGoState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhantomGoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Phantom Go hides", choices: ["The opponent's stones from your view", "Only your stones", "The whole board", "Just one corner"], correct: 0 },
  { question: "A referee or computer announces", choices: ["Illegal moves and captures", "Every move", "Nothing", "Only ko violations"], correct: 0 },
  { question: "When you try to play on an enemy stone you", choices: ["Are told the move is illegal and try again", "Lose instantly", "Pass automatically", "Win"], correct: 0 },
  { question: "Phantom Go is part of the", choices: ["Imperfect-information family", "Perfect-information family", "Card family", "Race-game family"], correct: 0 },
  { question: "Strategy includes", choices: ["Scouting moves to detect opponent territory", "Memorized 19×19 openings", "No strategy", "Always pass"], correct: 0 },
  { question: "Captures still follow", choices: ["Standard liberty rules", "No captures", "Only with announcement", "Only ko"], correct: 0 },
  { question: "The game ends", choices: ["When both players pass", "After 50 moves", "After first capture", "When time runs out"], correct: 0 },
  { question: "Score is computed using", choices: ["Standard territory + captures (revealed at end)", "Stones placed only", "Liberties only", "Coin flip"], correct: 0 },
  { question: "Phantom Go favors", choices: ["Probabilistic reasoning and scouting", "Pure memorization", "Random play", "Refusing to move"], correct: 0 },
  { question: "Compared to standard Go, you must", choices: ["Maintain a mental model of the unseen board", "Memorize openings", "Roll dice", "Make moves quickly only"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PhantomGoSettings): PhantomGoState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PhantomGoState, action: PhantomGoAction): PhantomGoState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PhantomGoState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
