import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EndlessShootEmUpSettings { questions: "10"; }
export interface EndlessShootEmUpState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EndlessShootEmUpAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Endless Shoot-'Em-Ups feature?", choices: ['Endless waves of enemies', 'A finite story mode only', 'No enemies', 'Card draws'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Common control schemes include?', choices: ['Twin-stick (move and aim independently)', 'Type a word', 'Drag tiles', 'Roll dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Score in endless shoot-em-ups typically scales with?', choices: ['Kills and survival time', 'Time elapsed only', 'Cards in hand', 'Bids placed'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Geometry Wars: Retro Evolved was developed by?', choices: ['Bizarre Creations', 'Halfbrick', 'Lima Sky', 'Mojang'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Vampire Survivors was developed by?', choices: ['Poncle (Luca Galante)', 'EA Sports', 'Capcom', 'Square Enix'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Power-ups commonly include?', choices: ['Multi-shot, lasers, shields, bombs', 'Trump cards', 'Tile melds', 'Bidding contracts'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Endless Shoot-'Em-Up is part of which genre?", choices: ['Arcade reflex / endless shooter', 'Solitaire', 'Trick-taking', 'Bridge'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Difficulty ramps with?', choices: ['Wave/level number and survival time', 'Time idle only', 'Cards drawn', 'Bids made'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Game over occurs when?', choices: ["The player's health reaches zero", 'Time runs out only', 'All cards discarded', 'Score reaches 100'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Endless Shoot-'Em-Up genre boom occurred in?", choices: ['Mid-late 2010s with mobile and indie boom', '1980s arcades', '1960s mainframes', '2020s VR only'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: EndlessShootEmUpSettings): EndlessShootEmUpState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EndlessShootEmUpState, action: EndlessShootEmUpAction): EndlessShootEmUpState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EndlessShootEmUpState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
