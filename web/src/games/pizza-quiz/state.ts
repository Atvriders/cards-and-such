import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation?: string; }
export interface PizzaQuizSettings { questions: "10" | "20"; }
export interface PizzaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PizzaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What country is the modern pizza from?", choices: ["Italy (Naples)","Greece","France","Spain"], correct: 0, explanation: "Modern pizza originated in Naples, Italy in the 18th-19th centuries." },
  { question: "What city in Italy is pizza most associated with?", choices: ["Naples","Rome","Milan","Florence"], correct: 0, explanation: "Naples is the birthplace of modern pizza; Neapolitan pizza is UNESCO-recognised." },
  { question: "What's a Margherita pizza?", choices: ["Tomato, mozzarella, basil","Just cheese","Both","Plain"], correct: 2, explanation: "Tomato, mozzarella, and basil — said to honor Queen Margherita of Savoy in 1889." },
  { question: "What colors does a Margherita represent (Italian flag)?", choices: ["Red, white, green","Just red","Both","Just three colors"], correct: 2, explanation: "The red tomato, white mozzarella, and green basil mirror Italy's tricolor flag." },
  { question: "What style of pizza is thin, foldable, and large?", choices: ["New York style","Chicago","Detroit","Sicilian"], correct: 0, explanation: "New York style is hand-tossed, thin, and famously eaten folded in half." },
  { question: "What style is deep dish?", choices: ["Chicago","NY","Detroit","Sicilian"], correct: 0, explanation: "Chicago deep-dish was invented at Pizzeria Uno in 1943 — it's almost a savoury pie." },
  { question: "What style is rectangular with crispy bottom and caramelized cheese edges?", choices: ["Detroit","Chicago","Sicilian","NY"], correct: 0, explanation: "Detroit-style is baked in blue steel pans, originally automotive drip trays, giving caramelized edges." },
  { question: "What's the Italian word for pizza maker?", choices: ["Pizzaiolo","Pizziolo","Just pizzaiolo","Both"], correct: 2, explanation: "A pizzaiolo is a master pizza maker; the Naples tradition was UNESCO-listed in 2017." },
  { question: "What flour is best for Neapolitan pizza?", choices: ["00 flour","All-purpose","Whole wheat","Bread flour"], correct: 0, explanation: "Type 00 ('doppio zero') is finely ground Italian flour ideal for true Neapolitan pizza." },
  { question: "What temperature is a Neapolitan pizza oven?", choices: ["~900F (480C)","~500F","~1000F","~700F"], correct: 0, explanation: "Authentic wood-fired ovens reach about 480°C (900°F) for a true Neapolitan pizza." },
  { question: "How long does Neapolitan pizza cook?", choices: ["~60-90 seconds","~5 min","~10 min","~15 min"], correct: 0, explanation: "True Neapolitan pizza cooks in just 60-90 seconds at extreme heat." },
  { question: "What's the round Pugliese flatbread?", choices: ["Focaccia (different style)","Pizza Bianca","Both","Different"], correct: 0, explanation: "Focaccia is a thicker olive-oil flatbread from Liguria; many regions have local variants." },
  { question: "What cheese is on Margherita?", choices: ["Mozzarella di bufala or fior di latte","Cheddar","Just mozz","Both - varies"], correct: 3, explanation: "Authentic Margherita uses either fior di latte (cow milk) or mozzarella di bufala (water buffalo)." },
  { question: "What's a calzone?", choices: ["Folded pizza","Open pie","Both","Stuffed bread"], correct: 0, explanation: "A calzone is essentially a folded pizza — dough enclosing toppings, baked into a stuffed pocket." },
  { question: "What's a stromboli?", choices: ["Rolled pizza-like dough","Just calzone variant","Both","Just stromboli"], correct: 2, explanation: "Stromboli is a rolled, log-shaped Italian-American creation, distinct from the Italian calzone." },
  { question: "What's pizza al taglio?", choices: ["Pizza by the slice (rectangular)","Just slice","Both","Roman style"], correct: 2, explanation: "'Pizza by the cut' — Roman-style rectangular slabs sold by weight, with a high-hydration crust." },
  { question: "What's white pizza?", choices: ["No tomato sauce","Just bianca","Both","Cheese only"], correct: 2, explanation: "Pizza bianca skips tomato sauce, relying on cheese, oil, herbs, or other toppings." },
  { question: "What's Hawaiian pizza topping?", choices: ["Pineapple and ham","Just pineapple","Both","Just topping"], correct: 2, explanation: "The polarising combo of pineapple and ham (or Canadian bacon) defines Hawaiian pizza." },
  { question: "Who invented Hawaiian pizza?", choices: ["Sam Panopoulos in Canada","Just Canadian","Both","In Hawaii"], correct: 2, explanation: "Sam Panopoulos, a Greek immigrant in Ontario, Canada, created Hawaiian pizza in 1962." },
  { question: "What's the most popular pizza topping (US)?", choices: ["Pepperoni","Cheese","Sausage","Mushroom"], correct: 0, explanation: "Pepperoni tops about 36% of US pizzas, far ahead of any other single topping." },
  { question: "What's pepperoni?", choices: ["Spicy salami","Italian dish","Both","Cured meat"], correct: 2, explanation: "American pepperoni is a spicy, smoked, cured salami — invented by Italian immigrants in NYC." },
  { question: "What's the Italian word for pepper (and what pepperoni does NOT mean)?", choices: ["Peperoni means peppers","Just peppers","Both","False cognate"], correct: 2, explanation: "In Italian, 'peperoni' means bell peppers — order pepperoni in Italy and you'll get peppers, not salami." },
  { question: "What's Roman pizza style (al taglio)?", choices: ["Crispy thin rectangular","Just thin","Both","Just Roman"], correct: 2, explanation: "Crispy, thin, rectangular, sold by weight — the everyday Roman street-food pizza." },
  { question: "What's pizza Marinara (no cheese)?", choices: ["Tomato, garlic, oregano, oil","Just tomato","Both","Original Naples style"], correct: 2, explanation: "Marinara — tomato, garlic, oregano, olive oil — predates Margherita as the original Naples pizza." },
  { question: "What's the Italian dough hydration ratio (Naples)?", choices: ["~60-65%","~50%","~80%","~30%"], correct: 0, explanation: "Authentic Neapolitan dough is around 60-65% hydration (water-to-flour ratio)." },
  { question: "What's a wood-fired oven for?", choices: ["High temp pizza cooking","Just heat","Both","Just oven"], correct: 2, explanation: "Wood-fired ovens reach the very high temperatures (450°C+) needed for true Neapolitan pizza." },
  { question: "What's the iconic NY foldable slice?", choices: ["Yes","No - never folded","Both styles","Just Brooklyn"], correct: 0, explanation: "The wide, thin NY slice is foldable along its midline — a signature of the style." },
  { question: "What's St. Louis style?", choices: ["Provel cheese, thin crust","Just style","Both","Square cut"], correct: 2, explanation: "St. Louis pizza uses Provel cheese, a cracker-thin crust, and is cut into squares ('party cut')." },
  { question: "What's a Sicilian pizza?", choices: ["Thick, square-cut","Just square","Both","Just Sicilian"], correct: 2, explanation: "Sicilian pizza is thick-crusted, rectangular, and often topped after the dough has partially baked." },
  { question: "What's pizza's UNESCO recognition?", choices: ["Neapolitan pizza-making is intangible cultural heritage","Just Neapolitan","Both","Italian heritage"], correct: 2, explanation: "In 2017, UNESCO inscribed the art of Neapolitan 'pizzaiuolo' on the Intangible Cultural Heritage list." },
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
