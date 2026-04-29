import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Go13x13Settings { questions: "10"; }
export interface Go13x13State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Go13x13Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "13×13 Go has", choices: ["169 intersections", "361 intersections", "81 intersections", "256 intersections"], correct: 0 },
  { question: "Compared to 19×19, 13×13 games", choices: ["Are shorter and more tactical", "Last longer", "Have no captures", "Are unstable"], correct: 0 },
  { question: "Komi for 13×13 is typically", choices: ["Around 5.5–7.5 (varies)", "Always 0", "Always 30", "Negative"], correct: 0 },
  { question: "Same fundamental rules apply, including", choices: ["Liberties, ko, and territory scoring", "Drops", "Promotion", "Castling"], correct: 0 },
  { question: "13×13 is popular for", choices: ["Practice and intermediate play", "World championships", "Bullet only", "Solo puzzles only"], correct: 0 },
  { question: "A typical game lasts", choices: ["About 30–60 minutes", "Days", "5 seconds", "100 moves max"], correct: 0 },
  { question: "Strategic difference vs 19×19", choices: ["Less room for large frameworks; more direct fighting", "More large frameworks", "No fighting", "All endgame"], correct: 0 },
  { question: "Handicap stones are", choices: ["Often used to balance teaching games", "Forbidden", "Mandatory", "Never used"], correct: 0 },
  { question: "Eye shapes still need", choices: ["Two real eyes for life", "Three eyes", "One eye", "No eyes"], correct: 0 },
  { question: "13×13 is good for learning", choices: ["Whole-board concepts in shorter sessions", "Memorized openings", "Mancala rules", "Chess theory"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Go13x13Settings): Go13x13State {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Go13x13State, action: Go13x13Action): Go13x13State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Go13x13State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
