import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VietnameseCuisineQuizSettings { questions: "5" | "10"; }
export interface VietnameseCuisineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VietnameseCuisineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pho is what kind of dish?", choices: ["Rice porridge","Noodle soup","Stir-fry","Spring roll"], correct: 1 },
  { question: "A banh mi is built on which bread?", choices: ["Brioche","French baguette","Pita","Naan"], correct: 1 },
  { question: "Nuoc mam is the Vietnamese version of?", choices: ["Soy sauce","Fish sauce","Oyster sauce","Hoisin"], correct: 1 },
  { question: "Goi Cuon are also known as?", choices: ["Egg rolls","Summer rolls","Spring rolls (fried)","Wontons"], correct: 1 },
  { question: "Bun Cha originates from which city?", choices: ["Saigon","Hanoi","Hue","Da Nang"], correct: 1 },
  { question: "Cha Gio are the southern name for what?", choices: ["Spring rolls (fried)","Summer rolls","Pancakes","Steamed buns"], correct: 0 },
  { question: "Which herb is essential in Pho garnish?", choices: ["Cilantro","Thai basil","Mint","All of the above"], correct: 3 },
  { question: "Banh Xeo is a savory?", choices: ["Soup","Crepe/pancake","Rice cake","Steamed bun"], correct: 1 },
  { question: "Coffee in Vietnam is famously brewed with?", choices: ["Espresso machine","Phin filter","French press","Pour over"], correct: 1 },
  { question: "Hu Tieu noodles are typically made from?", choices: ["Wheat","Rice","Buckwheat","Mung bean"], correct: 1 },
  { question: "What does \"Bun\" refer to?", choices: ["Rice cake","Rice noodle (round)","Egg noodle","Glass noodle"], correct: 1 },
  { question: "Hue cuisine is associated with which culture?", choices: ["Imperial court","Fishing villages","Mountain peoples","French colonial"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VietnameseCuisineQuizSettings): VietnameseCuisineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VietnameseCuisineQuizState, action: VietnameseCuisineQuizAction): VietnameseCuisineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VietnameseCuisineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
