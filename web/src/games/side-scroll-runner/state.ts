import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SideScrollRunnerSettings { questions: "10"; }
export interface SideScrollRunnerState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SideScrollRunnerAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Side-Scroll Runners typically auto-move the character?', choices: ['Horizontally (left-to-right or right-to-left)', 'Vertically up', 'Diagonally only', 'Not at all'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The single most-used input is usually?', choices: ['Tap-to-jump', 'Type a word', 'Drag tiles', 'Roll dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Score in side-scroll runners typically scales with?', choices: ['Distance run', 'Time elapsed only', 'Number of pickups only', 'Random luck'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'A famous early Flash side-scroll runner is?', choices: ['Canabalt', 'Tetris', 'Pac-Man', 'Snake'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Robot Unicorn Attack featured what theme song?', choices: ["Erasure's 'Always'", "ABBA's 'Mamma Mia'", "Beatles' 'Hey Jude'", "Beach Boys 'Surfin USA'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Difficulty in side-scroll runners typically?', choices: ['Ramps up with distance', 'Stays the same forever', 'Decreases over time', 'Is decided by dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Genre boom occurred in?', choices: ['2000s-2010s, especially mobile', '1980s arcades', '1960s mainframes', '2020s VR only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Jetpack Joyride was developed by?', choices: ['Halfbrick Studios', 'Nintendo', 'EA Sports', 'Capcom'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Death/loss occurs when the player?', choices: ['Hits an obstacle', 'Reaches a checkpoint', 'Scores zero', 'Times out the auction'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Side-scroll runner is best classified as?', choices: ['An endless arcade reflex genre', 'A solitaire', 'A trick-taking card game', 'A roll-and-write'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SideScrollRunnerSettings): SideScrollRunnerState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SideScrollRunnerState, action: SideScrollRunnerAction): SideScrollRunnerState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SideScrollRunnerState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
