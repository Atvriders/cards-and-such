import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TakenokoQuizSettings { questions: "10"; }
export interface TakenokoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TakenokoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Takenoko features which animal?", choices: ["Tiger", "Panda", "Crane", "Koi"], correct: 1 },
  { question: "What does the panda do in Takenoko?", choices: ["Plants bamboo", "Eats bamboo shoots", "Builds gardens", "Sleeps"], correct: 1 },
  { question: "What does the gardener do?", choices: ["Eats bamboo", "Cultivates bamboo growth", "Steals tiles", "Trades cards"], correct: 1 },
  { question: "The bamboo grows in how many colors?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "Players score by completing?", choices: ["Objective cards", "Trick captures", "Hand emptying", "Tile flipping"], correct: 0 },
  { question: "The land tiles are placed?", choices: ["In a hex grid", "On a square grid", "On a triangle grid", "In a stack"], correct: 0 },
  { question: "Takenoko was designed by?", choices: ["Bruno Cathala", "Reiner Knizia", "Klaus Teuber", "Antoine Bauza"], correct: 3 },
  { question: "The game's box features which color prominently?", choices: ["Red", "Green and bamboo motifs", "Black", "Blue"], correct: 1 },
  { question: "Takenoko player count is?", choices: ["1", "2-4", "5-8", "10"], correct: 1 },
  { question: "The legend behind Takenoko involves?", choices: ["Chinese emperor giving panda to Japanese emperor", "Korean War", "Dutch traders", "Russian tsar"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TakenokoQuizSettings): TakenokoQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TakenokoQuizState, action: TakenokoQuizAction): TakenokoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TakenokoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
