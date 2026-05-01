import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PeruvianCuisineQuizSettings { questions: "5" | "10"; }
export interface PeruvianCuisineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PeruvianCuisineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ceviche is fish \"cooked\" in what?", choices: ["Heat","Citrus juice","Vinegar","Soy sauce"], correct: 1 },
  { question: "Lomo saltado shows fusion with which cuisine?", choices: ["Italian","Chinese (Chifa)","Japanese","French"], correct: 1 },
  { question: "Aji amarillo is what?", choices: ["Yellow chili pepper","Yellow rice","Yellow corn","Yellow fruit"], correct: 0 },
  { question: "Pisco is a brandy distilled from?", choices: ["Apples","Grapes","Sugarcane","Potatoes"], correct: 1 },
  { question: "Causa is a layered cold dish based on?", choices: ["Rice","Mashed potato","Quinoa","Cassava"], correct: 1 },
  { question: "Anticuchos are traditionally skewers of?", choices: ["Beef heart","Chicken breast","Pork belly","Shrimp"], correct: 0 },
  { question: "Cuy refers to?", choices: ["Guinea pig","Llama","Alpaca","Capybara"], correct: 0 },
  { question: "Quinoa originated where?", choices: ["Andes (incl. Peru)","Mexico","Brazil","India"], correct: 0 },
  { question: "Chicha morada is made from?", choices: ["Red wine","Purple corn","Beetroot","Hibiscus"], correct: 1 },
  { question: "Pachamanca is cooked using?", choices: ["Hot stones underground","Open fire","Clay oven","Steam basket"], correct: 0 },
  { question: "Nikkei cuisine fuses Peruvian with?", choices: ["Japanese","Chinese","Korean","Italian"], correct: 0 },
  { question: "Inca Kola tastes most like?", choices: ["Bubblegum / lemon verbena","Cola","Ginger ale","Root beer"], correct: 0 },
  { question: "Anticuchos are skewers traditionally made from?", choices: ["Beef heart","Chicken","Lamb","Pork belly"], correct: 0 },
  { question: "Causa is a Peruvian dish layered with which staple?", choices: ["Quinoa","Mashed yellow potato","Rice","Cornmeal"], correct: 1 },
  { question: "Aji de gallina is a creamy stew of?", choices: ["Beef","Shredded chicken","Fish","Pork"], correct: 1 },
  { question: "Rocoto relleno is a stuffed?", choices: ["Tomato","Hot pepper","Squash","Onion"], correct: 1 },
  { question: "Cuy is a traditional Andean dish of?", choices: ["Llama","Guinea pig","Alpaca","Rabbit"], correct: 1 },
  { question: "Pachamanca is cooked using?", choices: ["A wood oven","Hot stones in an earth pit","A clay pot","A grill"], correct: 1 },
  { question: "Chicha morada is a drink made from?", choices: ["Red corn","Purple corn","Yellow corn","Quinoa"], correct: 1 },
  { question: "Tiradito differs from ceviche by being?", choices: ["Cooked","Sliced thin like sashimi","Fried","Pickled"], correct: 1 },
  { question: "Papa a la huancaina is potato in what sauce?", choices: ["Tomato","Cheese-aji amarillo","Walnut","Avocado"], correct: 1 },
  { question: "Suspiro a la limena is a dessert based on?", choices: ["Chocolate","Dulce de leche and meringue","Fruit","Coconut"], correct: 1 },
  { question: "Pisco sour traditionally includes?", choices: ["Egg yolk and rum","Egg white, lime, simple syrup, pisco","Cream and lime","Coconut and pisco"], correct: 1 },
  { question: "Arroz con pollo in Peru is colored green by?", choices: ["Spinach","Cilantro","Avocado","Lime zest"], correct: 1 },
  { question: "Lomo saltado is stir-fried with which vegetables?", choices: ["Bell pepper, onion, tomato","Cabbage and carrot","Mushroom and spinach","Peas and corn only"], correct: 0 },
  { question: "Inca Kola tastes most like?", choices: ["Bubblegum/cream soda","Lemon-lime","Cola","Ginger beer"], correct: 0 },
  { question: "Solterito is a salad from which Peruvian region?", choices: ["Lima","Arequipa","Cusco","Iquitos"], correct: 1 },
  { question: "Juane is a rice dish wrapped in leaves from which region?", choices: ["Andes","Amazon","Coast","Altiplano"], correct: 1 },
  { question: "Olluquito is made from which Andean tuber?", choices: ["Potato","Olluco","Oca","Mashua"], correct: 1 },
  { question: "Chupe de camarones is a chowder featuring?", choices: ["Crab","River shrimp","Squid","Cod"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PeruvianCuisineQuizSettings): PeruvianCuisineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PeruvianCuisineQuizState, action: PeruvianCuisineQuizAction): PeruvianCuisineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PeruvianCuisineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
