import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PatolliBoardSettings { questions: "10"; }
export interface PatolliBoardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PatolliBoardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Patolli's board is shaped like?", choices: ['A cross (X)', 'A square grid', 'A circle', 'A spiral'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Patolli was played by which civilization?', choices: ['Aztec/Mesoamerican', 'Egyptian', 'Greek', 'Mesopotamian'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players moved tokens by throwing?', choices: ['Marked beans (often five)', 'Six-sided dice', 'Throw-sticks only', 'Coins'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of tokens per player was typically?', choices: ['Six', 'One', 'Twenty', 'Twelve'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Patolli was associated with?', choices: ['Heavy gambling and ritual', "Children's daycare only", 'Royal coronation only', 'Astronomy only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Spanish conquerors did what to Patolli?', choices: ['Banned it', 'Adopted it', 'Renamed it', 'Ignored it'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Patolli is most often classified as?', choices: ['A race/track game with chance and skill', 'A war game', 'A solitaire', 'A trick-taking game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Bets in Patolli could include?', choices: ['Jewelry, capes, food, and even freedom', 'Only money', 'Only food', 'Only stones'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Patolli's name means?", choices: ["From the Nahuatl meaning 'beans' (the dice)", "'Race'", "'Lion path'", "'Cross'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Patolli's tokens are moved?", choices: ['Around the cross-shaped track', 'Across an 8×8 grid', 'Through a spiral', 'Up a mountain'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PatolliBoardSettings): PatolliBoardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PatolliBoardState, action: PatolliBoardAction): PatolliBoardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PatolliBoardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
