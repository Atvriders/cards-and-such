import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MexicanCuisineQuiz2Settings { questions: "5" | "10"; }
export interface MexicanCuisineQuiz2State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MexicanCuisineQuiz2Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mole poblano is most associated with which state?", choices: ["Oaxaca","Puebla","Yucatan","Jalisco"], correct: 1 },
  { question: "Cochinita pibil is from which region?", choices: ["Yucatan","Veracruz","Sonora","Michoacan"], correct: 0 },
  { question: "Masa is dough typically made from?", choices: ["Wheat","Nixtamalized corn","Rice","Cassava"], correct: 1 },
  { question: "Tlayudas are large flat tortillas from?", choices: ["Oaxaca","Mexico City","Guadalajara","Monterrey"], correct: 0 },
  { question: "Birria is traditionally a stew of?", choices: ["Pork","Goat","Chicken","Fish"], correct: 1 },
  { question: "Chiles en nogada uses what creamy sauce?", choices: ["Avocado","Walnut","Almond","Coconut"], correct: 1 },
  { question: "Tequila is distilled from?", choices: ["Sugarcane","Blue agave","Corn","Cactus pear"], correct: 1 },
  { question: "Pozole is a soup featuring?", choices: ["Black beans","Hominy","Rice","Vermicelli"], correct: 1 },
  { question: "Which is NOT a Mexican mole?", choices: ["Negro","Verde","Coloradito","Hokkaido"], correct: 3 },
  { question: "Elote refers to grilled?", choices: ["Corn","Plantain","Pumpkin","Tomato"], correct: 0 },
  { question: "Aguachile is a dish of?", choices: ["Cured beef","Raw shrimp in chili water","Fried plantains","Brined cactus"], correct: 1 },
  { question: "Tacos al pastor were influenced by which immigrants?", choices: ["Italian","Lebanese","Japanese","Spanish"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MexicanCuisineQuiz2Settings): MexicanCuisineQuiz2State {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MexicanCuisineQuiz2State, action: MexicanCuisineQuiz2Action): MexicanCuisineQuiz2State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MexicanCuisineQuiz2State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
