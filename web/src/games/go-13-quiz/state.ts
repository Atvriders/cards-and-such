import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Go13QuizSettings { questions: "10"; }
export interface Go13QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Go13QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Go 13x13 sits between", choices: ["9x9 (beginner) and 19x19 (full)", "5x5 and 7x7", "19x19 and 21x21", "Hex and Go"] as [string, string, string, string], correct: 0 },
  { question: "It is recommended for", choices: ["Intermediate players developing strategy", "Pure beginners only", "Professionals only", "Endgame puzzle solvers"] as [string, string, string, string], correct: 0 },
  { question: "A typical 13x13 game lasts", choices: ["Around 80–120 moves", "Three moves", "Five hundred moves", "Thirty seconds"] as [string, string, string, string], correct: 0 },
  { question: "Komi on 13x13 is around", choices: ["6.5 to 7", "0", "20", "100"] as [string, string, string, string], correct: 0 },
  { question: "13x13 lets players practice", choices: ["Both tactics and small-scale strategy", "Only opening theory", "Only endgames", "Only ladder breaks"] as [string, string, string, string], correct: 0 },
  { question: "Compared to 9x9, 13x13 has", choices: ["More room for groups and territory", "Fewer points", "Identical theory", "No territory"] as [string, string, string, string], correct: 0 },
  { question: "Standard scoring is", choices: ["Territory plus captures (Japanese) or area (Chinese)", "Pawn count", "Stones flipped", "Moves played"] as [string, string, string, string], correct: 0 },
  { question: "13x13 was the size used in", choices: ["Some early Go correspondence matches", "No real games", "Only puzzles", "Only Hex"] as [string, string, string, string], correct: 0 },
  { question: "Online 13x13 Go is", choices: ["Available on most Go servers", "Not allowed online", "Restricted to professionals", "Played only on phones"] as [string, string, string, string], correct: 0 },
  { question: "Pros use 13x13 mainly for", choices: ["Teaching and rapid practice", "Official tournaments", "Endurance training", "Endgame studies only"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Go13QuizSettings): Go13QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Go13QuizState, action: Go13QuizAction): Go13QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Go13QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
