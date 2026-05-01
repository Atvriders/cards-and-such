import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MoroccanCuisineQuizSettings { questions: "5" | "10"; }
export interface MoroccanCuisineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MoroccanCuisineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "A tagine is named for the?", choices: ["Spice blend","Conical clay pot","Stew technique","Bread style"], correct: 1 },
  { question: "Couscous is steamed?", choices: ["Rice","Semolina pellets","Cracked wheat","Quinoa"], correct: 1 },
  { question: "Ras el hanout is a?", choices: ["Hot sauce","Spice blend","Bread","Sweet pastry"], correct: 1 },
  { question: "Harira soup is traditionally served during?", choices: ["Christmas","Ramadan","Eid","Weddings"], correct: 1 },
  { question: "Pastilla (b’stilla) is a pie traditionally with?", choices: ["Beef and cheese","Pigeon and almonds","Lamb and figs","Chicken liver"], correct: 1 },
  { question: "Mint tea in Morocco usually uses what tea base?", choices: ["Black","Green (gunpowder)","Oolong","White"], correct: 1 },
  { question: "Preserved lemons are cured in?", choices: ["Vinegar","Salt","Olive oil","Sugar"], correct: 1 },
  { question: "Argan oil is unique to which country?", choices: ["Morocco","Tunisia","Algeria","Egypt"], correct: 0 },
  { question: "Khobz is a Moroccan?", choices: ["Soup","Round bread","Sweet pastry","Salad"], correct: 1 },
  { question: "A common spice in tagines is?", choices: ["Saffron","Vanilla","Wasabi","Sumac"], correct: 0 },
  { question: "Mechoui is slow-roasted whole?", choices: ["Chicken","Lamb","Goat","Pig"], correct: 1 },
  { question: "Chermoula is a marinade for?", choices: ["Fish","Beef","Goat","Vegetables"], correct: 0 },
  { question: "Pastilla (b'stilla) is a savory-sweet pie traditionally filled with?", choices: ["Beef","Pigeon or chicken","Fish","Lamb"], correct: 1 },
  { question: "Mechoui is a method of cooking which meat?", choices: ["Whole roasted lamb","Stewed chicken","Grilled fish","Braised beef"], correct: 0 },
  { question: "Khobz is the Moroccan word for?", choices: ["Tea","Bread","Soup","Spice"], correct: 1 },
  { question: "Bissara is a soup made from?", choices: ["Lentils","Split fava beans","Chickpeas","Barley"], correct: 1 },
  { question: "Mint tea in Morocco is poured from a height to?", choices: ["Cool it down","Create foam","Show skill","All of the above"], correct: 3 },
  { question: "Argan oil comes from a tree native to which country?", choices: ["Tunisia","Morocco","Algeria","Egypt"], correct: 1 },
  { question: "Msemen is a Moroccan?", choices: ["Stew","Layered square pancake","Soup","Pastry"], correct: 1 },
  { question: "Chermoula is a marinade most often used for?", choices: ["Beef","Fish and seafood","Lamb","Vegetables"], correct: 1 },
  { question: "Preserved lemons are a key ingredient in many Moroccan?", choices: ["Desserts","Tagines","Breads","Drinks"], correct: 1 },
  { question: "Zaalouk is a cooked salad of?", choices: ["Eggplant and tomato","Cucumber","Beet","Carrot"], correct: 0 },
  { question: "Taktouka is a salad made primarily of?", choices: ["Tomato and pepper","Eggplant","Chickpea","Lettuce"], correct: 0 },
  { question: "Sfenj is the Moroccan version of?", choices: ["Pancake","Doughnut","Cookie","Bread"], correct: 1 },
  { question: "Tanjia is associated with which Moroccan city?", choices: ["Casablanca","Marrakech","Fes","Tangier"], correct: 1 },
  { question: "Smen is a Moroccan?", choices: ["Honey","Aged fermented butter","Olive oil","Sauce"], correct: 1 },
  { question: "Loubia is a Moroccan stew made from?", choices: ["Lentils","White beans","Chickpeas","Fava beans"], correct: 1 },
  { question: "Briouats are pastries shaped like?", choices: ["Triangles or cigars","Circles","Squares","Rings"], correct: 0 },
  { question: "Kefta refers to which Moroccan preparation?", choices: ["Stewed vegetables","Spiced ground meat","Roasted nuts","Fried bread"], correct: 1 },
  { question: "Which spices commonly give Moroccan dishes a distinctive yellow color?", choices: ["Saffron","Turmeric","Both saffron and turmeric","Paprika"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MoroccanCuisineQuizSettings): MoroccanCuisineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MoroccanCuisineQuizState, action: MoroccanCuisineQuizAction): MoroccanCuisineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MoroccanCuisineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
