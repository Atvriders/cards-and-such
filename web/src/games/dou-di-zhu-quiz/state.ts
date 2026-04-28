import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DouDiZhuSettings { questions: "10"; }
export interface DouDiZhuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DouDiZhuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Dou Di Zhu is played by how many players?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "The literal translation of Dou Di Zhu is?", choices: ["Fight the Landlord", "Win the Field", "Three Friends", "Battle Cards"], correct: 0 },
  { question: "The 'Landlord' plays against?", choices: ["Both other players", "One other", "Banker", "No one"], correct: 0 },
  { question: "The Landlord is decided by?", choices: ["Highest card", "Bidding", "Random", "Coin flip"], correct: 1 },
  { question: "Dou Di Zhu uses how many cards (with jokers)?", choices: ["52", "53", "54", "56"], correct: 2 },
  { question: "The two jokers in Dou Di Zhu are usually?", choices: ["Both wild", "Big and small joker", "Discarded", "Both rank 1"], correct: 1 },
  { question: "The Big Joker is the?", choices: ["Lowest card", "Highest single card", "Bonus card", "Wild only"], correct: 1 },
  { question: "Dou Di Zhu is fundamentally a?", choices: ["Trick-taking game", "Shedding game", "Bluffing game", "Solitaire"], correct: 1 },
  { question: "A 'rocket' in Dou Di Zhu is?", choices: ["Both jokers played together", "Pair of 2s", "Bonus card", "A bid"], correct: 0 },
  { question: "The peasants win by either of them?", choices: ["Becoming Landlord", "Emptying their hand first", "Reaching 100", "Surrendering"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DouDiZhuSettings): DouDiZhuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DouDiZhuState, action: DouDiZhuAction): DouDiZhuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DouDiZhuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
