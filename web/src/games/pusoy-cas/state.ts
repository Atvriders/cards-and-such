import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PusoyCasSettings { questions: "10"; }
export interface PusoyCasState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PusoyCasAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pusoy is which country's national-style card game?", choices: ['Philippines', 'Vietnam', 'Thailand', 'Cambodia'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'In classic Pusoy the Two is?', choices: ['The highest single card', 'The lowest single card', 'Wild', 'Removed'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players is?', choices: ['Four players', 'Two players', 'Six players', 'Solo'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Cards dealt per player is?', choices: ['Thirteen cards', 'Seven cards', 'Ten cards', 'Five cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'First round is typically begun by holder of?', choices: ['Three of Diamonds', 'Ace of Spades', 'Two of Clubs', 'Joker'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Five-card combinations in Pusoy include?', choices: ['Straights, flushes, full houses, four-of-a-kinds, straight flushes', 'Only flushes', 'Only straights', 'No five-card hands'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal of Pusoy is?', choices: ['Be first to empty your hand', 'Score 21 points', 'Take the most tricks', 'Match suits'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Pusoy is closely related to?', choices: ['Tien Len and Big Two', 'Bridge and Whist', 'Pinochle', 'Hearts'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The deck used is?', choices: ['Standard 52-card deck', '78-card Tarot', 'Bridge double deck', '32-card piquet'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Pusoy is best described as?', choices: ['A climbing/shedding game', 'A trick-taking game', 'A patience', 'A betting game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PusoyCasSettings): PusoyCasState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PusoyCasState, action: PusoyCasAction): PusoyCasState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PusoyCasState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
