import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HiveLikeSettings { questions: "10"; }
export interface HiveLikeState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HiveLikeAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Hive uses what as its board?', choices: ['No board — tiles form the playing surface', 'A 9×9 hex grid', 'An 8×8 square grid', 'A 5×5 grid'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal of Hive is to?', choices: ['Surround the opposing Queen Bee completely', 'Capture all opponent pieces', 'Reach the opposite side', 'Score 21 points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hive was designed by?', choices: ['John Yianni', 'Reiner Knizia', 'Klaus Teuber', 'Kris Burm'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Queen Bee moves?', choices: ['One space per turn', 'Any distance', 'Three spaces only', 'Jumps over one tile'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Soldier Ant moves?', choices: ['Any distance around the hive', 'One space only', 'Three exact', 'Jumps only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Grasshopper moves by?', choices: ['Jumping in a straight line over one or more tiles', 'One step orthogonally', 'Sliding diagonally', 'Climbing'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Beetle's special ability is?", choices: ['Climbing on top of other tiles to form stacks', 'Jumping over tiles', 'Moving any distance', 'Spawning new tiles'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Spider moves?', choices: ['Exactly three spaces', 'Any distance', 'One space', 'Jumps in a line'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Ladybug moves?', choices: ['Two spaces on top of the hive then one down', 'One space only', 'Any distance', 'Jumps any distance'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hive is best classified as?', choices: ['An abstract tile-placement game', 'A trick-taking game', 'A solitaire', 'A roll-and-write'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HiveLikeSettings): HiveLikeState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HiveLikeState, action: HiveLikeAction): HiveLikeState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HiveLikeState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
