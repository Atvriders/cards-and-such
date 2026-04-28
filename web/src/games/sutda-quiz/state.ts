import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SutdaSettings { questions: "10"; }
export interface SutdaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SutdaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sutda is closely related to which other Korean game?", choices: ["Go-Stop", "Seotda", "Hwatu", "Janggi"], correct: 1 },
  { question: "Sutda uses how many Hwatu cards in the deck?", choices: ["18", "20", "22", "24"], correct: 1 },
  { question: "Each player is dealt how many cards?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Sutda differs from Seotda mainly in?", choices: ["Allowed hand combinations", "Number of players", "Card design", "Deck size"], correct: 0 },
  { question: "Sutda is fundamentally a?", choices: ["Solitaire", "Gambling card game", "Trick-taking", "Shedding"], correct: 1 },
  { question: "A famous Korean film about Hwatu gambling featuring Sutda is?", choices: ["Tazza", "Old Boy", "Memories of Murder", "The Host"], correct: 0 },
  { question: "The deck for Sutda uses cards from months?", choices: ["January to October", "January to December", "June to December", "Random"], correct: 0 },
  { question: "A Sutda 'high pair' is generally?", choices: ["The lowest hand", "A high-value hand", "Forbidden", "An ace"], correct: 1 },
  { question: "Sutda hand names are typically?", choices: ["Numbers only", "Traditional Korean nicknames", "Letters only", "English words"], correct: 1 },
  { question: "Sutda is most often played at?", choices: ["Schools", "Gatherings", "Children's clubs", "Tournaments only"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SutdaSettings): SutdaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SutdaState, action: SutdaAction): SutdaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SutdaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
