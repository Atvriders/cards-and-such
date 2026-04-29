import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface YatzyScandSettings { questions: "10"; }
export interface YatzyScandState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type YatzyScandAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Yatzy uses how many dice?', choices: ['Five dice', 'Six dice', 'Three dice', 'One die'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of rolls per turn is?', choices: ['Up to three', 'Up to five', 'Always one', 'Up to ten'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "A 'Yatzy' (five-of-a-kind) scores?", choices: ['50 points', '100 points', '25 points', '10 points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Yatzy is the Scandinavian relative of?', choices: ['Yahtzee', 'Craps', "Liar's Dice", 'Bunco'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of categories on a Yatzy scorecard is?', choices: ['Fifteen categories', 'Thirteen categories', 'Twenty-one categories', 'Five categories'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Categories include 'One Pair' through?", choices: ['Two Pairs', 'Five Pairs', 'Three of a Kind only', 'No Pairs'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Yatzy is most popular in?', choices: ['Scandinavia', 'United States', 'Brazil', 'China'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Upper section bonus in Yatzy is typically?', choices: ['50 points', '35 points', '100 points', '10 points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "To score in 'Sixes' you total?", choices: ['The sum of all 6s rolled', 'All dice doubled', 'Sixes squared', 'Five times sixes'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Yatzy score sheet adds 'One Pair' which Yahtzee lacks; this is a?", choices: ['Distinctive Scandinavian feature', 'American innovation', 'House rule only', 'Recent change'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: YatzyScandSettings): YatzyScandState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: YatzyScandState, action: YatzyScandAction): YatzyScandState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: YatzyScandState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
