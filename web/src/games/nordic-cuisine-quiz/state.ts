import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NordicCuisineQuizSettings { questions: "5" | "10"; }
export interface NordicCuisineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NordicCuisineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Gravlax is salmon cured with?", choices: ["Smoke","Salt, sugar, dill","Vinegar","Lemon"], correct: 1 },
  { question: "Smorrebrod is a Danish?", choices: ["Soup","Open-faced sandwich","Pastry","Hot dish"], correct: 1 },
  { question: "Lutefisk is preserved using?", choices: ["Salt brine","Lye","Smoke","Sugar"], correct: 1 },
  { question: "Surstromming is fermented?", choices: ["Cod","Herring","Salmon","Mackerel"], correct: 1 },
  { question: "Skyr is a thick dairy product from?", choices: ["Iceland","Norway","Sweden","Finland"], correct: 0 },
  { question: "Akvavit is flavored with?", choices: ["Juniper","Caraway/dill","Anise","Mint"], correct: 1 },
  { question: "New Nordic Manifesto chef-restaurant is?", choices: ["Noma","Mugaritz","Alinea","El Bulli"], correct: 0 },
  { question: "Reindeer meat is most associated with?", choices: ["Sami / northern Scandinavia","Southern Denmark","Iceland coast","Finnish lakes"], correct: 0 },
  { question: "Knackebrod is a Swedish?", choices: ["Soft bread","Crispbread","Sweet pastry","Pancake"], correct: 1 },
  { question: "Kottbullar are Swedish?", choices: ["Pancakes","Meatballs","Cookies","Brined cucumbers"], correct: 1 },
  { question: "Brined herring is most often paired with?", choices: ["Wine","Aquavit","Coffee","Cider"], correct: 1 },
  { question: "Karelian pasty (karjalanpiirakka) is from?", choices: ["Sweden","Finland","Norway","Denmark"], correct: 1 },
  { question: "Pickled herring is most strongly associated with?", choices: ["Iceland","Sweden and Denmark","Finland","Norway"], correct: 1 },
  { question: "Rye bread is a staple of which Nordic country?", choices: ["Iceland","Denmark","Norway","Sweden"], correct: 1 },
  { question: "Knackebrod is a Swedish?", choices: ["Soft bread","Crispbread","Pastry","Pancake"], correct: 1 },
  { question: "Karelian pastries are filled with?", choices: ["Meat","Rice porridge","Cheese","Lingonberry"], correct: 1 },
  { question: "Skyr is an Icelandic?", choices: ["Cheese","Strained cultured dairy","Butter","Milk drink"], correct: 1 },
  { question: "Swedish meatballs are traditionally served with?", choices: ["Marinara","Cream gravy and lingonberry","Tomato sauce","Mushroom soup"], correct: 1 },
  { question: "Smorgasbord is a?", choices: ["Single dish","Buffet of small dishes","Drink","Bread"], correct: 1 },
  { question: "Janssons frestelse is a Swedish casserole made with?", choices: ["Mushrooms","Anchovies and potatoes","Beef and onions","Salmon and cream"], correct: 1 },
  { question: "Glogg is a hot Nordic drink based on?", choices: ["Beer","Mulled wine with spices","Coffee","Milk"], correct: 1 },
  { question: "Akvavit is a spirit flavored with?", choices: ["Juniper","Caraway and dill","Anise","Mint"], correct: 1 },
  { question: "Hakarl is fermented?", choices: ["Salmon","Greenland shark","Cod","Whale"], correct: 1 },
  { question: "Reindeer is a traditional protein in which region?", choices: ["Lapland (Sapmi)","Southern Denmark","Iceland's coast","Bornholm"], correct: 0 },
  { question: "Kanelbullar is a Swedish?", choices: ["Meat pie","Cinnamon bun","Pancake","Soup"], correct: 1 },
  { question: "Kalops is a Swedish?", choices: ["Beef stew","Fish soup","Bread","Dessert"], correct: 0 },
  { question: "Frikadeller are Danish?", choices: ["Fish balls","Pan-fried meatballs","Dumplings","Sausages"], correct: 1 },
  { question: "Kjottkaker is a Norwegian?", choices: ["Cheese","Meatcake or patty","Bread","Soup"], correct: 1 },
  { question: "Lefse is a Norwegian?", choices: ["Soft potato flatbread","Hard biscuit","Bread loaf","Pastry"], correct: 0 },
  { question: "Salmiakki is a Nordic candy flavored with?", choices: ["Mint","Salty licorice (ammonium chloride)","Cinnamon","Berry"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NordicCuisineQuizSettings): NordicCuisineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NordicCuisineQuizState, action: NordicCuisineQuizAction): NordicCuisineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NordicCuisineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
