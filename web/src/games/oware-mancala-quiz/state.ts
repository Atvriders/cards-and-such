import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OwareMancalaQuizSettings { questions: "10"; }
export interface OwareMancalaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OwareMancalaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Oware originated in", choices: ["West Africa (Ghana / Akan culture)", "Northern Europe", "Southeast Asia", "South America"] as [string, string, string, string], correct: 0 },
  { question: "Oware is a member of the", choices: ["Mancala family of count-and-capture games", "Chess family", "Solitaire family", "Backgammon family"] as [string, string, string, string], correct: 0 },
  { question: "The Oware board has", choices: ["Two rows of six houses plus stores", "Two rows of eight houses", "A hex grid", "A 9x9 board"] as [string, string, string, string], correct: 0 },
  { question: "Capturing in Oware happens when", choices: ["Last seed lands in opponent house making 2 or 3", "Last seed makes 5", "You roll a six", "You collect ten seeds"] as [string, string, string, string], correct: 0 },
  { question: "Sowing in Oware is", choices: ["Counter-clockwise around the board", "Random", "Clockwise only", "Diagonal"] as [string, string, string, string], correct: 0 },
  { question: "Initial Oware seeds per house are", choices: ["Four seeds", "Two seeds", "Eight seeds", "Twelve seeds"] as [string, string, string, string], correct: 0 },
  { question: "The famine rule says", choices: ["You must give opponent seeds when they have none", "You skip turns", "You lose seeds", "You roll dice"] as [string, string, string, string], correct: 0 },
  { question: "Oware is also called", choices: ["Awale, Ayo, or Wari (regional names)", "Senet", "Ludo", "Pachisi"] as [string, string, string, string], correct: 0 },
  { question: "Oware is recognized by UNESCO as", choices: ["Cultural heritage in some regions", "Modern technology", "A discontinued sport", "An esport only"] as [string, string, string, string], correct: 0 },
  { question: "A typical Oware match", choices: ["Lasts a few minutes among experienced players", "Lasts hours always", "Has only one move", "Cannot end"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OwareMancalaQuizSettings): OwareMancalaQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OwareMancalaQuizState, action: OwareMancalaQuizAction): OwareMancalaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OwareMancalaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
