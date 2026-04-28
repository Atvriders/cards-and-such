import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SeotdaSettings { questions: "10"; }
export interface SeotdaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SeotdaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Seotda is played with a deck of how many Hwatu cards?", choices: ["18", "20", "22", "24"], correct: 1 },
  { question: "Each player in Seotda is dealt how many cards?", choices: ["1", "2", "3", "5"], correct: 1 },
  { question: "Seotda is fundamentally a?", choices: ["Trick-taking game", "Gambling card game", "Shedding game", "Solitaire"], correct: 1 },
  { question: "The deck uses months from?", choices: ["January–June", "January–October", "June–December", "All twelve"], correct: 1 },
  { question: "A Seotda player can win by?", choices: ["Highest pair or hand", "Lowest hand", "Most cards", "Any 3 in a row"], correct: 0 },
  { question: "The hand 'Gwangttaeng' is named after?", choices: ["A pair of 'light' cards", "A king", "A pawn", "A festival"], correct: 0 },
  { question: "Cards in Seotda are valued by?", choices: ["Suit", "Month and rank", "Random", "Color"], correct: 1 },
  { question: "Sutda is a close variant of Seotda with?", choices: ["Slightly different hand list", "No bets", "Solo only", "Twice as many cards"], correct: 0 },
  { question: "Seotda is most popular in?", choices: ["Japan", "Korea", "Vietnam", "Thailand"], correct: 1 },
  { question: "A Seotda round resembles which Western family?", choices: ["Bridge", "Poker", "Solitaire", "Pinochle"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SeotdaSettings): SeotdaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SeotdaState, action: SeotdaAction): SeotdaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SeotdaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
