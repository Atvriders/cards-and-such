import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GardeningQuizSettings { questions: "10" | "20"; }
export interface GardeningQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GardeningQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which season is best for planting most spring bulbs?",
    "choices": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "correct": 2
  },
  {
    "question": "Compost is also called?",
    "choices": [
      "mulch",
      "black gold",
      "peat",
      "loam"
    ],
    "correct": 1
  },
  {
    "question": "Tomatoes are botanically classified as?",
    "choices": [
      "vegetables",
      "fruits",
      "herbs",
      "grains"
    ],
    "correct": 1
  },
  {
    "question": "A pH below 7 means soil is?",
    "choices": [
      "alkaline",
      "neutral",
      "acidic",
      "saline"
    ],
    "correct": 2
  },
  {
    "question": "Which tool aerates the lawn?",
    "choices": [
      "hoe",
      "aerator",
      "spade",
      "rake"
    ],
    "correct": 1
  },
  {
    "question": "Photosynthesis requires?",
    "choices": [
      "nitrogen",
      "sunlight",
      "oxygen",
      "calcium"
    ],
    "correct": 1
  },
  {
    "question": "Companion planting pairs basil with?",
    "choices": [
      "roses",
      "tomatoes",
      "cabbage",
      "carrots"
    ],
    "correct": 1
  },
  {
    "question": "Pruning roses is best done in?",
    "choices": [
      "midsummer",
      "late winter",
      "midwinter",
      "midautumn"
    ],
    "correct": 1
  },
  {
    "question": "Mulch helps the soil by?",
    "choices": [
      "retaining moisture",
      "attracting pests",
      "hardening",
      "draining"
    ],
    "correct": 0
  },
  {
    "question": "A perennial plant lives for?",
    "choices": [
      "one year",
      "two years",
      "several years",
      "one season"
    ],
    "correct": 2
  },
  {
    "question": "Which is a common nitrogen source?",
    "choices": [
      "potash",
      "blood meal",
      "limestone",
      "gypsum"
    ],
    "correct": 1
  },
  {
    "question": "Lavender prefers soil that is?",
    "choices": [
      "wet and clay",
      "dry and well-drained",
      "acidic",
      "saline"
    ],
    "correct": 1
  },
  {
    "question": "Bees pollinate via?",
    "choices": [
      "wind",
      "water",
      "insects",
      "gravity"
    ],
    "correct": 2
  },
  {
    "question": "Which is a root vegetable?",
    "choices": [
      "lettuce",
      "carrot",
      "cabbage",
      "spinach"
    ],
    "correct": 1
  },
  {
    "question": "An annual plant completes its life cycle in?",
    "choices": [
      "one year",
      "two years",
      "seasons",
      "decades"
    ],
    "correct": 0
  },
  {
    "question": "A trowel is used for?",
    "choices": [
      "digging large holes",
      "small planting jobs",
      "cutting branches",
      "mowing"
    ],
    "correct": 1
  },
  {
    "question": "Hardening off refers to?",
    "choices": [
      "pruning",
      "acclimating seedlings",
      "fertilizing",
      "staking"
    ],
    "correct": 1
  },
  {
    "question": "Which plant is a common ground cover?",
    "choices": [
      "sunflower",
      "creeping thyme",
      "bamboo",
      "cactus"
    ],
    "correct": 1
  },
  {
    "question": "Most herbs prefer?",
    "choices": [
      "full sun",
      "deep shade",
      "partial shade",
      "no light"
    ],
    "correct": 0
  },
  {
    "question": "Deadheading means removing?",
    "choices": [
      "leaves",
      "spent flowers",
      "weeds",
      "seeds"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GardeningQuizSettings): GardeningQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GardeningQuizState, action: GardeningQuizAction): GardeningQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GardeningQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
