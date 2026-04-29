import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface YConnectionQuizSettings { questions: "10"; }
export interface YConnectionQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type YConnectionQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The game Y is won by", choices: ["Connecting three sides of a triangle board", "Capturing the king", "Filling all hexes", "Forming five in a row"] as [string, string, string, string], correct: 0 },
  { question: "Y was invented by", choices: ["Claude Shannon (and others)", "Bobby Fischer", "Alan Turing", "Edsger Dijkstra"] as [string, string, string, string], correct: 0 },
  { question: "Y is closely related to", choices: ["Hex (rhombus connection game)", "Backgammon", "Mahjong", "Bridge"] as [string, string, string, string], correct: 0 },
  { question: "Like Hex, Y has", choices: ["No draws — exactly one connection wins", "Many draws", "Random luck", "No skill"] as [string, string, string, string], correct: 0 },
  { question: "The Y board is", choices: ["Triangular with hex cells", "Square with grid cells", "Circular", "Hex with hex cells only"] as [string, string, string, string], correct: 0 },
  { question: "Y is harder than Hex because", choices: ["Connecting three sides is more constrained", "It is easier", "It uses dice", "It uses cards"] as [string, string, string, string], correct: 0 },
  { question: "The pie rule in Y allows", choices: ["Second player to swap on the first move", "Doubling the score", "Removing pieces", "Skipping turns"] as [string, string, string, string], correct: 0 },
  { question: "Strategically Y emphasizes", choices: ["Templates and bridges (group connections)", "Random play", "Pure capture", "Pure speed"] as [string, string, string, string], correct: 0 },
  { question: "A turn in Y is", choices: ["Place one stone of your color", "Place three stones", "Move stones", "Roll dice"] as [string, string, string, string], correct: 0 },
  { question: "Y is part of the", choices: ["Connection games family with Hex, Twixt, Havannah", "Rummy family", "Solitaire family", "Backgammon family"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: YConnectionQuizSettings): YConnectionQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: YConnectionQuizState, action: YConnectionQuizAction): YConnectionQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: YConnectionQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
