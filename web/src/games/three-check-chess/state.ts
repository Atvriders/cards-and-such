import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThreeCheckChessSettings { questions: "10"; }
export interface ThreeCheckChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThreeCheckChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Three-Check Chess: how many checks needed to win?", choices: ["1", "2", "3", "5"], correct: 2 },
  { question: "White Q on h5, Black king on g8. Best move toward a check?", choices: ["Qxh7+", "Qe2", "Qd1", "Qa5"], correct: 0 },
  { question: "You've delivered 2 checks. Your opponent's king is on h8. Best continuation?", choices: ["Find any line that delivers a final check", "Trade queens", "Castle", "Promote a pawn"], correct: 0 },
  { question: "What is the value of a useless check (one easily blocked)?", choices: ["Worthless", "Still counts as one of the three", "Costs a check", "Loses material"], correct: 1 },
  { question: "Bishop on b5 pinning the d7 knight to the king. Best move?", choices: ["Bxd7+", "Move bishop", "Trade", "Stay put"], correct: 0 },
  { question: "Defensive priority in Three-Check?", choices: ["Avoid being checked at all costs", "Pawn structure", "Queen exchange", "Castling speed"], correct: 0 },
  { question: "Knight check: Nf6+. Best? You're chasing the third check.", choices: ["Yes — free check", "No, lose tempo", "Trade pieces", "Promote"], correct: 0 },
  { question: "Rook lift Rh3-Rf3 readying f-file battery. After Rf3, Black king on g8. Threat?", choices: ["Rxf7+", "Rxa7", "Bxh7", "Nothing"], correct: 0 },
  { question: "Sacrificing a piece for a forcing check is?", choices: ["Always bad", "Often justified — checks are currency here", "Illegal", "Forced"], correct: 1 },
  { question: "King runs from check; opponent has 2/3 already. Best plan?", choices: ["Activate every checking piece you have", "Trade pieces", "Push pawns", "Resign"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ThreeCheckChessSettings): ThreeCheckChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThreeCheckChessState, action: ThreeCheckChessAction): ThreeCheckChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThreeCheckChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
