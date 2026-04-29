import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PylosAbsSettings { questions: "10"; }
export interface PylosAbsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PylosAbsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pylos's base is?", choices: ['A 4×4 grid', 'An 8×8 grid', 'A 5×5 grid', 'A 3×3 grid'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Pylos was designed by?', choices: ['David Parlett', 'Reiner Knizia', 'Kris Burm', 'Klaus Teuber'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Pylos is published by?', choices: ['Gigamic', 'Hasbro', 'Mattel', 'Ravensburger'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The pyramid has how many layers?', choices: ['Four (4×4, 3×3, 2×2, 1)', 'Three', 'Five', 'Two'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Higher layers are placed on top of?', choices: ['A completed 2×2 square below', 'Any single sphere', 'An empty corner', 'A diagonal pair'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'In Pylos the loser is?', choices: ['The player forced to place the final top sphere', 'The first to four in a row', 'The one who runs out of spheres first', 'The one with most captures'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each player has how many spheres?', choices: ['Fifteen spheres', 'Twenty spheres', 'Ten spheres', 'Five spheres'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Climbing' lets a player?", choices: ['Move a sphere to a higher row free', 'Capture an opponent', 'Skip a turn', 'Place two spheres'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Pylos is best classified as?', choices: ['An abstract pyramid stacking game', 'A trick-taking game', 'A roll-and-write', 'A solitaire'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The game uses pieces of how many colors?', choices: ['Two (one per player)', 'Three', 'Four', 'Five'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PylosAbsSettings): PylosAbsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PylosAbsState, action: PylosAbsAction): PylosAbsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PylosAbsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
