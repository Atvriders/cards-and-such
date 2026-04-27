import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DimSumQuizSettings { questions: "10" | "20"; }
export interface DimSumQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DimSumQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Har gow is filled with?",
    "choices": [
      "Shrimp",
      "Pork",
      "Beef",
      "Vegetable"
    ],
    "correct": 0
  },
  {
    "question": "Siu mai is open-topped and contains?",
    "choices": [
      "Pork & shrimp",
      "Vegetable",
      "Tofu",
      "Chicken"
    ],
    "correct": 0
  },
  {
    "question": "Char siu bao is a bun filled with?",
    "choices": [
      "BBQ pork",
      "Beef",
      "Lotus paste",
      "Custard"
    ],
    "correct": 0
  },
  {
    "question": "Xiao long bao originated in?",
    "choices": [
      "Shanghai",
      "Guangzhou",
      "Beijing",
      "Sichuan"
    ],
    "correct": 0
  },
  {
    "question": "Xiao long bao are famous for?",
    "choices": [
      "Hot soup inside",
      "Crispy crust",
      "Sweet filling",
      "Cold filling"
    ],
    "correct": 0
  },
  {
    "question": "Cheong fun is a?",
    "choices": [
      "Rice noodle roll",
      "Wheat noodle",
      "Egg noodle",
      "Dumpling"
    ],
    "correct": 0
  },
  {
    "question": "Lo mai gai is wrapped in?",
    "choices": [
      "Lotus leaf",
      "Banana leaf",
      "Cabbage",
      "Pastry"
    ],
    "correct": 0
  },
  {
    "question": "Lo mai gai is mostly?",
    "choices": [
      "Sticky rice",
      "Wheat noodle",
      "Egg pastry",
      "Tofu"
    ],
    "correct": 0
  },
  {
    "question": "Turnip cake is also known as?",
    "choices": [
      "Lo bak go",
      "Char siu bao",
      "Wonton",
      "Cheong fun"
    ],
    "correct": 0
  },
  {
    "question": "Yum cha literally means?",
    "choices": [
      "Drink tea",
      "Eat dumplings",
      "Steam basket",
      "Fried bun"
    ],
    "correct": 0
  },
  {
    "question": "Dim sum literally means?",
    "choices": [
      "Touch the heart",
      "Big plate",
      "Hot food",
      "Tiny food"
    ],
    "correct": 0
  },
  {
    "question": "Dim sum is associated with which Chinese region?",
    "choices": [
      "Cantonese",
      "Sichuan",
      "Beijing",
      "Hunan"
    ],
    "correct": 0
  },
  {
    "question": "Dumplings are typically steamed in?",
    "choices": [
      "Bamboo baskets",
      "Iron pots",
      "Glass bowls",
      "Clay pots"
    ],
    "correct": 0
  },
  {
    "question": "Egg tarts (dan tat) have origins linking to?",
    "choices": [
      "Portuguese",
      "French",
      "British",
      "Dutch"
    ],
    "correct": 0
  },
  {
    "question": "A custard bun is also known as?",
    "choices": [
      "Lai wong bao",
      "Char siu bao",
      "Cha siu",
      "Dou sha"
    ],
    "correct": 0
  },
  {
    "question": "Mango pudding is typically served as?",
    "choices": [
      "Dessert",
      "Soup",
      "Main",
      "Tea"
    ],
    "correct": 0
  },
  {
    "question": "Phoenix talons are actually?",
    "choices": [
      "Chicken feet",
      "Duck wings",
      "Quail eggs",
      "Pork ears"
    ],
    "correct": 0
  },
  {
    "question": "Spring rolls are typically?",
    "choices": [
      "Fried",
      "Steamed",
      "Boiled",
      "Raw"
    ],
    "correct": 0
  },
  {
    "question": "Wonton soup features?",
    "choices": [
      "Filled dumplings in broth",
      "Plain noodles",
      "Egg drop",
      "Hot pot"
    ],
    "correct": 0
  },
  {
    "question": "Pork ribs (pai gwat) are typically?",
    "choices": [
      "Steamed with black bean",
      "Grilled",
      "BBQ",
      "Fried"
    ],
    "correct": 0
  },
  {
    "question": "Sticky rice in lotus leaf is?",
    "choices": [
      "Lo mai gai",
      "Char siu bao",
      "Cheong fun",
      "Har gow"
    ],
    "correct": 0
  },
  {
    "question": "Chiu Chow style dumplings often contain?",
    "choices": [
      "Peanuts",
      "Seafood only",
      "Chocolate",
      "Cheese"
    ],
    "correct": 0
  },
  {
    "question": "Sesame balls (jin deui) are filled with?",
    "choices": [
      "Lotus or red bean paste",
      "Ground meat",
      "Vegetables",
      "Custard"
    ],
    "correct": 0
  },
  {
    "question": "Sesame balls are coated in?",
    "choices": [
      "Sesame seeds",
      "Coconut",
      "Sugar",
      "Flour"
    ],
    "correct": 0
  },
  {
    "question": "Fried taro dumplings have a crispy?",
    "choices": [
      "Lacy exterior",
      "Hard shell",
      "Crumbly crust",
      "Smooth glaze"
    ],
    "correct": 0
  },
  {
    "question": "Fung jow is the dim sum for?",
    "choices": [
      "Chicken feet",
      "Pork ribs",
      "Rice rolls",
      "Custard"
    ],
    "correct": 0
  },
  {
    "question": "A traditional dim sum cart is?",
    "choices": [
      "Pushed by servers",
      "Self-serve",
      "Robotic",
      "Buffet"
    ],
    "correct": 0
  },
  {
    "question": "Bamboo baskets stack to?",
    "choices": [
      "Cook in tiers",
      "Decorate",
      "Cool food",
      "Dry food"
    ],
    "correct": 0
  },
  {
    "question": "Tea most commonly served with dim sum?",
    "choices": [
      "Pu-erh",
      "Green sencha",
      "English Breakfast",
      "Earl Grey"
    ],
    "correct": 0
  },
  {
    "question": "Most dim sum is best eaten?",
    "choices": [
      "Right after steaming",
      "Cold",
      "Reheated",
      "Frozen"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DimSumQuizSettings): DimSumQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DimSumQuizState, action: DimSumQuizAction): DimSumQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DimSumQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
