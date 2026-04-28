import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SeirawanChessSettings { questions: "10"; }
export interface SeirawanChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SeirawanChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Seirawan Chess board?", choices: ["Standard 8×8", "10×8", "10×10", "12×12"], correct: 0 },
  { question: "Two added pieces?", choices: ["Hawk and Elephant", "Wizard and Champion", "Chancellor and Archbishop", "Lion and Dragon"], correct: 0 },
  { question: "Hawk moves as?", choices: ["Knight + bishop", "Rook + knight", "Queen + knight", "King"], correct: 0 },
  { question: "Elephant moves as?", choices: ["Rook + knight", "Bishop + knight", "Queen", "Knight"], correct: 0 },
  { question: "How are new pieces introduced?", choices: ["Gating in when a back-rank piece moves out", "Dropped randomly", "On promotion only", "Always at start"], correct: 0 },
  { question: "Designer?", choices: ["Yasser Seirawan (with Bruce Harper)", "Bobby Fischer", "Capablanca", "Glinski"], correct: 0 },
  { question: "When are gating pieces deployed?", choices: ["Held off-board until gated", "All on board start", "Random", "Never"], correct: 0 },
  { question: "If you can't gate either piece by end of game?", choices: ["They simply remain unused", "You lose", "Forced gate", "Auto-promote"], correct: 0 },
  { question: "Castling and gating interaction?", choices: ["You can gate during castling too", "Not allowed", "Trade", "Random"], correct: 0 },
  { question: "Why is the rule clever?", choices: ["Adds richness to standard 8×8 without disturbing classical patterns", "Replaces classical entirely", "Removes pieces", "Adds pawns"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SeirawanChessSettings): SeirawanChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SeirawanChessState, action: SeirawanChessAction): SeirawanChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SeirawanChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
