import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EthiopianCuisineQuizSettings { questions: "5" | "10"; }
export interface EthiopianCuisineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EthiopianCuisineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Injera is a flatbread made from?", choices: ["Corn","Teff","Wheat","Rice"], correct: 1 },
  { question: "Doro wat is a stew of?", choices: ["Beef","Chicken","Lamb","Vegetables"], correct: 1 },
  { question: "Berbere is a?", choices: ["Spice blend","Bread","Soup","Drink"], correct: 0 },
  { question: "Tej is an alcoholic drink made from?", choices: ["Honey","Grape","Barley","Sugarcane"], correct: 0 },
  { question: "Kitfo is a dish of?", choices: ["Cooked tripe","Raw or rare minced beef","Steamed fish","Brined vegetables"], correct: 1 },
  { question: "Niter kibbeh is a?", choices: ["Spiced clarified butter","Soft cheese","Sweet syrup","Sour relish"], correct: 0 },
  { question: "Tibs are pieces of?", choices: ["Bread","Sauteed meat","Brined vegetables","Soup dumpling"], correct: 1 },
  { question: "Ethiopian coffee is traditionally served from a?", choices: ["French press","Jebena","Espresso machine","Drip cone"], correct: 1 },
  { question: "Shiro is a stew based on?", choices: ["Lentils","Chickpea/legume flour","Cabbage","Pumpkin"], correct: 1 },
  { question: "Gomen refers to which vegetable?", choices: ["Spinach","Collard greens","Carrot","Pumpkin"], correct: 1 },
  { question: "Atakilt wat features?", choices: ["Fish","Cabbage, carrots, potatoes","Beef","Goat"], correct: 1 },
  { question: "Buna in Ethiopia means?", choices: ["Tea","Coffee","Beer","Honey"], correct: 1 },
  { question: "Wat is the Ethiopian word for?", choices: ["Bread","Stew","Coffee","Spice"], correct: 1 },
  { question: "Niter kibbeh is?", choices: ["A spice mix","Spiced clarified butter","A fermented drink","A bread"], correct: 1 },
  { question: "Kitfo is a dish of?", choices: ["Stewed lamb","Minced raw beef","Roasted chicken","Lentil soup"], correct: 1 },
  { question: "Shiro is a stew made from?", choices: ["Chickpea or bean flour","Lentils","Meat","Fish"], correct: 0 },
  { question: "Misir wat is a stew of?", choices: ["Chicken","Red lentils","Beef","Vegetables"], correct: 1 },
  { question: "Tibs are typically?", choices: ["Stewed greens","Sauteed or grilled meat cubes","Fried bread","Boiled grains"], correct: 1 },
  { question: "Gomen is a side dish of?", choices: ["Collard greens","Cabbage and carrots","Beets","Potatoes"], correct: 0 },
  { question: "Buna is the Ethiopian word for?", choices: ["Tea","Coffee","Beer","Mead"], correct: 1 },
  { question: "The Ethiopian coffee ceremony traditionally has how many rounds?", choices: ["One","Two","Three","Five"], correct: 2 },
  { question: "Awaze is a?", choices: ["Fresh herb","Berbere chili paste","Cheese","Pickle"], correct: 1 },
  { question: "Mitmita is a?", choices: ["Mild seasoning","Very hot spice blend","Sweet syrup","Vinegar"], correct: 1 },
  { question: "Genfo is a thick porridge eaten for?", choices: ["Dinner","Breakfast","Dessert","Holidays"], correct: 1 },
  { question: "Fasting tradition in Ethiopian Orthodox Christianity favors which type of food?", choices: ["Vegan dishes","Meat-heavy dishes","Dairy-heavy","Fish only"], correct: 0 },
  { question: "Beyaynetu is a?", choices: ["Single dish","Vegan combination platter","Meat dish","Drink"], correct: 1 },
  { question: "Dabo kolo are?", choices: ["Roasted barley snacks","Crunchy fried dough bits","Grilled meats","Stewed lentils"], correct: 1 },
  { question: "Ayib is Ethiopian?", choices: ["Yogurt drink","Fresh cheese","Butter","Sour cream"], correct: 1 },
  { question: "Yebeg wat is a stew made from?", choices: ["Lamb","Beef","Goat","Chicken"], correct: 0 },
  { question: "Which grain has a tiny size and is gluten-free, used in injera?", choices: ["Sorghum","Teff","Millet","Fonio"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EthiopianCuisineQuizSettings): EthiopianCuisineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EthiopianCuisineQuizState, action: EthiopianCuisineQuizAction): EthiopianCuisineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EthiopianCuisineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
