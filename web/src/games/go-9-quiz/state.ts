import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Go9QuizSettings { questions: "10"; }
export interface Go9QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Go9QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Go 9x9 is intended for", choices: ["Beginners and quick games", "Professional tournaments only", "Endgame study only", "Random luck-based play"] as [string, string, string, string], correct: 0 },
  { question: "Compared to 19x19, the strategy is", choices: ["More tactical and less positional", "Identical", "Pure ladder play", "Pure ko fights"] as [string, string, string, string], correct: 0 },
  { question: "A typical 9x9 game lasts", choices: ["Around 30–50 moves total", "Hundreds of moves", "Three moves", "Hours per game"] as [string, string, string, string], correct: 0 },
  { question: "Komi (white compensation) on 9x9 is usually", choices: ["Around 6.5 or 7", "0", "50", "100"] as [string, string, string, string], correct: 0 },
  { question: "Beginner concepts emphasized on 9x9 include", choices: ["Liberties, captures, and life-and-death basics", "Joseki memorization", "Cosmic openings", "Endgame yose"] as [string, string, string, string], correct: 0 },
  { question: "The first move on 9x9 is often", choices: ["On a 5-5 or 4-4 point", "On 3-3 always", "In the center always", "On the edge"] as [string, string, string, string], correct: 0 },
  { question: "Pass-pass agreement", choices: ["Ends the game and triggers scoring", "Reverses the last move", "Forces a redo", "Starts a tiebreaker"] as [string, string, string, string], correct: 0 },
  { question: "Influence on 9x9 is", choices: ["Less important than on 19x19", "More important than on 19x19", "Identical", "Negative"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go is great for", choices: ["Teaching the rules quickly", "Endurance training", "Random luck testing", "Pure puzzles"] as [string, string, string, string], correct: 0 },
  { question: "Online 9x9 Go is offered by", choices: ["OGS, KGS, and most Go servers", "Only one site", "No site", "Mahjong-only sites"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Go9QuizSettings): Go9QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Go9QuizState, action: Go9QuizAction): Go9QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Go9QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
