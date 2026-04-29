import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TusuSettings { questions: "10"; }
export interface TusuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TusuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tusu is a traditional Chinese drink associated with?", choices: ["Mid-Autumn Festival","Lunar New Year","Dragon Boat Festival","Qingming"], correct: 1 },
  { question: "Tusu wine is traditionally?", choices: ["Medicinal herbal wine","Plum wine","Rice wine","Date wine"], correct: 0 },
  { question: "Which equipment is used in the Tusu drinking game?", choices: ["Cards","Dice","Tiles","Coins"], correct: 1 },
  { question: "The loser of a Tusu round typically?", choices: ["Wins money","Drinks","Skips a turn","Rolls again"], correct: 1 },
  { question: "Tusu's penalty rules are tied to?", choices: ["Modern songs","Classical legends","Sports","Maths"], correct: 1 },
  { question: "Tusu is consumed traditionally to?", choices: ["Quench thirst","Ward off evil and bring health","Cool down","Celebrate weddings"], correct: 1 },
  { question: "The drink's herbal recipe varies but always includes?", choices: ["Tea leaves","Medicinal herbs","Mint","Berries"], correct: 1 },
  { question: "Tusu wine is best drunk at?", choices: ["Dawn","Midnight","Noon","Sunset"], correct: 0 },
  { question: "The Tusu game is for how many players typically?", choices: ["Single only","2-8","16","Tournament size"], correct: 1 },
  { question: "The number of dice used in Tusu commonly is?", choices: ["1","2-3","5","10"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TusuSettings): TusuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TusuState, action: TusuAction): TusuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TusuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
