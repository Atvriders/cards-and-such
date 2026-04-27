import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface LogicPuzzlesQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LogicPuzzlesQuizSettings { questions: "10" | "20"; }
export interface LogicPuzzlesQuizState { questions: LogicPuzzlesQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LogicPuzzlesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: LogicPuzzlesQuizQuestion[] = [
  { question: "All cats are mammals. Garfield is a cat. So Garfield is a?", choices: ["Bird","Mammal","Reptile","Plant"], correct: 1 },
  { question: "If P implies Q, and P is true, then Q is?", choices: ["False","Unknown","True","Sometimes"], correct: 2 },
  { question: "The contrapositive of 'If P then Q' is?", choices: ["If Q then P","If not Q then not P","If not P then Q","If P then not Q"], correct: 1 },
  { question: "All A are B. Some C are A. Therefore some C are?", choices: ["Not B","B","Different","Equivalent"], correct: 1 },
  { question: "P AND Q is true only when?", choices: ["Either is true","Both are true","Neither","P is true"], correct: 1 },
  { question: "If 'all dogs bark', then a non-barking animal is?", choices: ["A dog","Not a dog","Maybe a dog","Always a cat"], correct: 1 },
  { question: "Modus ponens: from P→Q and P, conclude?", choices: ["¬Q","Q","¬P","P"], correct: 1 },
  { question: "Modus tollens: from P→Q and ¬Q, conclude?", choices: ["Q","P","¬P","Both P and Q"], correct: 2 },
  { question: "P OR Q is true when?", choices: ["Both false","At least one true","Both true only","Never"], correct: 1 },
  { question: "NOT(P AND Q) equals?", choices: ["P AND Q","¬P AND ¬Q","¬P OR ¬Q","P OR Q"], correct: 2 },
  { question: "If a knave always lies, and they say 'I am a knight', they are a?", choices: ["Knight","Knave","Either","Neither"], correct: 1 },
  { question: "'Some A are B' is the negation of?", choices: ["No A are B","All A are B","Some A are not B","All B are A"], correct: 0 },
  { question: "Affirming the consequent is a?", choices: ["Valid form","Fallacy","Tautology","Theorem"], correct: 1 },
  { question: "If 'A or B' and 'not A', then?", choices: ["A","B","Neither","Both"], correct: 1 },
  { question: "Tautology: P OR ¬P is always?", choices: ["False","True","Sometimes","Undefined"], correct: 1 },
  { question: "All birds can fly is FALSE because of which?", choices: ["Sparrow","Penguin","Eagle","Robin"], correct: 1 },
  { question: "Universal quantifier symbol is?", choices: ["∃","∀","¬","∧"], correct: 1 },
  { question: "Existential quantifier symbol is?", choices: ["∃","∀","¬","∨"], correct: 0 },
  { question: "From 'A→B' and 'B→C', conclude?", choices: ["A→C","C→A","¬A","B"], correct: 0 },
  { question: "A→B is FALSE only when?", choices: ["A true, B true","A true, B false","A false, B true","A false, B false"], correct: 1 },
  { question: "Three friends: only one tells truth. If Anne says 'Beth lies', and Beth says 'Carol lies', who tells truth?", choices: ["Anne","Beth","Carol","Cannot say"], correct: 1 },
  { question: "All men are mortal; Socrates is a man. Therefore Socrates is?", choices: ["Eternal","Mortal","Unknown","Greek"], correct: 1 },
  { question: "The negation of 'all are X' is?", choices: ["None are X","Some are not X","Some are X","All are not X"], correct: 1 },
  { question: "De Morgan: NOT(P OR Q) equals?", choices: ["¬P OR ¬Q","¬P AND ¬Q","P AND Q","Tautology"], correct: 1 },
  { question: "If today is Monday, then tomorrow is Tuesday. Today is Monday. Tomorrow is?", choices: ["Sunday","Tuesday","Wednesday","Cannot infer"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LogicPuzzlesQuizSettings): LogicPuzzlesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LogicPuzzlesQuizState, action: LogicPuzzlesQuizAction): LogicPuzzlesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LogicPuzzlesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
