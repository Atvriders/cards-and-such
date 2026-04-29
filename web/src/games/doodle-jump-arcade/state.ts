import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DoodleJumpArcadeSettings { questions: "10"; }
export interface DoodleJumpArcadeState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DoodleJumpArcadeAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Doodle Jump's main mechanic is?", choices: ['Auto-bouncing upward on platforms', 'Driving a car', 'Drawing on the screen', 'Solving puzzles'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Doodle Jump was developed by?', choices: ['Lima Sky', 'Halfbrick', 'Rovio', 'Mojang'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Doodle Jump was released in?', choices: ['2009', '1985', '2000', '2020'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Score in Doodle Jump is based on?', choices: ['Height climbed', 'Time elapsed', 'Coins collected', 'Enemies killed'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Player input is typically?', choices: ['Tilt to move horizontally', 'Tap to jump', 'Drag to draw', 'Voice commands'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Game ends when the player?', choices: ['Falls off the bottom of the screen', 'Reaches a checkpoint', 'Runs out of coins', 'Solves the puzzle'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The character in Doodle Jump is?', choices: ['Doodle the Doodler', 'Sonic', 'Mario', 'PacMan'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Doodle Jump-style games are classified as?', choices: ['Endless vertical jumpers', 'Solitaire', 'Trick-taking', 'Bridge variants'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'A famous Doodle Jump enemy is?', choices: ['UFO/monsters that knock you off platforms', 'Trump cards', 'Walls', 'Tiles'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Doodle Jump's monsters are defeated by?", choices: ['Jumping on their heads or shooting them', 'Trading cards', 'Bidding', 'Auctioning'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DoodleJumpArcadeSettings): DoodleJumpArcadeState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DoodleJumpArcadeState, action: DoodleJumpArcadeAction): DoodleJumpArcadeState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DoodleJumpArcadeState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
