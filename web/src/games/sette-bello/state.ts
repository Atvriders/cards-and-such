import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SetteBelloSettings { questions: "10"; }
export interface SetteBelloState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SetteBelloAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Sette Bello' translates to?", choices: ["'Beautiful Seven'", "'Seven Stars'", "'Magic Seven'", "'Lucky Seven'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sette Bello is the?', choices: ['Seven of Coins (Sette di Denari)', 'Seven of Hearts', 'Seven of Spades', 'Seven of Wands'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sette Bello is most prized in?', choices: ['Scopa and its variants', 'Bridge', 'Whist', 'Hearts'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Capturing Sette Bello scores how many points in standard Scopa?', choices: ['One point in final tally', 'Five points', 'Zero', 'Ten points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sette Bello is one of how many standard scoring categories?', choices: ['Four (cards, coins, primiera, sette bello)', 'Two', 'One', 'Five'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sette Bello can be captured by?', choices: ['Direct match or sweep (not exchange)', 'Bidding only', 'Tile placement', 'Dice rolls'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Italian Scopa is part of which family?', choices: ['Fishing card games', 'Trick-taking only', 'Solitaire', 'Roll-and-write'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Italian deck used is?', choices: ['40-card Italian deck', '52-card poker deck', '78-card Tarot', '32-card piquet'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Italian suits include?', choices: ['Coins, Cups, Swords, Clubs (or local variants)', 'Hearts, Spades, Diamonds, Clubs', 'Major, Minor', 'Trumps only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sette Bello is most central to?', choices: ['Scopa, Scopone, and related games', 'Rummy', 'Bridge', 'Solitaire'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SetteBelloSettings): SetteBelloState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SetteBelloState, action: SetteBelloAction): SetteBelloState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SetteBelloState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
