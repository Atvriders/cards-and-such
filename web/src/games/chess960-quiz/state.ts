import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Chess960QuizSettings { questions: "10"; }
export interface Chess960QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Chess960QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chess960 randomizes the", choices: ["Back-rank starting position", "Pawn moves", "Board size", "Capture rules"], correct: 0 },
  { question: "The bishops in Chess960 always start", choices: ["On opposite-color squares", "On same-color squares", "Both on dark squares", "Both on light squares"], correct: 0 },
  { question: "Chess960 was invented by", choices: ["Bobby Fischer", "Garry Kasparov", "Magnus Carlsen", "Wilhelm Steinitz"], correct: 0 },
  { question: "Number of legal starting positions", choices: ["960", "100", "8", "1024"], correct: 0 },
  { question: "The king in Chess960 must start", choices: ["Between the two rooks", "On the e-file", "On a corner", "On rank 1 always"], correct: 0 },
  { question: "Castling in Chess960", choices: ["Works but is generalized for any starting position", "Is forbidden", "Identical to FIDE", "Replaced by drops"], correct: 0 },
  { question: "Pawn rules in Chess960 are", choices: ["Standard chess pawn rules", "Move three squares", "No promotion", "Capture forward"], correct: 0 },
  { question: "Chess960 is favored because it", choices: ["Reduces opening memorization", "Adds new pieces", "Lengthens the game", "Uses dice"], correct: 0 },
  { question: "Year Fischer announced Chess960", choices: ["1996", "1972", "1985", "2010"], correct: 0 },
  { question: "Chess960 was originally called", choices: ["Fischer Random Chess", "Wild Chess", "Random Knights", "Open Chess"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Chess960QuizSettings): Chess960QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Chess960QuizState, action: Chess960QuizAction): Chess960QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Chess960QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
