import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TwentyFiveCardSettings { questions: "10"; }
export interface TwentyFiveCardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TwentyFiveCardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Twenty-Five is the national card game of?', choices: ['Ireland', 'Scotland', 'Wales', 'England'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Highest trump in Twenty-Five is?', choices: ['The Five of trumps', 'The Ace of trumps', 'The King of trumps', 'The Jack of trumps'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Second-highest trump is?', choices: ['The Jack of trumps', 'The Ace of Hearts', 'The Five of Hearts', 'The King of trumps'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The Ace of Hearts is?', choices: ['Always third-highest trump regardless of trump suit', 'Always lowest', 'Equal to ten', 'Removed from the deck'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players are dealt how many cards each?', choices: ['Five cards', 'Seven cards', 'Ten cards', 'Three cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of points to win is?', choices: ['Twenty-five points', 'Fifty points', 'One hundred points', 'Ten points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Twenty-Five is part of which family?', choices: ['Spoil Five', 'Bridge', 'Whist', 'Skat'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Best player count is typically?', choices: ['Four or five players', 'Two players', 'Eight players', 'Solo'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Standard deck is?', choices: ['52-card deck', '32-card piquet', 'Tarot deck', 'Bridge double deck'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Reneging in Twenty-Five is allowed for?', choices: ['High trumps in certain situations', 'Never', 'Always', 'Only by the dealer'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TwentyFiveCardSettings): TwentyFiveCardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TwentyFiveCardState, action: TwentyFiveCardAction): TwentyFiveCardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TwentyFiveCardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
