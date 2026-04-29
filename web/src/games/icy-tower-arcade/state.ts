import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IcyTowerArcadeSettings { questions: "10"; }
export interface IcyTowerArcadeState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IcyTowerArcadeAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Icy Tower was developed by?', choices: ['Free Lunch Design', 'Lima Sky', 'Halfbrick', 'Mojang'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Icy Tower was released in?', choices: ['2001', '1985', '2010', '2020'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The original protagonist is?', choices: ['Harold the Homeboy', 'Sonic', 'Mario', 'PacMan'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Game-over occurs when the bottom of the screen?', choices: ['Catches up to the player (player falls behind)', 'Reaches the top first', 'Scores zero', 'Times out the auction'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Combo bonuses are triggered by?', choices: ['Skipping multiple floors in a single jump', 'Collecting coins', 'Bidding correctly', 'Discarding cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Icy Tower-style is best classified as?', choices: ['A vertical chain-jumping platformer', 'A solitaire', 'A trick-taking game', 'A bridge variant'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Score in Icy Tower is based primarily on?', choices: ['Floors climbed and combos', 'Time elapsed only', 'Money spent', 'Number of opponents'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Player movement in Icy Tower uses?', choices: ['Arrow keys (left/right and jump)', 'Mouse only', 'Voice', 'Eye tracking'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Icy Tower is most associated with?', choices: ['Early 2000s freeware/Flash gaming era', '1990s arcades', '1980s consoles', '2020s VR'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Icy Tower combo points scale by?', choices: ['Number of floors skipped per jump', 'Time per jump', 'Coins per second', 'Random chance'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: IcyTowerArcadeSettings): IcyTowerArcadeState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: IcyTowerArcadeState, action: IcyTowerArcadeAction): IcyTowerArcadeState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: IcyTowerArcadeState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
