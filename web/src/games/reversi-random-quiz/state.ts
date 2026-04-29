import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReversiRandomQuizSettings { questions: "10"; }
export interface ReversiRandomQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReversiRandomQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Reversi Randomized Start changes", choices: ["The initial four-disc placement", "The board size", "The rules of flipping", "The number of players"] as [string, string, string, string], correct: 0 },
  { question: "The rest of the rules are", choices: ["Standard Othello", "Anti-Othello", "A pure-luck variant", "Played without flipping"] as [string, string, string, string], correct: 0 },
  { question: "Randomized openings are useful for", choices: ["Forcing fresh thinking each game", "Memorizing opening lines", "Beginner play", "Tournament cheating"] as [string, string, string, string], correct: 0 },
  { question: "Compared to standard Reversi, this variant is", choices: ["Less prone to opening preparation", "Easier to draw", "Without legal flips", "Identical in every way"] as [string, string, string, string], correct: 0 },
  { question: "The board still starts with", choices: ["Two discs of each color", "Eight discs of each color", "No discs", "Sixteen discs"] as [string, string, string, string], correct: 0 },
  { question: "A random start can give", choices: ["One side an early imbalance", "Always perfect symmetry", "A guaranteed first-move win", "A guaranteed draw"] as [string, string, string, string], correct: 0 },
  { question: "Mobility analysis is", choices: ["Especially useful in random openings", "Useless in random openings", "Identical to corner play", "Banned in random openings"] as [string, string, string, string], correct: 0 },
  { question: "The variant is supported on", choices: ["Online Othello servers as a side mode", "FIDE only", "No platform anywhere", "Mahjong sites only"] as [string, string, string, string], correct: 0 },
  { question: "Total discs at game end are still", choices: ["64 minus passed cells", "100", "32", "8"] as [string, string, string, string], correct: 0 },
  { question: "Beginner players in this variant should", choices: ["Focus on local tactics rather than memorized lines", "Memorize opening books", "Avoid the corners always", "Play only the center"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ReversiRandomQuizSettings): ReversiRandomQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReversiRandomQuizState, action: ReversiRandomQuizAction): ReversiRandomQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReversiRandomQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
