import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GardeningQuizSettings { questions: "10" | "20"; }
export interface GardeningQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GardeningQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which nutrient promotes leafy green growth?",
    "choices": [
      "Phosphorus",
      "Nitrogen",
      "Potassium",
      "Calcium"
    ],
    "correct": 1
  },
  {
    "question": "The pH of neutral soil is?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Composting requires a balance of greens (nitrogen) and?",
    "choices": [
      "water",
      "browns (carbon)",
      "sand",
      "clay"
    ],
    "correct": 1
  },
  {
    "question": "Tomatoes are botanically classified as?",
    "choices": [
      "vegetables",
      "fruits",
      "berries",
      "tubers"
    ],
    "correct": 1
  },
  {
    "question": "Mulching primarily helps to?",
    "choices": [
      "fertilize",
      "retain moisture",
      "kill weeds",
      "attract bees"
    ],
    "correct": 1
  },
  {
    "question": "Which plant fixes nitrogen in soil?",
    "choices": [
      "Tomato",
      "Bean",
      "Lettuce",
      "Onion"
    ],
    "correct": 1
  },
  {
    "question": "Hardiness zones are defined by?",
    "choices": [
      "rainfall",
      "minimum winter temperatures",
      "sun hours",
      "altitude"
    ],
    "correct": 1
  },
  {
    "question": "Deadheading flowers means removing?",
    "choices": [
      "leaves",
      "spent blooms",
      "roots",
      "stems"
    ],
    "correct": 1
  },
  {
    "question": "A perennial plant lives for?",
    "choices": [
      "one season",
      "two years",
      "more than two years",
      "one month"
    ],
    "correct": 2
  },
  {
    "question": "Pollinators include bees, butterflies, and?",
    "choices": [
      "worms",
      "hummingbirds",
      "ants",
      "spiders"
    ],
    "correct": 1
  },
  {
    "question": "'Companion planting' pairs crops to?",
    "choices": [
      "look pretty",
      "benefit each other",
      "fill space",
      "save seed"
    ],
    "correct": 1
  },
  {
    "question": "Photosynthesis converts light into?",
    "choices": [
      "heat",
      "sugar",
      "oxygen only",
      "water"
    ],
    "correct": 1
  },
  {
    "question": "Which is a cool-season crop?",
    "choices": [
      "Tomato",
      "Pepper",
      "Lettuce",
      "Squash"
    ],
    "correct": 2
  },
  {
    "question": "Garlic is typically planted in?",
    "choices": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "correct": 2
  },
  {
    "question": "Worm castings are valued as?",
    "choices": [
      "mulch",
      "fertilizer",
      "pesticide",
      "seed"
    ],
    "correct": 1
  },
  {
    "question": "A 'rhizome' is a type of?",
    "choices": [
      "root",
      "underground stem",
      "leaf",
      "seed"
    ],
    "correct": 1
  },
  {
    "question": "Dahlia tubers should be lifted before?",
    "choices": [
      "spring",
      "summer",
      "frost",
      "rain"
    ],
    "correct": 2
  },
  {
    "question": "Pruning fruit trees is best done in?",
    "choices": [
      "mid-summer",
      "late winter",
      "autumn",
      "never"
    ],
    "correct": 1
  },
  {
    "question": "Which pest is famously deterred by marigolds?",
    "choices": [
      "aphids",
      "nematodes",
      "slugs",
      "beetles"
    ],
    "correct": 1
  },
  {
    "question": "Mycorrhizae are beneficial?",
    "choices": [
      "bacteria",
      "fungi",
      "viruses",
      "insects"
    ],
    "correct": 1
  },
  {
    "question": "Heirloom seeds are?",
    "choices": [
      "hybrid",
      "open-pollinated",
      "sterile",
      "GMO"
    ],
    "correct": 1
  },
  {
    "question": "Bolting in lettuce means it is going to?",
    "choices": [
      "wilt",
      "flower/seed",
      "rot",
      "yellow"
    ],
    "correct": 1
  },
  {
    "question": "'Hardening off' seedlings means?",
    "choices": [
      "fertilizing",
      "gradual outdoor exposure",
      "pruning",
      "watering"
    ],
    "correct": 1
  },
  {
    "question": "Lavender prefers soil that is?",
    "choices": [
      "wet",
      "well-drained",
      "clay",
      "acidic"
    ],
    "correct": 1
  },
  {
    "question": "Which is an example of a brassica?",
    "choices": [
      "Carrot",
      "Broccoli",
      "Tomato",
      "Pepper"
    ],
    "correct": 1
  },
  {
    "question": "Earthworms improve soil by?",
    "choices": [
      "pollinating",
      "aerating",
      "spreading seeds",
      "adding nitrogen"
    ],
    "correct": 1
  },
  {
    "question": "A 'cultivar' is a?",
    "choices": [
      "wild plant",
      "cultivated variety",
      "weed",
      "tree"
    ],
    "correct": 1
  },
  {
    "question": "Square foot gardening was popularized by?",
    "choices": [
      "Mel Bartholomew",
      "Monty Don",
      "James Wong",
      "Alan Titchmarsh"
    ],
    "correct": 0
  },
  {
    "question": "Hydrangea color often depends on soil?",
    "choices": [
      "moisture",
      "pH",
      "temperature",
      "texture"
    ],
    "correct": 1
  },
  {
    "question": "Which tool is best for cutting small branches?",
    "choices": [
      "Spade",
      "Secateurs",
      "Trowel",
      "Hoe"
    ],
    "correct": 1
  },
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
