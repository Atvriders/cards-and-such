import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PizzaQuizSettings { questions: "10" | "20"; }
export interface PizzaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PizzaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What country is the modern pizza from?", choices: ["Italy (Naples)","Greece","France","Spain"], correct: 0 },
  { question: "What city in Italy is pizza most associated with?", choices: ["Naples","Rome","Milan","Florence"], correct: 0 },
  { question: "What's a Margherita pizza?", choices: ["Tomato, mozzarella, basil","Just cheese","Both","Plain"], correct: 2 },
  { question: "What colors does a Margherita represent (Italian flag)?", choices: ["Red, white, green","Just red","Both","Just three colors"], correct: 2 },
  { question: "What style of pizza is thin, foldable, and large?", choices: ["New York style","Chicago","Detroit","Sicilian"], correct: 0 },
  { question: "What style is deep dish?", choices: ["Chicago","NY","Detroit","Sicilian"], correct: 0 },
  { question: "What style is rectangular with crispy bottom and caramelized cheese edges?", choices: ["Detroit","Chicago","Sicilian","NY"], correct: 0 },
  { question: "What's the Italian word for pizza maker?", choices: ["Pizzaiolo","Pizziolo","Just pizzaiolo","Both"], correct: 2 },
  { question: "What flour is best for Neapolitan pizza?", choices: ["00 flour","All-purpose","Whole wheat","Bread flour"], correct: 0 },
  { question: "What temperature is a Neapolitan pizza oven?", choices: ["~900F (480C)","~500F","~1000F","~700F"], correct: 0 },
  { question: "How long does Neapolitan pizza cook?", choices: ["~60-90 seconds","~5 min","~10 min","~15 min"], correct: 0 },
  { question: "What's the round Pugliese flatbread?", choices: ["Focaccia (different style)","Pizza Bianca","Both","Different"], correct: 0 },
  { question: "What cheese is on Margherita?", choices: ["Mozzarella di bufala or fior di latte","Cheddar","Just mozz","Both - varies"], correct: 3 },
  { question: "What's a calzone?", choices: ["Folded pizza","Open pie","Both","Stuffed bread"], correct: 0 },
  { question: "What's a stromboli?", choices: ["Rolled pizza-like dough","Just calzone variant","Both","Just stromboli"], correct: 2 },
  { question: "What's pizza al taglio?", choices: ["Pizza by the slice (rectangular)","Just slice","Both","Roman style"], correct: 2 },
  { question: "What's white pizza?", choices: ["No tomato sauce","Just bianca","Both","Cheese only"], correct: 2 },
  { question: "What's Hawaiian pizza topping?", choices: ["Pineapple and ham","Just pineapple","Both","Just topping"], correct: 2 },
  { question: "Who invented Hawaiian pizza?", choices: ["Sam Panopoulos in Canada","Just Canadian","Both","In Hawaii"], correct: 2 },
  { question: "What's the most popular pizza topping (US)?", choices: ["Pepperoni","Cheese","Sausage","Mushroom"], correct: 0 },
  { question: "What's pepperoni?", choices: ["Spicy salami","Italian dish","Both","Cured meat"], correct: 2 },
  { question: "What's the Italian word for pepper (and what pepperoni does NOT mean)?", choices: ["Peperoni means peppers","Just peppers","Both","False cognate"], correct: 2 },
  { question: "What's Roman pizza style (al taglio)?", choices: ["Crispy thin rectangular","Just thin","Both","Just Roman"], correct: 2 },
  { question: "What's pizza Marinara (no cheese)?", choices: ["Tomato, garlic, oregano, oil","Just tomato","Both","Original Naples style"], correct: 2 },
  { question: "What's the Italian dough hydration ratio (Naples)?", choices: ["~60-65%","~50%","~80%","~30%"], correct: 0 },
  { question: "What's a wood-fired oven for?", choices: ["High temp pizza cooking","Just heat","Both","Just oven"], correct: 2 },
  { question: "What's the iconic NY foldable slice?", choices: ["Yes","No - never folded","Both styles","Just Brooklyn"], correct: 0 },
  { question: "What's St. Louis style?", choices: ["Provel cheese, thin crust","Just style","Both","Square cut"], correct: 2 },
  { question: "What's a Sicilian pizza?", choices: ["Thick, square-cut","Just square","Both","Just Sicilian"], correct: 2 },
  { question: "What's pizza's UNESCO recognition?", choices: ["Neapolitan pizza-making is intangible cultural heritage","Just Neapolitan","Both","Italian heritage"], correct: 2 },
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
