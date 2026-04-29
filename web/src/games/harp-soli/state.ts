import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HarpSoliSettings { questions: "10"; }
export interface HarpSoliState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HarpSoliAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Harp uses how many decks?', choices: ['Two decks', 'One deck', 'Three decks', 'Four decks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of tableau columns dealt is?', choices: ['Nine columns', 'Seven columns', 'Ten columns', 'Eight columns'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of foundations is?', choices: ['Eight foundations', 'Four foundations', 'Two foundations', 'Sixteen foundations'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tableau builds go?', choices: ['Down by alternating color', 'Up by suit', 'Same color only', 'By any rank'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Foundations build?', choices: ['Up by suit Ace to King', 'Down from King', 'By color only', 'Any sequence'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Total face-up cards on initial deal is?', choices: ['45 cards', '28 cards', '52 cards', '104 cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of stock redeals allowed is?', choices: ['One redeal', 'Zero', 'Three', 'Unlimited'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Cards dealt from stock at a time is?', choices: ['One card', 'Three cards', 'Seven cards', 'Twelve cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Harp is most often described as?', choices: ['Two-deck Klondike', 'Solitaire chess', 'Spider variant', 'Reversi-like'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Total cards used in Harp is?', choices: ['104 cards', '52 cards', '78 cards', '108 cards'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HarpSoliSettings): HarpSoliState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HarpSoliState, action: HarpSoliAction): HarpSoliState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HarpSoliState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
