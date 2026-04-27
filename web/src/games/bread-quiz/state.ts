import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BreadQuizSettings { questions: "10" | "20"; }
export interface BreadQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BreadQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Sourdough is leavened by?",
    "choices": [
      "Wild yeast/bacteria",
      "Baker's yeast",
      "Baking soda",
      "Self-rising"
    ],
    "correct": 0
  },
  {
    "question": "A baguette is from?",
    "choices": [
      "France",
      "Italy",
      "Germany",
      "Belgium"
    ],
    "correct": 0
  },
  {
    "question": "A baguette is shaped as?",
    "choices": [
      "Long thin loaf",
      "Round boule",
      "Square",
      "Twisted"
    ],
    "correct": 0
  },
  {
    "question": "Ciabatta is from?",
    "choices": [
      "Italy",
      "France",
      "Germany",
      "Spain"
    ],
    "correct": 0
  },
  {
    "question": "Focaccia is from?",
    "choices": [
      "Italy (Liguria)",
      "France",
      "Spain",
      "Greece"
    ],
    "correct": 0
  },
  {
    "question": "Focaccia is typically topped with?",
    "choices": [
      "Olive oil/herbs",
      "Cheese",
      "Tomato sauce",
      "Sugar"
    ],
    "correct": 0
  },
  {
    "question": "Pumpernickel is what color?",
    "choices": [
      "Dark brown/almost black",
      "White",
      "Yellow",
      "Pink"
    ],
    "correct": 0
  },
  {
    "question": "Pumpernickel is traditionally from?",
    "choices": [
      "Germany",
      "France",
      "Italy",
      "Spain"
    ],
    "correct": 0
  },
  {
    "question": "Naan is traditionally cooked in a?",
    "choices": [
      "Tandoor",
      "Skillet",
      "Stone oven",
      "Steam oven"
    ],
    "correct": 0
  },
  {
    "question": "Pita bread features a?",
    "choices": [
      "Pocket",
      "Crusty bottom",
      "Twisted top",
      "Sweet glaze"
    ],
    "correct": 0
  },
  {
    "question": "Pita is from which region?",
    "choices": [
      "Middle East/Mediterranean",
      "South America",
      "East Asia",
      "Northern Europe"
    ],
    "correct": 0
  },
  {
    "question": "Lavash is a thin flatbread from?",
    "choices": [
      "Armenia/Iran/Turkey",
      "Korea",
      "Italy",
      "Mexico"
    ],
    "correct": 0
  },
  {
    "question": "Tortillas are traditionally made from?",
    "choices": [
      "Corn or wheat",
      "Rice",
      "Barley",
      "Quinoa"
    ],
    "correct": 0
  },
  {
    "question": "Chapati is from?",
    "choices": [
      "India",
      "Mexico",
      "Italy",
      "Greece"
    ],
    "correct": 0
  },
  {
    "question": "Chapati is leavened by?",
    "choices": [
      "Unleavened",
      "Yeast",
      "Baking powder",
      "Sourdough"
    ],
    "correct": 0
  },
  {
    "question": "Roti is a flatbread from?",
    "choices": [
      "South Asia",
      "Korea",
      "Italy",
      "Mexico"
    ],
    "correct": 0
  },
  {
    "question": "Injera is a spongy flatbread from?",
    "choices": [
      "Ethiopia",
      "Mexico",
      "Italy",
      "Korea"
    ],
    "correct": 0
  },
  {
    "question": "Injera is made from which grain?",
    "choices": [
      "Teff",
      "Rice",
      "Wheat",
      "Barley"
    ],
    "correct": 0
  },
  {
    "question": "Challah is a braided bread from?",
    "choices": [
      "Jewish tradition",
      "Italian tradition",
      "French tradition",
      "Greek tradition"
    ],
    "correct": 0
  },
  {
    "question": "Matzo is unleavened bread from?",
    "choices": [
      "Jewish Passover",
      "Greek Easter",
      "Italian Easter",
      "Christmas"
    ],
    "correct": 0
  },
  {
    "question": "English muffins are typically cooked on?",
    "choices": [
      "Griddle",
      "Oven only",
      "Open flame",
      "Steamer"
    ],
    "correct": 0
  },
  {
    "question": "Crumpets have characteristic?",
    "choices": [
      "Holes on top",
      "Crusty exterior",
      "Long shape",
      "Twisted ends"
    ],
    "correct": 0
  },
  {
    "question": "Bagels are traditionally first?",
    "choices": [
      "Boiled then baked",
      "Steamed only",
      "Fried",
      "Microwaved"
    ],
    "correct": 0
  },
  {
    "question": "Brioche is enriched with?",
    "choices": [
      "Butter/eggs",
      "Honey only",
      "Olive oil",
      "Bacon fat"
    ],
    "correct": 0
  },
  {
    "question": "Brioche is from?",
    "choices": [
      "France",
      "Italy",
      "Germany",
      "England"
    ],
    "correct": 0
  },
  {
    "question": "Pretzels are German for?",
    "choices": [
      "Little arms",
      "Twisted",
      "Salty",
      "Hard"
    ],
    "correct": 0
  },
  {
    "question": "Soda bread is leavened by?",
    "choices": [
      "Baking soda",
      "Yeast",
      "Sourdough",
      "Eggs"
    ],
    "correct": 0
  },
  {
    "question": "Soda bread is associated with?",
    "choices": [
      "Ireland",
      "Scotland",
      "England",
      "Wales"
    ],
    "correct": 0
  },
  {
    "question": "Tortillas as taco shells are typically?",
    "choices": [
      "Soft or fried crispy",
      "Always crispy",
      "Always soft",
      "Always sweet"
    ],
    "correct": 0
  },
  {
    "question": "Bread hydration % refers to?",
    "choices": [
      "Water/flour ratio",
      "Yeast amount",
      "Time",
      "Bake temp"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BreadQuizSettings): BreadQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BreadQuizState, action: BreadQuizAction): BreadQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BreadQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
