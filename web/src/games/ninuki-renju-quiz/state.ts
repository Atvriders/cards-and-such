import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NinukiRenjuSettings { questions: "10"; }
export interface NinukiRenjuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NinukiRenjuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ninuki-Renju adds which alternative win condition?", choices: ["Diagonals only", "Capture five pairs", "Castle", "Most pieces"], correct: 1 },
  { question: "A 'pair capture' requires sandwiching how many opponent stones?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "A pair is captured when surrounded by?", choices: ["Random stones", "Two of your own on opposite sides", "All four sides", "A diagonal"], correct: 1 },
  { question: "Ninuki-Renju is most closely derived from?", choices: ["Othello", "Renju", "Backgammon", "Chess"], correct: 1 },
  { question: "The total number of pair-captures needed to win is?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "Captured stones are?", choices: ["Returned to play", "Removed and counted", "Moved one square", "Stacked"], correct: 1 },
  { question: "Ninuki-Renju is sometimes called the ancestor of?", choices: ["Backgammon", "Pente", "Othello", "Mancala"], correct: 1 },
  { question: "Pente uses Ninuki-Renju's mechanic of?", choices: ["Pair captures", "Trick taking", "Bidding", "Suit ranking"], correct: 0 },
  { question: "Compared to standard Renju, Ninuki-Renju is?", choices: ["Tactically richer", "Strictly slower", "Solo only", "Score-only"], correct: 0 },
  { question: "Players must defend against?", choices: ["Five-in-row only", "Captures only", "Both five-in-row and captures", "Time only"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: NinukiRenjuSettings): NinukiRenjuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NinukiRenjuState, action: NinukiRenjuAction): NinukiRenjuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NinukiRenjuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
