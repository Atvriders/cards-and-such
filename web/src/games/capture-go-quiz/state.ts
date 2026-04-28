import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CaptureGoSettings { questions: "10"; }
export interface CaptureGoState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CaptureGoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capture Go simplifies Go by removing?", choices: ["Stones", "Territory counting", "Liberties", "The board"], correct: 1 },
  { question: "Capture Go is played on?", choices: ["A standard 19x19 board only", "A 9x9 or smaller board", "A 5x5 only", "Cards"], correct: 1 },
  { question: "A win in Capture Go usually requires capturing?", choices: ["1 or 3 stones", "Half the board", "All stones", "30 stones"], correct: 0 },
  { question: "A stone in Go is captured when it has?", choices: ["No friends", "No liberties", "Three neighbours", "A flower"], correct: 1 },
  { question: "Liberties are?", choices: ["Stone colours", "Empty adjacent points", "Komi values", "Time controls"], correct: 1 },
  { question: "A stone in atari has?", choices: ["1 liberty", "2 liberties", "0 liberties", "3 liberties"], correct: 0 },
  { question: "A 'ladder' in Go is a?", choices: ["Move to corner", "Diagonal capture chase", "Star point", "Pass move"], correct: 1 },
  { question: "Capture Go is best used as a?", choices: ["Tournament format", "Beginner teaching tool", "Pro time control", "Solo puzzle"], correct: 1 },
  { question: "Black plays first in Capture Go because?", choices: ["Tradition from Go", "Komi rule", "Black is stronger", "Coin flip"], correct: 0 },
  { question: "After capture, captured stones?", choices: ["Stay on board", "Are removed", "Become wild", "Score points immediately"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CaptureGoSettings): CaptureGoState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CaptureGoState, action: CaptureGoAction): CaptureGoState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CaptureGoState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
