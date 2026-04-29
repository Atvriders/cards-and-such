import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SantoriniLikeSettings { questions: "10"; }
export interface SantoriniLikeState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SantoriniLikeAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Santorini's board is?", choices: ['A 5×5 grid', 'An 8×8 grid', 'A 4×4 grid', 'Hexagonal'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each player has how many workers?', choices: ['Two workers', 'One worker', 'Four workers', 'Six workers'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'On a turn a player must?', choices: ['Move one worker then build on an adjacent square', 'Place a wall only', 'Roll a die only', 'Draw a card only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Winning condition is?', choices: ['Move a worker to a tower of three levels', 'Capture all opponent workers', 'Build the most towers', 'Score 100 points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Maximum level a tower can rise to is?', choices: ['Three levels then a dome cap', 'Five levels', 'Two levels', 'Ten levels'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'A dome on a tower means?', choices: ['The tower is capped (no more building or climbing)', 'The tower is removed', 'The tower rotates', 'Two builders can stand'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Workers can only move?', choices: ['Up at most one level per move', 'Two levels per move', 'Any height', 'Down by one only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Santorini was originally designed by?', choices: ['Gordon Hamilton', 'Reiner Knizia', 'Klaus Teuber', 'Kris Burm'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Santorini's optional cards add?", choices: ['Asymmetric god-powers', 'Trump suits', 'Dice rolls', 'Resource cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Santorini is best classified as?', choices: ['An abstract building/climbing game', 'A trick-taking game', 'A solitaire', 'A racing game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SantoriniLikeSettings): SantoriniLikeState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SantoriniLikeState, action: SantoriniLikeAction): SantoriniLikeState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SantoriniLikeState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
