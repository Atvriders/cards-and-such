import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PocketKnightChessSettings { questions: "10"; }
export interface PocketKnightChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PocketKnightChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pocket Knight Chess: each player has?", choices: ["One extra knight in 'pocket' to drop once", "Two extra", "No extras", "An extra rook"], correct: 0 },
  { question: "When can the pocket knight be dropped?", choices: ["Any turn instead of moving", "Only at start", "Never", "Only at end"], correct: 0 },
  { question: "Drop legal squares?", choices: ["Any empty square (or specific subset by rule)", "Only home rank", "Diagonal only", "Center only"], correct: 0 },
  { question: "Why is the pocket knight powerful?", choices: ["Sudden fork or mate threat from nowhere", "It's slow", "It's weak", "It can't capture"], correct: 0 },
  { question: "Once dropped, the knight?", choices: ["Plays as a normal knight", "Vanishes", "Promotes", "Can be picked up again"], correct: 0 },
  { question: "Strategic principle?", choices: ["Save pocket knight for decisive moment", "Drop immediately", "Drop only when checked", "Never use"], correct: 0 },
  { question: "Defensive concern?", choices: ["King-side weak squares for sudden Nf6/Nf3 drop", "Center pawns", "Promotion", "Bishop pair"], correct: 0 },
  { question: "Drop near opposing king is?", choices: ["Often the killing blow", "Always a blunder", "Illegal", "Free piece"], correct: 0 },
  { question: "Pocket knight opening tip?", choices: ["Develop normally; keep options open", "Drop on move 1", "Never castle", "Trade queens"], correct: 0 },
  { question: "How does this differ from Crazyhouse?", choices: ["Only ONE knight available, not captured pieces", "Same rules", "Drop pawns too", "Drop queens"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PocketKnightChessSettings): PocketKnightChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PocketKnightChessState, action: PocketKnightChessAction): PocketKnightChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PocketKnightChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
