import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NinjaWallArcadeSettings { questions: "10"; }
export interface NinjaWallArcadeState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NinjaWallArcadeAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Ninja Wall games the protagonist clings to?', choices: ['One of two opposing walls and leaps between them', 'A single wall always', 'The ceiling', 'The ground'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The main input is?', choices: ['Tap to leap to the opposite wall', 'Type a word', 'Drag tiles', 'Roll dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Game over occurs when?', choices: ['The player hits an obstacle (spike/enemy)', 'Time runs out', 'All cards discarded', 'Score reaches zero'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Walls in Ninja Wall games typically?', choices: ['Scroll downward (player climbs up)', 'Stay still always', 'Move horizontally', 'Rotate'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Difficulty ramps with?', choices: ['Distance climbed', 'Time spent idle', 'Cards drawn', 'Bids made'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Obstacles include?', choices: ['Spikes, blades, enemies', 'Trump cards', 'Snake-eyes dice', 'Tiles'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Ninja Wall games are classified as?', choices: ['Wall-jumper / vertical climber arcades', 'Solitaire', 'Bridge', 'Trick-taking'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Score is typically based on?', choices: ['Successful jumps and height climbed', 'Coins only', 'Time only', 'Tile placements'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Ninja Wall genre boom occurred in?', choices: ['2010s mobile gaming', '1980s arcades', '1990s consoles', '2020s VR'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Most Ninja Wall games use what art style?', choices: ['Pixel-art or minimalist 2D', 'Photorealistic 3D', 'Voxel always', 'ASCII only'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: NinjaWallArcadeSettings): NinjaWallArcadeState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NinjaWallArcadeState, action: NinjaWallArcadeAction): NinjaWallArcadeState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NinjaWallArcadeState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
