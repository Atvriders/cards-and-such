import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BaoMancalaQuizSettings { questions: "10"; }
export interface BaoMancalaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BaoMancalaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Bao is played in", choices: ["East Africa (Tanzania, Zanzibar, Kenya)", "Western Europe", "South America", "Northern Asia"] as [string, string, string, string], correct: 0 },
  { question: "Bao is famous for being", choices: ["One of the deepest Mancala variants", "A pure-luck game", "A trivia game", "A dice race"] as [string, string, string, string], correct: 0 },
  { question: "The Bao board has", choices: ["Four rows of eight pits", "Two rows of six pits", "A hex grid", "A 9x9 board"] as [string, string, string, string], correct: 0 },
  { question: "Bao has two phases:", choices: ["Namua (introducing seeds) and mtaji (capture phase)", "Opening and endgame only", "Setup and tear-down", "Pre-flop and post-flop"] as [string, string, string, string], correct: 0 },
  { question: "Captures in Bao occur when", choices: ["You land in an opposing inner pit with seeds", "You roll a six", "You play a queen", "You end on a corner"] as [string, string, string, string], correct: 0 },
  { question: "A Bao match can last", choices: ["An hour or longer between strong players", "Only seconds", "Days", "No time"] as [string, string, string, string], correct: 0 },
  { question: "The official body for Bao competition includes", choices: ["Bao tournaments held in Zanzibar", "No formal body", "A FIDE chapter", "An English club"] as [string, string, string, string], correct: 0 },
  { question: "Bao is recognized as", choices: ["Cultural heritage by Tanzanian and Zanzibari communities", "A discontinued sport", "A modern luxury good", "An esport only"] as [string, string, string, string], correct: 0 },
  { question: "Compared to Oware, Bao is", choices: ["Significantly more complex", "Identical", "Simpler", "A children-only version"] as [string, string, string, string], correct: 0 },
  { question: "Bao players are sometimes called", choices: ["Bao-meisters or experienced players", "Bao knights", "Bao kings", "Bao priests"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BaoMancalaQuizSettings): BaoMancalaQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BaoMancalaQuizState, action: BaoMancalaQuizAction): BaoMancalaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BaoMancalaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
