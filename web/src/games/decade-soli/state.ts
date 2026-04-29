import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DecadeSoliSettings { questions: "10"; }
export interface DecadeSoliState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DecadeSoliAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Decade you discard cards summing to?', choices: ['Ten or a multiple of ten', 'Twenty-one', 'Fifteen', 'Pairs only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Face cards count as?', choices: ['Ten each', 'One each', 'Eleven', 'Zero'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Decade uses how many decks?', choices: ['One deck', 'Two decks', 'Three decks', 'Four decks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Cards are removed from?', choices: ['Adjacent positions in a row', 'The top of the stock only', 'Any random pair', 'Last column only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Decade is part of which patience family?', choices: ['Fortune-telling/oddity patiences', 'Spider', 'FreeCell', 'Yukon'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Classic Decade is?', choices: ['A short solitaire', 'A 60-minute strategy game', 'A multiplayer card game', 'A bidding game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Aces in Decade count as?', choices: ['One pip', 'Eleven', 'Ten', 'Zero'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Pairs of two face cards may be discarded as?', choices: ['Twenty (multiple of ten)', 'Always invalid', 'Two ranks', 'Doublet'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If unable to make any sum of ten, the player?', choices: ['Loses the deal', 'Reshuffles forever', 'Wins automatically', 'Draws three cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Decade is best described as?', choices: ['A quick tally patience', 'A trick-taking game', 'A betting game', 'A puzzle race'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DecadeSoliSettings): DecadeSoliState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DecadeSoliState, action: DecadeSoliAction): DecadeSoliState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DecadeSoliState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
