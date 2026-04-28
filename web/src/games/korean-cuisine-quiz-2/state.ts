import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KoreanCuisineQuiz2Settings { questions: "5" | "10"; }
export interface KoreanCuisineQuiz2State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KoreanCuisineQuiz2Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Bibimbap means what?", choices: ["Mixed rice","Hot stew","Cold noodles","Grilled meat"], correct: 0 },
  { question: "Kimchi is most often based on?", choices: ["Cabbage","Cucumber","Radish","Spinach"], correct: 0 },
  { question: "Bulgogi is typically marinated with?", choices: ["Soy, sugar, sesame","Vinegar, sugar, salt","Lemon, herbs, oil","Yogurt, spices"], correct: 0 },
  { question: "Doenjang is a paste made from?", choices: ["Red chilis","Fermented soybeans","Black beans","Garlic"], correct: 1 },
  { question: "Tteokbokki is built around?", choices: ["Fish cakes","Rice cakes","Sweet potato","Mushrooms"], correct: 1 },
  { question: "What are banchan?", choices: ["Side dishes","Main courses","Desserts","Sauces"], correct: 0 },
  { question: "Soju is most often distilled from?", choices: ["Rice or sweet potato","Barley malt","Grapes","Honey"], correct: 0 },
  { question: "Samgyeopsal refers to which cut?", choices: ["Pork belly","Ribeye","Short rib","Brisket"], correct: 0 },
  { question: "Gochujang is a paste of?", choices: ["Soybean and salt","Red chili and rice","Sesame oil","Fermented fish"], correct: 1 },
  { question: "Japchae uses which kind of noodle?", choices: ["Glass (sweet potato)","Rice","Wheat","Buckwheat"], correct: 0 },
  { question: "Hansik refers to?", choices: ["Korean traditional food","Royal court cuisine","Street food","Temple cuisine"], correct: 0 },
  { question: "Naengmyeon is served typically at what temperature?", choices: ["Steaming hot","Cold","Room temperature","Warm"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KoreanCuisineQuiz2Settings): KoreanCuisineQuiz2State {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KoreanCuisineQuiz2State, action: KoreanCuisineQuiz2Action): KoreanCuisineQuiz2State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KoreanCuisineQuiz2State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
