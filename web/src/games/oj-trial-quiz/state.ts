import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OjTrialQuizSettings { questions: "10" | "20" | "30"; }
export interface OjTrialQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OjTrialQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The trial took place in which year?", choices: ["1993","1995","1997","1999"], correct: 1 },
  { question: "The murders occurred in which year?", choices: ["1992","1994","1996","1998"], correct: 1 },
  { question: "The judge was?", choices: ["Lance Ito","William Rehnquist","Sandra Day O'Connor","Mathis"], correct: 0 },
  { question: "Lead defense attorney was?", choices: ["Marcia Clark","Johnnie Cochran","Robert Shapiro","Both Cochran and Shapiro"], correct: 3 },
  { question: "Lead prosecutor was?", choices: ["Marcia Clark","Christopher Darden","Both","Vincent Bugliosi"], correct: 2 },
  { question: "The Bronco chase was on?", choices: ["June 17, 1994","July 4, 1994","August 1, 1994","September 1, 1994"], correct: 0 },
  { question: "The famous defense line was?", choices: ["If it doesn't fit, you must acquit","Guilty as charged","Reasonable doubt","No comment"], correct: 0 },
  { question: "The 'glove' demonstration was about?", choices: ["Crime scene gloves","OJ wearing them","Both","Forensics"], correct: 2 },
  { question: "Robert Kardashian was?", choices: ["Prosecutor","Member of defense team and friend","Witness","Judge"], correct: 1 },
  { question: "Mark Fuhrman was?", choices: ["Defense attorney","LAPD detective","Coroner","Forensics"], correct: 1 },
  { question: "Mark Fuhrman was later convicted of?", choices: ["Murder","Perjury","Drugs","DUI"], correct: 1 },
  { question: "Kato Kaelin was?", choices: ["Witness/houseguest","Detective","Lawyer","Coroner"], correct: 0 },
  { question: "The murder victims were?", choices: ["Nicole and Ronald","Nicole only","Both Nicole Brown and Ron Goldman","Nicole and Robert"], correct: 2 },
  { question: "The trial verdict came in?", choices: ["October 1995","June 1995","December 1995","March 1996"], correct: 0 },
  { question: "The criminal verdict was?", choices: ["Not guilty","Guilty","Mistrial","Hung jury"], correct: 0 },
  { question: "The civil trial verdict was?", choices: ["Liable","Not liable","Mistrial","Settled"], correct: 0 },
  { question: "The civil trial verdict came in?", choices: ["1996","1997","1998","2000"], correct: 1 },
  { question: "DNA evidence in OJ trial was relatively?", choices: ["Old hat","New for jurors","Banned","Ignored"], correct: 1 },
  { question: "The Bronco was driven by?", choices: ["OJ","Al Cowlings","Robert Kardashian","Kato"], correct: 1 },
  { question: "The trial lasted approximately?", choices: ["3 months","6 months","9 months","18 months"], correct: 2 },
  { question: "Christopher Darden was famous for the?", choices: ["Glove demonstration","DNA argument","Bronco chase","Closing speech"], correct: 0 },
  { question: "Faye Resnick was?", choices: ["Prosecutor","Friend of Nicole","Detective","Judge"], correct: 1 },
  { question: "After acquittal, OJ moved to?", choices: ["Texas","Florida","Nevada","Arizona"], correct: 1 },
  { question: "OJ later went to prison for?", choices: ["Murder","Tax evasion","Robbery (Nevada, 2007)","DUI"], correct: 2 },
  { question: "The case was dramatized in 'The People v.' on?", choices: ["HBO","FX","Netflix","Showtime"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OjTrialQuizSettings): OjTrialQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OjTrialQuizState, action: OjTrialQuizAction): OjTrialQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OjTrialQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
