import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TacosQuizSettings { questions: "10" | "20"; }
export interface TacosQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TacosQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Al pastor is made with what meat?",
    "choices": [
      "Pork",
      "Beef",
      "Chicken",
      "Lamb"
    ],
    "correct": 0
  },
  {
    "question": "Al pastor's cooking style was inspired by?",
    "choices": [
      "Lebanese shawarma",
      "Argentine asado",
      "Spanish paella",
      "Italian rotisserie"
    ],
    "correct": 0
  },
  {
    "question": "Carnitas means?",
    "choices": [
      "Little meats",
      "Sliced meat",
      "Burnt meat",
      "Smoked meat"
    ],
    "correct": 0
  },
  {
    "question": "Carnitas is a slow-cooked?",
    "choices": [
      "Pork",
      "Beef",
      "Lamb",
      "Chicken"
    ],
    "correct": 0
  },
  {
    "question": "Barbacoa is traditionally cooked?",
    "choices": [
      "In a pit/underground",
      "On a grill",
      "On stove",
      "In oven"
    ],
    "correct": 0
  },
  {
    "question": "Suadero comes from which animal?",
    "choices": [
      "Beef belly",
      "Pork shoulder",
      "Chicken thigh",
      "Lamb leg"
    ],
    "correct": 0
  },
  {
    "question": "Lengua means?",
    "choices": [
      "Tongue",
      "Ear",
      "Cheek",
      "Brain"
    ],
    "correct": 0
  },
  {
    "question": "Cabeza means?",
    "choices": [
      "Head",
      "Heart",
      "Liver",
      "Leg"
    ],
    "correct": 0
  },
  {
    "question": "Cochinita pibil is a specialty of?",
    "choices": [
      "Yucatan",
      "Oaxaca",
      "Sonora",
      "Guerrero"
    ],
    "correct": 0
  },
  {
    "question": "Cochinita pibil uses what marinade?",
    "choices": [
      "Achiote",
      "Chipotle",
      "Mole",
      "Tequila"
    ],
    "correct": 0
  },
  {
    "question": "Baja-style tacos famously feature?",
    "choices": [
      "Battered fish",
      "Beef brisket",
      "Pulled pork",
      "Carne asada"
    ],
    "correct": 0
  },
  {
    "question": "Carne asada is typically?",
    "choices": [
      "Grilled beef",
      "Slow-cooked pork",
      "Stewed chicken",
      "Fried fish"
    ],
    "correct": 0
  },
  {
    "question": "Tacos de canasta are?",
    "choices": [
      "Steamed in basket",
      "Grilled",
      "Smoked",
      "Deep fried"
    ],
    "correct": 0
  },
  {
    "question": "A trompo is the?",
    "choices": [
      "Vertical spit",
      "Frying pan",
      "Outdoor grill",
      "Spice mix"
    ],
    "correct": 0
  },
  {
    "question": "Pineapple is often paired with?",
    "choices": [
      "Al pastor",
      "Lengua",
      "Birria",
      "Pescado"
    ],
    "correct": 0
  },
  {
    "question": "Birria is traditionally made with?",
    "choices": [
      "Goat or beef",
      "Pork",
      "Chicken",
      "Fish"
    ],
    "correct": 0
  },
  {
    "question": "Quesabirria is birria with?",
    "choices": [
      "Cheese",
      "Avocado",
      "Beans",
      "Rice"
    ],
    "correct": 0
  },
  {
    "question": "Tortillas are typically made from?",
    "choices": [
      "Corn or flour",
      "Rice",
      "Wheat",
      "Potato"
    ],
    "correct": 0
  },
  {
    "question": "Mexico City favors which tortilla?",
    "choices": [
      "Corn",
      "Flour",
      "Rice",
      "Mixed"
    ],
    "correct": 0
  },
  {
    "question": "Northern Mexico favors which tortilla?",
    "choices": [
      "Flour",
      "Corn",
      "Rice",
      "Mixed"
    ],
    "correct": 0
  },
  {
    "question": "Classic taco toppings (Mexico City) are?",
    "choices": [
      "Onion/cilantro",
      "Lettuce/cheese",
      "Cabbage/sour cream",
      "Tomato/lettuce"
    ],
    "correct": 0
  },
  {
    "question": "Salsa verde uses?",
    "choices": [
      "Tomatillos",
      "Tomatoes",
      "Mango",
      "Pineapple"
    ],
    "correct": 0
  },
  {
    "question": "Salsa roja uses?",
    "choices": [
      "Red chiles",
      "Tomatillos",
      "Avocado",
      "Mango"
    ],
    "correct": 0
  },
  {
    "question": "Pico de gallo is?",
    "choices": [
      "Fresh chopped salsa",
      "Cooked sauce",
      "Cream",
      "Marinade"
    ],
    "correct": 0
  },
  {
    "question": "Guacamole's main ingredient is?",
    "choices": [
      "Avocado",
      "Tomato",
      "Cilantro",
      "Lime"
    ],
    "correct": 0
  },
  {
    "question": "Tacos dorados are?",
    "choices": [
      "Fried/crispy",
      "Steamed",
      "Grilled",
      "Boiled"
    ],
    "correct": 0
  },
  {
    "question": "Tinga is a stew of?",
    "choices": [
      "Shredded chicken",
      "Beef",
      "Pork",
      "Fish"
    ],
    "correct": 0
  },
  {
    "question": "Chicharron is?",
    "choices": [
      "Fried pork skin",
      "Beef jerky",
      "Smoked sausage",
      "Lamb leg"
    ],
    "correct": 0
  },
  {
    "question": "Pescado is which protein?",
    "choices": [
      "Fish",
      "Shrimp",
      "Octopus",
      "Squid"
    ],
    "correct": 0
  },
  {
    "question": "Camaron is which protein?",
    "choices": [
      "Shrimp",
      "Fish",
      "Crab",
      "Squid"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TacosQuizSettings): TacosQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TacosQuizState, action: TacosQuizAction): TacosQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TacosQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
