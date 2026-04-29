import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NabeshimaHanafudaSettings { questions: "10"; }
export interface NabeshimaHanafudaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NabeshimaHanafudaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Nabeshima variant originates from which region of Japan?", choices: ["Hokkaido","Kyushu","Kanto","Okinawa"], correct: 1 },
  { question: "Nabeshima Hanafuda was historically associated with which clan?", choices: ["Tokugawa","Date","Nabeshima","Mori"], correct: 2 },
  { question: "The Nabeshima clan ruled which feudal domain?", choices: ["Saga","Tosa","Choshu","Satsuma"], correct: 0 },
  { question: "How many cards are in the Hanafuda deck?", choices: ["40","48","52","56"], correct: 1 },
  { question: "Nabeshima Hanafuda is most closely related to which mainstream game?", choices: ["Hwatu","Koi-Koi","Big Two","Daifugo"], correct: 1 },
  { question: "A typical Nabeshima game uses how many players?", choices: ["1-2","2-3","4 only","6-8"], correct: 1 },
  { question: "Which card category scores the highest in Nabeshima?", choices: ["Tane","Tan","Kasu","Hikari"], correct: 3 },
  { question: "A unique feature of Nabeshima yaku names is that they are?", choices: ["Numerical only","Regional dialect","English-translated","Modernised"], correct: 1 },
  { question: "The flower of January in Hanafuda is?", choices: ["Cherry","Plum","Pine","Peony"], correct: 2 },
  { question: "Nabeshima rules differ from Koi-Koi mainly in which area?", choices: ["Card design","Yaku scoring details","Deck size","Player count"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: NabeshimaHanafudaSettings): NabeshimaHanafudaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NabeshimaHanafudaState, action: NabeshimaHanafudaAction): NabeshimaHanafudaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NabeshimaHanafudaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
