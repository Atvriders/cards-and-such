import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TowerStackerSettings { questions: "10"; }
export interface TowerStackerState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TowerStackerAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tower Stacker games' main mechanic is?", choices: ['Tap to drop a moving block on top of the previous block', 'Type a word', 'Drag tiles', 'Roll dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Any overhang in Tower Stacker is?', choices: ['Trimmed off (block shrinks)', 'Doubled in size', 'Worth bonus points', 'Removed and respawned'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Game ends when the block?', choices: ['Misses the previous block entirely (or shrinks to nothing)', 'Reaches the top', 'Reaches a checkpoint', 'Times out'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Stack (the popular mobile game) was made by?', choices: ['Ketchapp', 'Halfbrick', 'Lima Sky', 'Mojang'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Score in Tower Stacker is based on?', choices: ['Tower height (blocks stacked)', 'Coins collected', 'Time elapsed only', 'Cards in hand'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Stacking perfectly often awards?', choices: ['A bonus that grows the block back', 'Nothing', 'Penalty', 'Trump suit'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tower Stacker is best classified as?', choices: ['An endless arcade reflex/precision genre', 'A solitaire', 'A trick-taking game', 'A bridge variant'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Difficulty in Tower Stacker increases via?', choices: ['Faster block movement and shrinking blocks', 'More cards drawn', 'More bids placed', 'Slower movement'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tower Stacker style is reminiscent of?', choices: ["Tetris's stacking but in 3D-isometric and tap-timed", 'Pac-Man', 'Snake', 'Doodle Jump'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tower Stacker games are popular on?', choices: ['Mobile/casual platforms', 'Console-only', 'PC-only', 'Arcade-only'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TowerStackerSettings): TowerStackerState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TowerStackerState, action: TowerStackerAction): TowerStackerState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TowerStackerState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
