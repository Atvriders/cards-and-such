import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LebaneseCuisineQuizSettings { questions: "5" | "10"; }
export interface LebaneseCuisineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LebaneseCuisineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hummus is built on which legume?", choices: ["Lentils","Chickpeas","Fava beans","Black beans"], correct: 1 },
  { question: "Tabbouleh is dominated by?", choices: ["Cracked wheat","Parsley","Tomato","Mint"], correct: 1 },
  { question: "Kibbeh combines bulgur with?", choices: ["Chicken","Minced lamb/beef","Fish","Tofu"], correct: 1 },
  { question: "Baba ganoush features?", choices: ["Eggplant","Zucchini","Pepper","Cucumber"], correct: 0 },
  { question: "Manoushe is most often topped with?", choices: ["Cheese","Zaatar","Honey","Tomato"], correct: 1 },
  { question: "Fattoush salad includes crunchy fried?", choices: ["Croutons","Pita bread","Tortilla","Crackers"], correct: 1 },
  { question: "Arak is anise-flavored and turns what color when watered?", choices: ["Pink","Cloudy white","Green","Red"], correct: 1 },
  { question: "Sumac is known for its?", choices: ["Sweetness","Tart/sour flavor","Fiery heat","Smokiness"], correct: 1 },
  { question: "Shawarma cooking method is?", choices: ["Slow grilling on vertical spit","Pan-frying","Steaming","Boiling"], correct: 0 },
  { question: "Mezze refers to?", choices: ["A type of bread","Small shared dishes","A spice mix","A dessert plate"], correct: 1 },
  { question: "Knafeh is a dessert built around?", choices: ["Phyllo and pistachio","Cheese and shredded pastry","Rosewater rice","Honey nougat"], correct: 1 },
  { question: "Toum is a creamy dip of?", choices: ["Tahini","Garlic","Yogurt","Eggplant"], correct: 1 },
  { question: "Fattoush is a salad distinguished by which crispy ingredient?", choices: ["Croutons","Toasted pita","Fried noodles","Tortilla strips"], correct: 1 },
  { question: "Mujadara is a dish of lentils with?", choices: ["Rice and caramelized onions","Bulgur and tomato","Pasta and yogurt","Chickpeas and parsley"], correct: 0 },
  { question: "Shawarma is meat cooked on a?", choices: ["Grill","Vertical rotating spit","Charcoal pit","Tagine"], correct: 1 },
  { question: "Manakish is a flatbread typically topped with?", choices: ["Cheese","Za'atar","Meat","All of the above"], correct: 3 },
  { question: "Za'atar is a blend including thyme, sumac, sesame, and?", choices: ["Mint","Salt","Both salt and herbs","Cumin"], correct: 2 },
  { question: "Labneh is a strained?", choices: ["Cream","Yogurt cheese","Milk","Butter"], correct: 1 },
  { question: "Kofta refers to?", choices: ["Stuffed grape leaves","Spiced ground meat skewers","Bean stew","Lemon chicken"], correct: 1 },
  { question: "Warak enab are stuffed?", choices: ["Cabbage leaves","Grape leaves","Fig leaves","Eggplants"], correct: 1 },
  { question: "Sfeeha is a small open-faced?", choices: ["Sandwich","Meat pie","Pastry","Cookie"], correct: 1 },
  { question: "Fatteh combines bread, chickpeas, and?", choices: ["Tahini only","Yogurt","Tomato","Honey"], correct: 1 },
  { question: "Toum is a Lebanese sauce made from?", choices: ["Tahini","Garlic and oil","Yogurt and mint","Chili"], correct: 1 },
  { question: "Knafeh is a sweet pastry with?", choices: ["Cream or cheese and shredded phyllo","Dates and nuts","Almond paste","Apricot jam"], correct: 0 },
  { question: "Maamoul are stuffed cookies eaten during?", choices: ["Christmas only","Eid and Easter","Weddings","Ramadan only"], correct: 1 },
  { question: "Arak is a Lebanese spirit flavored with?", choices: ["Anise","Mint","Lemon","Rose"], correct: 0 },
  { question: "Sumac gives Lebanese dishes which flavor?", choices: ["Sweet","Tart and lemony","Bitter","Spicy"], correct: 1 },
  { question: "Mezze refers to?", choices: ["A type of dessert","An assortment of small dishes","A grilled meat","A bread"], correct: 1 },
  { question: "Kibbeh nayyeh is which kind of kibbeh?", choices: ["Fried","Raw (steak tartare style)","Baked","Stuffed"], correct: 1 },
  { question: "Awwamat are fried dough balls dipped in?", choices: ["Chocolate","Sugar syrup","Honey only","Yogurt"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LebaneseCuisineQuizSettings): LebaneseCuisineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LebaneseCuisineQuizState, action: LebaneseCuisineQuizAction): LebaneseCuisineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LebaneseCuisineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
