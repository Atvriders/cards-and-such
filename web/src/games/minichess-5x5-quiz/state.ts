import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Minichess5x5QuizSettings { questions: "10"; }
export interface Minichess5x5QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Minichess5x5QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Minichess 5x5 uses a", choices: ["5x5 board with one fewer piece per side", "8x8 board", "6x6 board", "7x7 board"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in 5x5 minichess promote on", choices: ["The far rank", "The middle rank", "After three moves", "Never"] as [string, string, string, string], correct: 0 },
  { question: "The board is small enough to", choices: ["Be solved by computer search", "Last hundreds of moves", "Require draughts pieces", "Be only theoretical"] as [string, string, string, string], correct: 0 },
  { question: "Compared to standard chess, 5x5 minichess is", choices: ["Faster and more tactical", "Slower and positional", "Identical", "Without any pieces"] as [string, string, string, string], correct: 0 },
  { question: "One inventor of a 5x5 chess variant is", choices: ["Martin Gardner (Gardner minichess)", "Bobby Fischer", "Magnus Carlsen", "Alan Turing"] as [string, string, string, string], correct: 0 },
  { question: "The reduced board removes", choices: ["Bishops or another minor piece in some variants", "The king", "Both rooks", "All pawns"] as [string, string, string, string], correct: 0 },
  { question: "Castling in 5x5 minichess is", choices: ["Usually not allowed", "Mandatory each game", "Allowed three times", "On the d-file only"] as [string, string, string, string], correct: 0 },
  { question: "Endgame study in 5x5 minichess focuses on", choices: ["Mate with very few pieces", "Slow pawn races", "Bishop pairs", "Multi-piece sacrifices"] as [string, string, string, string], correct: 0 },
  { question: "A 5x5 minichess game typically lasts", choices: ["Tens of moves", "Hundreds of moves", "A single move", "No moves"] as [string, string, string, string], correct: 0 },
  { question: "5x5 minichess is studied because", choices: ["It is small enough to be near-solved", "It is the most popular variant", "It is FIDE-rated", "Computers cannot play it"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Minichess5x5QuizSettings): Minichess5x5QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Minichess5x5QuizState, action: Minichess5x5QuizAction): Minichess5x5QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Minichess5x5QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
