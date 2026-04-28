import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BughouseSettings { questions: "10"; }
export interface BughouseState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BughouseAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Bughouse rule: when do you receive pieces from your partner?", choices: ["When you call for them", "Whenever they capture a piece", "Only at the end of their turn", "Only when you are in check"], correct: 1 },
  { question: "White: Ke1, Qd1, Rh1. Black: Ke8 with weak f7. You have a Knight in hand. Best drop square?", choices: ["N@f5", "N@e5", "N@g5", "N@b5"], correct: 0 },
  { question: "Why are passed pieces from partner so dangerous in Bughouse?", choices: ["They double in value", "They can be dropped on almost any square", "They check automatically", "They cannot be captured"], correct: 1 },
  { question: "Black king on e8, only escape squares e7 and d7. You have a Q in hand. Best drop?", choices: ["Q@e7+", "Q@d8#", "Q@h5", "Q@a4"], correct: 1 },
  { question: "A pawn dropped on the 7th rank threatens what?", choices: ["Immediate promotion next move", "Nothing special", "An automatic queen", "Capturing en passant"], correct: 0 },
  { question: "Time pressure tactic in Bughouse: which piece request is highest priority?", choices: ["Pawn", "Bishop", "Knight", "Whatever delivers immediate mate"], correct: 3 },
  { question: "Partner says 'sit'. You should?", choices: ["Stop moving so they can win on time", "Resign", "Take any piece", "Trade queens"], correct: 0 },
  { question: "King on g1, weakened by missing f2 and h2 pawns. Opponent has a knight in hand. Threat?", choices: ["N@f3+", "N@h3+", "N@e2+ forking", "All of the above"], correct: 3 },
  { question: "When can a pawn be dropped on the 1st rank?", choices: ["Always", "Never (or on rank 8)", "Only with a king beside it", "Only if you have two pawns"], correct: 1 },
  { question: "Bughouse mate trick: King on h8, g8, h7 all controlled. Drop?", choices: ["Q@g7#", "Q@h2", "R@a1", "B@b2"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BughouseSettings): BughouseState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BughouseState, action: BughouseAction): BughouseState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BughouseState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
