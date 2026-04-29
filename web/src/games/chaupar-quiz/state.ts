import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChauparSettings { questions: "10"; }
export interface ChauparState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChauparAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chaupar is played on what shape of board?", choices: ["Square","Round","Cross-shaped cloth","Hexagonal"], correct: 2 },
  { question: "Chaupar's traditional dice are?", choices: ["Six-sided cubes","Cowrie shells","Tarot cards","Coins"], correct: 1 },
  { question: "Chaupar is the antecedent of which modern game?", choices: ["Bridge","Pachisi / Ludo","Mahjong","Chess"], correct: 1 },
  { question: "Chaupar was famously played at the court of which Mughal emperor?", choices: ["Babur","Akbar","Aurangzeb","Shah Jahan"], correct: 1 },
  { question: "A standard Chaupar game has how many players?", choices: ["1","2","4","8"], correct: 2 },
  { question: "The aim of Chaupar is to?", choices: ["Capture the king","Race all pieces home","Match cards","Capture territory"], correct: 1 },
  { question: "Chaupar originates from which country?", choices: ["China","India","Egypt","Persia"], correct: 1 },
  { question: "Akbar reportedly used what for life-sized Chaupar?", choices: ["Animals","Court servants as pieces","Coins","Lanterns"], correct: 1 },
  { question: "Chaupar's complexity is rated as?", choices: ["Light","Medium","Heavy","Extreme"], correct: 0 },
  { question: "Chaupar's name in some regions is?", choices: ["Chausar","Chausa","Chowsar","All of these"], correct: 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChauparSettings): ChauparState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChauparState, action: ChauparAction): ChauparState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChauparState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
