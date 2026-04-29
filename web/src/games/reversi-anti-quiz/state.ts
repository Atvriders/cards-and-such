import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReversiAntiQuizSettings { questions: "10"; }
export interface ReversiAntiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReversiAntiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Anti-Othello win condition is", choices: ["Fewest discs of your color when board fills", "Most discs", "Capturing the corners", "Forming a diagonal"] as [string, string, string, string], correct: 0 },
  { question: "Compared to Othello, the strategy is", choices: ["Often inverted — corners may be liabilities", "Identical", "Slower only", "Random"] as [string, string, string, string], correct: 0 },
  { question: "You generally want to", choices: ["Force opponent to flip more discs", "Keep your discs in the center", "Avoid flips entirely", "Pass each turn"] as [string, string, string, string], correct: 0 },
  { question: "Passing in Anti-Othello is", choices: ["Allowed only when no legal move exists", "Mandatory each turn", "Forbidden", "Free at any time"] as [string, string, string, string], correct: 0 },
  { question: "The board is", choices: ["8x8 with two starting discs each", "6x6", "10x10", "4x4"] as [string, string, string, string], correct: 0 },
  { question: "Color of the side moving first is", choices: ["Black, traditionally", "White always", "Red", "Random"] as [string, string, string, string], correct: 0 },
  { question: "Mobility (number of legal moves) in Anti-Othello is", choices: ["Important — restricting opponent forces flips", "Irrelevant", "Always equal between sides", "Counted only at end"] as [string, string, string, string], correct: 0 },
  { question: "Anti-Othello is sometimes called", choices: ["Reverse Reversi", "Othello-Plus", "Mega Reversi", "Tiny Othello"] as [string, string, string, string], correct: 0 },
  { question: "Edge play in Anti-Othello is", choices: ["Subtle — edges are not always good", "Always good", "Always bad", "Forbidden"] as [string, string, string, string], correct: 0 },
  { question: "The variant is", choices: ["Strategically distinct from Othello", "Identical to Othello", "A pure-luck game", "A solved game"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ReversiAntiQuizSettings): ReversiAntiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReversiAntiQuizState, action: ReversiAntiQuizAction): ReversiAntiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReversiAntiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
