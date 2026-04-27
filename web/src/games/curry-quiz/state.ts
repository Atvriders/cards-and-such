import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CurryQuizSettings { questions: "10" | "20"; }
export interface CurryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CurryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tikka masala is most famously a dish from?",
    "choices": [
      "UK/Indian",
      "Pakistan",
      "Sri Lanka",
      "Bangladesh"
    ],
    "correct": 0
  },
  {
    "question": "Vindaloo originated under whose influence?",
    "choices": [
      "Portuguese",
      "British",
      "Persian",
      "Mughal"
    ],
    "correct": 0
  },
  {
    "question": "Vindaloo is famously?",
    "choices": [
      "Spicy/sour",
      "Sweet",
      "Mild",
      "Creamy"
    ],
    "correct": 0
  },
  {
    "question": "Korma is characterized by?",
    "choices": [
      "Creamy/mild",
      "Hot/sour",
      "Smoky",
      "Tangy/red"
    ],
    "correct": 0
  },
  {
    "question": "Rogan josh is a curry from?",
    "choices": [
      "Kashmir",
      "Punjab",
      "Goa",
      "Kerala"
    ],
    "correct": 0
  },
  {
    "question": "Butter chicken's other name is?",
    "choices": [
      "Murgh makhani",
      "Murgh tikka",
      "Murgh saag",
      "Murgh mughlai"
    ],
    "correct": 0
  },
  {
    "question": "Saag refers to?",
    "choices": [
      "Greens",
      "Tomato",
      "Coconut",
      "Cream"
    ],
    "correct": 0
  },
  {
    "question": "Dal is?",
    "choices": [
      "Lentil curry",
      "Meat curry",
      "Yogurt curry",
      "Vegetable mix"
    ],
    "correct": 0
  },
  {
    "question": "Madras curry is associated with which region?",
    "choices": [
      "South India (Tamil)",
      "Punjab",
      "Bengal",
      "Goa"
    ],
    "correct": 0
  },
  {
    "question": "Goan fish curry features?",
    "choices": [
      "Coconut/kokum",
      "Cream/cashew",
      "Yogurt/garlic",
      "Mustard/honey"
    ],
    "correct": 0
  },
  {
    "question": "Thai red curry's main heat source is?",
    "choices": [
      "Red chilies",
      "Green chilies",
      "White pepper",
      "Black pepper"
    ],
    "correct": 0
  },
  {
    "question": "Thai green curry's main heat source is?",
    "choices": [
      "Green chilies",
      "Red chilies",
      "White pepper",
      "Mustard"
    ],
    "correct": 0
  },
  {
    "question": "Thai yellow curry contains?",
    "choices": [
      "Turmeric",
      "Cinnamon",
      "Saffron",
      "Pepper"
    ],
    "correct": 0
  },
  {
    "question": "Massaman curry shows influence from?",
    "choices": [
      "Persian/Indian",
      "Chinese",
      "French",
      "Japanese"
    ],
    "correct": 0
  },
  {
    "question": "Panang curry is typically?",
    "choices": [
      "Thicker/sweeter",
      "Soup-like",
      "Watery",
      "Bitter"
    ],
    "correct": 0
  },
  {
    "question": "Khao soi is from which country?",
    "choices": [
      "Thailand",
      "Vietnam",
      "Cambodia",
      "Laos"
    ],
    "correct": 0
  },
  {
    "question": "Japanese kare raisu was popularized by?",
    "choices": [
      "Royal Navy/British roots",
      "Portuguese traders",
      "Dutch",
      "French"
    ],
    "correct": 0
  },
  {
    "question": "Japanese curry is typically?",
    "choices": [
      "Thick/sweet",
      "Spicy/hot",
      "Watery",
      "Sour"
    ],
    "correct": 0
  },
  {
    "question": "Katsu curry adds what?",
    "choices": [
      "Fried cutlet",
      "Egg",
      "Cheese",
      "Pickle"
    ],
    "correct": 0
  },
  {
    "question": "Sri Lankan curries often feature?",
    "choices": [
      "Cinnamon/coconut",
      "Yogurt",
      "Cream",
      "Tomato paste"
    ],
    "correct": 0
  },
  {
    "question": "Rendang originates in?",
    "choices": [
      "Indonesia/Malaysia",
      "Thailand",
      "India",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "Rendang is famously?",
    "choices": [
      "Slow-cooked dry",
      "Soup-like",
      "Sweet",
      "Cold"
    ],
    "correct": 0
  },
  {
    "question": "Caribbean curry was brought by?",
    "choices": [
      "Indian indentured workers",
      "Spanish settlers",
      "French",
      "British"
    ],
    "correct": 0
  },
  {
    "question": "Trinidadian curry famously includes?",
    "choices": [
      "Doubles/Roti",
      "Rice",
      "Naan",
      "Pasta"
    ],
    "correct": 0
  },
  {
    "question": "Lemongrass and galangal are common in?",
    "choices": [
      "Thai/SEA curries",
      "Indian curries",
      "Japanese",
      "British"
    ],
    "correct": 0
  },
  {
    "question": "Kaffir lime leaves are common in?",
    "choices": [
      "Thai curries",
      "Indian curries",
      "Japanese",
      "British"
    ],
    "correct": 0
  },
  {
    "question": "Garam masala is a?",
    "choices": [
      "Spice blend",
      "Single spice",
      "Type of rice",
      "Type of dal"
    ],
    "correct": 0
  },
  {
    "question": "Turmeric provides which color?",
    "choices": [
      "Yellow/gold",
      "Red",
      "Green",
      "Brown"
    ],
    "correct": 0
  },
  {
    "question": "Cardamom is famously?",
    "choices": [
      "Aromatic/sweet",
      "Bitter",
      "Sour",
      "Salty"
    ],
    "correct": 0
  },
  {
    "question": "Naan is best paired with?",
    "choices": [
      "North Indian curry",
      "Thai curry",
      "Japanese curry",
      "Caribbean"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CurryQuizSettings): CurryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CurryQuizState, action: CurryQuizAction): CurryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CurryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
