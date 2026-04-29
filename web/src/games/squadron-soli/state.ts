import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SquadronSoliSettings { questions: "10"; }
export interface SquadronSoliState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SquadronSoliAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Squadron uses how many decks?', choices: ['Two decks', 'One deck', 'Three decks', 'Four decks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'How many tableau columns?', choices: ['Ten columns', 'Seven columns', 'Eight columns', 'Twelve columns'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of foundations is?', choices: ['Eight foundations', 'Four foundations', 'Two foundations', 'Sixteen foundations'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tableau builds in Squadron go?', choices: ['Down by alternating color', 'Up by suit', 'Same suit only', 'Any rank'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Squadron features what besides tableau and stock?', choices: ['A reserve area', 'A draft pile', 'A discard pyramid', 'A trump pile'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Foundations build in?', choices: ['Up Ace to King by suit', 'Down King to Ace by suit', 'Up by color only', 'Down from any rank'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Stock redeals allowed?', choices: ['No redeals', 'One redeal', 'Two redeals', 'Unlimited'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Cards dealt from stock are?', choices: ['One at a time', 'Three at a time', 'Seven at a time', 'All at once'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Squadron requires what kind of move planning?', choices: ['Calculation of free cells and columns', 'Random play', 'Auction bids', 'Speed only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Total cards used is?', choices: ['104 cards', '52 cards', '78 cards', '60 cards'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SquadronSoliSettings): SquadronSoliState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SquadronSoliState, action: SquadronSoliAction): SquadronSoliState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SquadronSoliState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
