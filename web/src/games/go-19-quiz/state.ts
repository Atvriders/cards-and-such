import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Go19QuizSettings { questions: "10"; }
export interface Go19QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Go19QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Standard Go is played on a", choices: ["19x19 board", "9x9", "13x13", "21x21"] as [string, string, string, string], correct: 0 },
  { question: "19x19 Go has been played for", choices: ["Over a thousand years", "Less than fifty years", "Only since 2010", "Less than ten years"] as [string, string, string, string], correct: 0 },
  { question: "A pro game on 19x19 has", choices: ["Around 200–300 moves typically", "Ten moves", "Five thousand moves", "No moves"] as [string, string, string, string], correct: 0 },
  { question: "Komi on 19x19 is currently", choices: ["6.5 (Japanese) or 7.5 (Chinese)", "0", "100", "50"] as [string, string, string, string], correct: 0 },
  { question: "Strong players on 19x19 emphasize", choices: ["Whole-board strategy and direction", "Memorized openings only", "Random play", "Pure tactics only"] as [string, string, string, string], correct: 0 },
  { question: "Joseki are", choices: ["Established corner sequences", "Random openings", "Endgame puzzles", "Captures"] as [string, string, string, string], correct: 0 },
  { question: "The first stones go on", choices: ["Star points (4-4) commonly", "The center always", "The edges only", "The first line only"] as [string, string, string, string], correct: 0 },
  { question: "AlphaGo famously defeated", choices: ["Lee Sedol in 2016", "Magnus Carlsen", "Garry Kasparov", "Ding Liren"] as [string, string, string, string], correct: 0 },
  { question: "Top Go titles include", choices: ["Honinbo, Meijin, and Kisei (Japanese)", "Wimbledon and Roland Garros", "Augusta Masters", "Eternal Cup"] as [string, string, string, string], correct: 0 },
  { question: "19x19 Go is recognized as", choices: ["One of the deepest perfect-information games", "A pure luck game", "A trivia game", "A dice game"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Go19QuizSettings): Go19QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Go19QuizState, action: Go19QuizAction): Go19QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Go19QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
