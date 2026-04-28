import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HwatuSettings { questions: "10"; }
export interface HwatuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HwatuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The word 'Hwatu' literally means?", choices: ["Flower mountain", "Flower fight", "Flower wind", "Flower season"], correct: 1 },
  { question: "Hwatu is the Korean equivalent of?", choices: ["Mahjong", "Hanafuda", "Domino", "Tarot"], correct: 1 },
  { question: "Hwatu cards are most often made of?", choices: ["Paper", "Plastic", "Wood", "Bone"], correct: 1 },
  { question: "A Hwatu deck contains how many cards?", choices: ["40", "44", "48", "52"], correct: 2 },
  { question: "Hwatu was popularized in Korea during which era?", choices: ["Joseon dynasty", "Japanese occupation", "Korean War", "1990s"], correct: 1 },
  { question: "Which game most popularly uses Hwatu?", choices: ["Go-Stop", "Spades", "Big Two", "Bridge"], correct: 0 },
  { question: "Hwatu suits represent?", choices: ["Animals", "Months of the year", "Provinces", "Festivals"], correct: 1 },
  { question: "A Hwatu pack contains how many flower months?", choices: ["8", "10", "12", "14"], correct: 2 },
  { question: "The Korean version of Hanafuda's Hikari is called?", choices: ["Pi", "Yeol", "Gwang", "Mae"], correct: 2 },
  { question: "Compared to Hanafuda, Hwatu cards are usually?", choices: ["Larger and stiffer", "Smaller and paper", "Same size", "Round"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HwatuSettings): HwatuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HwatuState, action: HwatuAction): HwatuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HwatuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
