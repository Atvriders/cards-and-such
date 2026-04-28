import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThaiCuisineQuiz2Settings { questions: "5" | "10"; }
export interface ThaiCuisineQuiz2State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThaiCuisineQuiz2Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What sour soup features lemongrass, galangal, and lime?", choices: ["Tom Yum","Tom Kha","Khao Soi","Massaman"], correct: 0 },
  { question: "Pad See Ew uses which type of noodle?", choices: ["Rice vermicelli","Wide rice noodles","Egg noodles","Glass noodles"], correct: 1 },
  { question: "Som Tam is a salad based on what?", choices: ["Mango","Green papaya","Cucumber","Cabbage"], correct: 1 },
  { question: "Which Thai region is famous for Khao Soi?", choices: ["Isaan (north-east)","Northern (Chiang Mai)","Southern","Central"], correct: 1 },
  { question: "Massaman curry shows strong influence from where?", choices: ["China","India/Persia","Vietnam","Cambodia"], correct: 1 },
  { question: "Nam Pla is the Thai name for what?", choices: ["Coconut milk","Chili paste","Fish sauce","Palm sugar"], correct: 2 },
  { question: "Which dessert is sticky rice paired with mango?", choices: ["Khanom Tuay","Bua Loi","Khao Niao Mamuang","Tab Tim Krob"], correct: 2 },
  { question: "Galangal is similar to but distinct from?", choices: ["Garlic","Lemongrass","Ginger","Turmeric"], correct: 2 },
  { question: "What does \"phad\" mean in Thai cooking?", choices: ["Boiled","Stir-fried","Grilled","Steamed"], correct: 1 },
  { question: "Larb is a salad most associated with which region?", choices: ["Southern","Central","Isaan","Western"], correct: 2 },
  { question: "Pad Thai is typically garnished with crushed?", choices: ["Almonds","Peanuts","Cashews","Walnuts"], correct: 1 },
  { question: "Which Thai cuisine staple is \"Khao\"?", choices: ["Noodles","Rice","Soup","Spice paste"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ThaiCuisineQuiz2Settings): ThaiCuisineQuiz2State {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThaiCuisineQuiz2State, action: ThaiCuisineQuiz2Action): ThaiCuisineQuiz2State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThaiCuisineQuiz2State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
