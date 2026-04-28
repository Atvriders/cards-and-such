import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarseillaisChessSettings { questions: "10"; }
export interface MarseillaisChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarseillaisChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Marseillais Chess: moves per turn?", choices: ["Two", "One", "Three", "Four"], correct: 0 },
  { question: "If your first move gives check?", choices: ["You may not make second move (depending on ruleset)", "Always second move", "Free pass", "Trade"], correct: 0 },
  { question: "White's first turn?", choices: ["Often only one move (Balanced Marseillais)", "Two moves", "Three moves", "None"], correct: 0 },
  { question: "Origin of name?", choices: ["Marseille, France (1925)", "Madrid", "Moscow", "Munich"], correct: 0 },
  { question: "After your two moves, opponent plays?", choices: ["Two moves of their own", "One move", "Three moves", "All pawns"], correct: 0 },
  { question: "Tactical surprise?", choices: ["Double-move combinations create huge threats", "Same as classical", "No tactics", "Just trades"], correct: 0 },
  { question: "Castling?", choices: ["Counts as one of your two moves", "Free", "Forbidden", "Two-move special"], correct: 0 },
  { question: "Why does king safety dominate?", choices: ["Two moves can mate from a calm position", "Same risk", "King invincible", "King removed"], correct: 0 },
  { question: "Repeating positions?", choices: ["Special rules for repetition", "Standard", "Forbidden", "Always draw"], correct: 0 },
  { question: "Best opening principle?", choices: ["Develop two pieces per turn — race for control", "Push h-pawn", "Castle long", "Trade queens"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MarseillaisChessSettings): MarseillaisChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MarseillaisChessState, action: MarseillaisChessAction): MarseillaisChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MarseillaisChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
