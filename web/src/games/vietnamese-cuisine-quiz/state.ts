import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VietnameseCuisineQuizSettings { questions: "5" | "10"; }
export interface VietnameseCuisineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VietnameseCuisineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pho is what kind of dish?", choices: ["Rice porridge","Noodle soup","Stir-fry","Spring roll"], correct: 1 },
  { question: "A banh mi is built on which bread?", choices: ["Brioche","French baguette","Pita","Naan"], correct: 1 },
  { question: "Nuoc mam is the Vietnamese version of?", choices: ["Soy sauce","Fish sauce","Oyster sauce","Hoisin"], correct: 1 },
  { question: "Goi Cuon are also known as?", choices: ["Egg rolls","Summer rolls","Spring rolls (fried)","Wontons"], correct: 1 },
  { question: "Bun Cha originates from which city?", choices: ["Saigon","Hanoi","Hue","Da Nang"], correct: 1 },
  { question: "Cha Gio are the southern name for what?", choices: ["Spring rolls (fried)","Summer rolls","Pancakes","Steamed buns"], correct: 0 },
  { question: "Which herb is essential in Pho garnish?", choices: ["Cilantro","Thai basil","Mint","All of the above"], correct: 3 },
  { question: "Banh Xeo is a savory?", choices: ["Soup","Crepe/pancake","Rice cake","Steamed bun"], correct: 1 },
  { question: "Coffee in Vietnam is famously brewed with?", choices: ["Espresso machine","Phin filter","French press","Pour over"], correct: 1 },
  { question: "Hu Tieu noodles are typically made from?", choices: ["Wheat","Rice","Buckwheat","Mung bean"], correct: 1 },
  { question: "What does \"Bun\" refer to?", choices: ["Rice cake","Rice noodle (round)","Egg noodle","Glass noodle"], correct: 1 },
  { question: "Hue cuisine is associated with which culture?", choices: ["Imperial court","Fishing villages","Mountain peoples","French colonial"], correct: 0 },
  { question: "Cao lau noodles are a specialty of which Vietnamese town?", choices: ["Hanoi","Hoi An","Hue","Saigon"], correct: 1 },
  { question: "Mi Quang noodles are typically yellow because they include?", choices: ["Saffron","Turmeric","Annatto","Egg yolk"], correct: 1 },
  { question: "Banh cuon is a steamed roll made from?", choices: ["Wheat flour","Rice batter","Tapioca","Mung bean flour"], correct: 1 },
  { question: "Which sauce is used as a dip for goi cuon?", choices: ["Soy sauce","Hoisin-peanut sauce","Sweet chili","Fish sauce only"], correct: 1 },
  { question: "Nem nuong is a Vietnamese dish of?", choices: ["Grilled pork sausage","Steamed fish","Beef stew","Chicken curry"], correct: 0 },
  { question: "Ca kho to is fish braised in?", choices: ["Coconut water","Caramel sauce in clay pot","Tomato sauce","Vinegar"], correct: 1 },
  { question: "Pho bo means pho with?", choices: ["Chicken","Beef","Pork","Seafood"], correct: 1 },
  { question: "Pho ga is pho served with?", choices: ["Beef","Chicken","Pork","Tofu"], correct: 1 },
  { question: "Banh khot are small savory pancakes flavored with?", choices: ["Garlic","Coconut milk and turmeric","Sesame oil","Lime"], correct: 1 },
  { question: "Vietnamese iced coffee is sweetened with?", choices: ["Honey","Sweetened condensed milk","Sugar syrup","Coconut sugar"], correct: 1 },
  { question: "Which Vietnamese region is associated with imperial cuisine?", choices: ["North","Central (Hue)","South","Mekong Delta"], correct: 1 },
  { question: "Bun bo Hue is known for being?", choices: ["Mild and sweet","Spicy with lemongrass","Sweet and sour","Cold and refreshing"], correct: 1 },
  { question: "Cha ca La Vong is a Hanoi specialty of?", choices: ["Grilled pork","Turmeric-marinated fish","Rice porridge","Steamed crab"], correct: 1 },
  { question: "Banh chung is a traditional dish for which holiday?", choices: ["Mid-Autumn Festival","Tet (Lunar New Year)","Wandering Souls","Buddha's Birthday"], correct: 1 },
  { question: "Banh chung is wrapped in which leaves?", choices: ["Banana","Dong (la dong)","Lotus","Bamboo"], correct: 1 },
  { question: "Which fruit gives canh chua its sour profile alongside tamarind?", choices: ["Mango","Pineapple","Lime","Starfruit"], correct: 1 },
  { question: "Cha lua is Vietnamese?", choices: ["Rice cake","Pork sausage","Fish sauce","Spring roll"], correct: 1 },
  { question: "What does banh generally refer to in Vietnamese?", choices: ["A drink","Cake/bread/pastry","Soup","Sauce"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VietnameseCuisineQuizSettings): VietnameseCuisineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VietnameseCuisineQuizState, action: VietnameseCuisineQuizAction): VietnameseCuisineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VietnameseCuisineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
