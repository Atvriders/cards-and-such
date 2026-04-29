import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Go19x19Settings { questions: "10"; }
export interface Go19x19State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Go19x19Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Standard Go board has", choices: ["361 intersections (19×19)", "169 (13×13)", "81 (9×9)", "100 (10×10)"], correct: 0 },
  { question: "Stones are placed on", choices: ["Intersections, not squares", "Squares", "Edges only", "Corners only"], correct: 0 },
  { question: "A stone is captured when", choices: ["It has no liberties (no adjacent empty intersections)", "It is surrounded diagonally", "After 5 moves", "By any move"], correct: 0 },
  { question: "Komi is", choices: ["Compensation points for white (typically 6.5 or 7.5)", "A capture rule", "A piece type", "An opening"], correct: 0 },
  { question: "The ko rule prevents", choices: ["Immediate recapture in single-stone-capture cycles", "Long sequences", "Castling", "Promotion"], correct: 0 },
  { question: "Game ends when", choices: ["Both players pass consecutively", "First capture", "100 moves", "Time runs out"], correct: 0 },
  { question: "Score counts", choices: ["Territory + captured stones (or area scoring)", "Captures only", "Stones placed", "Liberties"], correct: 0 },
  { question: "A 'living' group has", choices: ["Two real eyes", "One eye", "Three captures", "Three liberties"], correct: 0 },
  { question: "Handicap stones can be placed by", choices: ["Black before play to balance skill differences", "Either side anytime", "Only the referee", "Only after move 50"], correct: 0 },
  { question: "Go originated in", choices: ["Ancient China (~2,500 years ago)", "Modern Japan", "Korea 1900s", "Roman Empire"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Go19x19Settings): Go19x19State {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Go19x19State, action: Go19x19Action): Go19x19State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Go19x19State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
