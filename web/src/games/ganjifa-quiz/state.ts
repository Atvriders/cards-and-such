import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GanjifaQuizSettings { questions: "10"; }
export interface GanjifaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GanjifaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ganjifa cards are traditionally?", choices: ["Square", "Rectangular", "Circular", "Triangular"], correct: 2 },
  { question: "Ganjifa originated in?", choices: ["China", "India (with Persian roots)", "Japan", "Korea"], correct: 1 },
  { question: "Each suit in Ganjifa often represents?", choices: ["A month", "An avatar or theme", "A planet", "A weather pattern"], correct: 1 },
  { question: "Cards are typically?", choices: ["Mass-produced", "Hand-painted on lacquered wood or palm leaf", "Plastic", "Foil"], correct: 1 },
  { question: "The most popular Ganjifa variant has how many suits?", choices: ["4", "8 or 10", "12", "16"], correct: 1 },
  { question: "Ganjifa is a member of the ___ family.", choices: ["Climbing", "Trick-taking", "Fishing", "Patience"], correct: 1 },
  { question: "The cards in each suit number?", choices: ["10", "12 (10 numerals + 2 court)", "13", "15"], correct: 1 },
  { question: "Ganjifa cards often feature paintings of?", choices: ["Avatars of Vishnu (Dashavatara)", "Sumo wrestlers", "Knights", "Cars"], correct: 0 },
  { question: "The number of players varies but is typically?", choices: ["1", "2", "3-6", "8-10"], correct: 2 },
  { question: "Persian word 'ganjifa' originally referred to?", choices: ["Treasure", "Playing cards", "Battle", "Music"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GanjifaQuizSettings): GanjifaQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GanjifaQuizState, action: GanjifaQuizAction): GanjifaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GanjifaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
