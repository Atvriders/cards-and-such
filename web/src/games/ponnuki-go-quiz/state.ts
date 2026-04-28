import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PonnukiGoSettings { questions: "10"; }
export interface PonnukiGoState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PonnukiGoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "A ponnuki is the shape of?", choices: ["A line of 5 stones", "Four stones surrounding 1 captured point", "Three diagonal stones", "An L-shape"], correct: 1 },
  { question: "Ponnuki literally translates as roughly?", choices: ["Pop-out / pulled-out", "Diamond", "Square", "Frame"], correct: 0 },
  { question: "A famous Go proverb says ponnuki is worth?", choices: ["10 points", "20 points", "30 points", "100 points"], correct: 2 },
  { question: "Forming a ponnuki requires you to?", choices: ["Place 4 stones at once", "Capture an opposing stone first", "Make a 1-stone connection", "Pass twice"], correct: 1 },
  { question: "Ponnuki Go awards the player who?", choices: ["Captures most stones", "Forms ponnuki", "Surrounds territory", "Plays last"], correct: 1 },
  { question: "Ponnuki Go is most useful for?", choices: ["Teaching the value of shape", "Tournament play", "Time pressure", "Komi balance"], correct: 0 },
  { question: "The 'thirty-point' value of ponnuki is?", choices: ["Literal score", "A heuristic of influence", "A komi", "A bonus from rules"], correct: 1 },
  { question: "Ponnuki shape is naturally?", choices: ["Centered around a captured stone", "On the first line", "Diagonally placed", "Random"], correct: 0 },
  { question: "After forming a ponnuki, the captured stone is?", choices: ["Returned", "Off the board", "Replaced", "Worth 5 each"], correct: 1 },
  { question: "Ponnuki shape is strongest when located?", choices: ["Corner", "Side", "Centre", "First-line edge"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PonnukiGoSettings): PonnukiGoState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PonnukiGoState, action: PonnukiGoAction): PonnukiGoState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PonnukiGoState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
