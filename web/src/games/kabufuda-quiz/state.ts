import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KabufudaSettings { questions: "10"; }
export interface KabufudaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KabufudaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many cards are in a Kabufuda deck?", choices: ["32","40","48","52"], correct: 1 },
  { question: "Kabufuda is most associated with which game?", choices: ["Koi-Koi","Oicho-Kabu","Hwatu","Big Two"], correct: 1 },
  { question: "Kabufuda is derived from which earlier deck?", choices: ["Hanafuda","Tensho karuta","Tarot","Western 52"], correct: 1 },
  { question: "Each Kabufuda suit has cards numbered 1 through what?", choices: ["8","10","12","13"], correct: 1 },
  { question: "How many suits does the Kabufuda deck have?", choices: ["4","5","6","10"], correct: 0 },
  { question: "Kabufuda is traditionally used at what kind of establishment?", choices: ["Tea house","Gambling house","Shrine","School"], correct: 1 },
  { question: "The target hand value in Oicho-Kabu is?", choices: ["7","8","9","10"], correct: 2 },
  { question: "Kabufuda card art typically features?", choices: ["Geometric numerals","Animals","Famous samurai","Maps"], correct: 0 },
  { question: "Kabufuda decks were historically banned during which era?", choices: ["Heian","Edo","Meiji","Showa"], correct: 1 },
  { question: "Each numbered card in Kabufuda appears how many times?", choices: ["2","3","4","5"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KabufudaSettings): KabufudaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KabufudaState, action: KabufudaAction): KabufudaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KabufudaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
