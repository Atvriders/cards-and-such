import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AtaxxQuizSettings { questions: "10"; }
export interface AtaxxQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AtaxxQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ataxx is played on a", choices: ["7x7 grid", "8x8 grid", "5x5 grid", "Hex grid"] as [string, string, string, string], correct: 0 },
  { question: "Pieces in Ataxx move by", choices: ["Cloning to adjacent or jumping two squares", "Sliding orthogonally", "Capturing diagonally only", "Following dice rolls"] as [string, string, string, string], correct: 0 },
  { question: "When a piece moves next to opponent pieces", choices: ["It flips them all to your color", "It captures them", "Nothing happens", "It blocks them"] as [string, string, string, string], correct: 0 },
  { question: "The winner of Ataxx is", choices: ["The player with the most pieces when board is full", "The first to capture all", "The first to corner", "The first to four-in-a-row"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx was originally an", choices: ["Arcade video game (1990)", "Ancient board game", "Mobile-only release", "Card game"] as [string, string, string, string], correct: 0 },
  { question: "Cloning vs jumping affects", choices: ["Whether you keep the source piece", "The board size", "Which player moves first", "The clock"] as [string, string, string, string], correct: 0 },
  { question: "Block squares in some Ataxx variants", choices: ["Cannot be moved into", "Are bonus squares", "Are random", "Move on their own"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx is similar in spirit to", choices: ["Othello and Reversi", "Chess", "Backgammon", "Solitaire"] as [string, string, string, string], correct: 0 },
  { question: "When a player has no legal move, they", choices: ["Pass automatically", "Lose immediately", "Win immediately", "Reroll"] as [string, string, string, string], correct: 0 },
  { question: "Ataxx is supported on", choices: ["Many online abstract-game servers", "Only one site", "No site", "Mahjong-only sites"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AtaxxQuizSettings): AtaxxQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AtaxxQuizState, action: AtaxxQuizAction): AtaxxQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AtaxxQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
