import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IndianPatienceSettings { questions: "10"; }
export interface IndianPatienceState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IndianPatienceAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Indian Patience uses how many decks?', choices: ['Two decks', 'One deck', 'Three decks', 'Four decks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'How many tableau columns are dealt?', choices: ['Eleven columns', 'Seven columns', 'Ten columns', 'Eight columns'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each column starts with how many cards?', choices: ['Three cards', 'One card', 'Five cards', 'Seven cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Foundations are built up?', choices: ['By suit from Ace to King', 'By color', 'By rank only', 'Down from King'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The unique build rule on tableau is?', choices: ['Any suit except its own', 'Same suit only', 'Same color only', 'Alternating colors'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of foundations is?', choices: ['Eight foundations', 'Four foundations', 'Twelve foundations', 'Two foundations'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Is there a redeal in Indian Patience?', choices: ['No, the stock has no redeal', 'Yes, three redeals', 'Yes, unlimited redeals', 'Yes, one redeal'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Indian Patience is most similar to?', choices: ['A two-deck Klondike variant', 'Spider', 'Yukon', 'Pyramid'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of cards used total is?', choices: ['104 cards', '52 cards', '78 cards', '108 cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Indian Patience win rate is generally?', choices: ['Lower than Klondike due to suit restriction', 'Always 100%', 'Identical to Spider 4-suit', 'Very high, near 90%'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: IndianPatienceSettings): IndianPatienceState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: IndianPatienceState, action: IndianPatienceAction): IndianPatienceState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: IndianPatienceState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
