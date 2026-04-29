import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PeasantsRevoltSettings { questions: "10"; }
export interface PeasantsRevoltState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PeasantsRevoltAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Peasants' Revolt: white usually plays", choices: ["A king and one knight (or similar) versus pawns", "A queen", "Eight bishops", "Two kings"], correct: 0 },
  { question: "Black plays", choices: ["A king and eight pawns (peasants)", "16 pieces", "Only the king", "Three rooks"], correct: 0 },
  { question: "The pawns must", choices: ["Promote one of their own to win", "Lose all pawns", "Stalemate", "Reach rank 4"], correct: 0 },
  { question: "The lone-army side wins by", choices: ["Stopping all pawns from promoting (or capturing them all)", "Reaching rank 8", "Checking three times", "Blockading the king"], correct: 0 },
  { question: "Pawn-side strength", choices: ["Numerical mass and promotion threats", "Long-range attack", "Surprise tactics", "Diagonal-only attacks"], correct: 0 },
  { question: "Lone-army strength", choices: ["Mobility and capturing isolated pawns", "Sheer numbers", "Pawn pushes", "Promotion tricks"], correct: 0 },
  { question: "Studied as", choices: ["A pawn-endgame teaching exercise", "An opening line", "A bullet variant", "A standard game"], correct: 0 },
  { question: "Result with best play", choices: ["Often drawn or favors pawns by a hair", "Always pawns win", "Always lone army wins", "Stalemated immediately"], correct: 0 },
  { question: "Castling typically", choices: ["Not relevant — no rooks for either side", "Required", "Forbidden by rule", "Replaces promotion"], correct: 0 },
  { question: "Best pawn-side technique", choices: ["Form an unbroken pawn chain advancing together", "Scatter pawns widely", "Sacrifice all pawns", "Trade nothing"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PeasantsRevoltSettings): PeasantsRevoltState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PeasantsRevoltState, action: PeasantsRevoltAction): PeasantsRevoltState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PeasantsRevoltState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
