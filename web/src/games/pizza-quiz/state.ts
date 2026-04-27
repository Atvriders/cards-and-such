import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PizzaQuizSettings { questions: "10" | "20"; }
export interface PizzaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PizzaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pizza Margherita honors the queen of which country?", choices: ["Spain","Italy","France","Greece"], correct: 1 },
  { question: "What city is Neapolitan pizza from?", choices: ["Rome","Milan","Naples","Florence"], correct: 2 },
  { question: "Pizza Margherita's three toppings represent what?", choices: ["The Italian flag","The Vatican","Roman Empire","Sicilian sea"], correct: 0 },
  { question: "What style is famous in Chicago?", choices: ["Thin crust","Deep dish","Sicilian","Roman"], correct: 1 },
  { question: "Detroit-style pizza is baked in what?", choices: ["Stone oven","Cast iron","Steel pan","Brick"], correct: 2 },
  { question: "What cheese is traditional on Margherita?", choices: ["Parmesan","Mozzarella","Provolone","Pecorino"], correct: 1 },
  { question: "New York-style pizza is known for being?", choices: ["Thick","Square","Foldable","Stuffed"], correct: 2 },
  { question: "Which is NOT a classic pizza topping in Italy?", choices: ["Anchovies","Pineapple","Capers","Olives"], correct: 1 },
  { question: "Pizza al taglio is sold by?", choices: ["Slice","Weight","Pie","Order"], correct: 1 },
  { question: "California-style pizza is known for?", choices: ["Thick crust","Unique toppings","Square shape","Cold cheese"], correct: 1 },
  { question: "Pizza Marinara contains?", choices: ["Seafood","No cheese","Lots of cheese","Pesto"], correct: 1 },
  { question: "Sicilian pizza is shaped like?", choices: ["Triangle","Round","Square","Oval"], correct: 2 },
  { question: "What is 'pizza bianca'?", choices: ["White-cheese","No tomato","No bread","Cold"], correct: 1 },
  { question: "Hawaiian pizza was invented in?", choices: ["Hawaii","Italy","Canada","USA"], correct: 2 },
  { question: "Wood-fired pizzas typically cook in?", choices: ["10-15 min","5 min","60-90 sec","30 sec"], correct: 2 },
  { question: "00 flour is used because it is?", choices: ["Whole grain","Finely ground","Yellow","Sweet"], correct: 1 },
  { question: "Pizza dough rises due to?", choices: ["Salt","Yeast","Olive oil","Heat"], correct: 1 },
  { question: "Calzone is essentially a?", choices: ["Folded pizza","Open pie","Pie crust","Pizza bread"], correct: 0 },
  { question: "AVPN certifies what kind of pizza?", choices: ["Roman","New York","Neapolitan","Detroit"], correct: 2 },
  { question: "Pizza first arrived in America with which immigrant group?", choices: ["German","Italian","Irish","French"], correct: 1 },
  { question: "Pizzaiolo is the Italian word for?", choices: ["Pizza chef","Pizza shop","Pizza pan","Pizza party"], correct: 0 },
  { question: "Roman-style pizza is generally?", choices: ["Thick","Crispy/thin","Soft","Stuffed"], correct: 1 },
  { question: "Quattro formaggi means?", choices: ["Four cheeses","Four meats","Four sauces","Four hands"], correct: 0 },
  { question: "Quattro stagioni represents?", choices: ["Four seasons","Four toppings","Four pies","Four chefs"], correct: 0 },
  { question: "St. Louis pizza uses what cheese?", choices: ["Mozzarella","Provolone","Provel","Cheddar"], correct: 2 },
  { question: "What pizza topping is a fermented sausage?", choices: ["Bacon","Pepperoni","Ham","Bratwurst"], correct: 1 },
  { question: "Apizza is a regional style from?", choices: ["Connecticut","Texas","Oregon","Florida"], correct: 0 },
  { question: "A 'Neapolitan' pizza must be cooked at what temp?", choices: ["350F","485C","250C","800F+"], correct: 3 },
  { question: "Pinsa is a style from?", choices: ["Naples","Rome","Milan","Bari"], correct: 1 },
  { question: "What does 'doppio zero' (00) refer to?", choices: ["Cheese type","Flour grade","Oven heat","Sauce"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PizzaQuizSettings): PizzaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PizzaQuizState, action: PizzaQuizAction): PizzaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PizzaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
