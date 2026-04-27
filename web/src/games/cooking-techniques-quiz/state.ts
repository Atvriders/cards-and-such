import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CookingTechniquesQuizSettings { questions: "10" | "20"; }
export interface CookingTechniquesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CookingTechniquesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Sautéing means cooking quickly in?",
    "choices": [
      "oil over high heat",
      "water over low heat",
      "oven",
      "steam"
    ],
    "correct": 0
  },
  {
    "question": "Braising is a combination of?",
    "choices": [
      "dry & wet heat",
      "grilling & smoking",
      "steaming & boiling",
      "baking & frying"
    ],
    "correct": 0
  },
  {
    "question": "Caramelization occurs at approximately?",
    "choices": [
      "100°F",
      "200°F",
      "300°F",
      "400°F"
    ],
    "correct": 2
  },
  {
    "question": "Sous vide cooking uses?",
    "choices": [
      "dry heat",
      "precise water bath",
      "steam",
      "oven"
    ],
    "correct": 1
  },
  {
    "question": "A roux is a mixture of?",
    "choices": [
      "fat & flour",
      "fat & sugar",
      "stock & wine",
      "milk & cream"
    ],
    "correct": 0
  },
  {
    "question": "Blanching means briefly?",
    "choices": [
      "boiling then ice bath",
      "steaming",
      "frying",
      "baking"
    ],
    "correct": 0
  },
  {
    "question": "Searing creates flavor through the?",
    "choices": [
      "Maillard reaction",
      "oxidation",
      "fermentation",
      "gelation"
    ],
    "correct": 0
  },
  {
    "question": "Deglazing uses liquid to?",
    "choices": [
      "clean fond from pan",
      "clean dishes",
      "cool down food",
      "thin sauce"
    ],
    "correct": 0
  },
  {
    "question": "Tempering chocolate stabilizes?",
    "choices": [
      "sugar",
      "cocoa butter crystals",
      "milk",
      "vanilla"
    ],
    "correct": 1
  },
  {
    "question": "Folding is a gentle technique to?",
    "choices": [
      "combine without deflating",
      "separate",
      "beat air in",
      "cool"
    ],
    "correct": 0
  },
  {
    "question": "Reducing a sauce means?",
    "choices": [
      "cooling",
      "simmering to thicken",
      "diluting",
      "straining"
    ],
    "correct": 1
  },
  {
    "question": "Brining adds?",
    "choices": [
      "acidity",
      "moisture & seasoning",
      "crispness",
      "sweetness"
    ],
    "correct": 1
  },
  {
    "question": "Confit means cooking slowly in?",
    "choices": [
      "water",
      "wine",
      "fat",
      "oven"
    ],
    "correct": 2
  },
  {
    "question": "Poaching uses water at?",
    "choices": [
      "below boiling",
      "rolling boil",
      "high simmer",
      "vapor only"
    ],
    "correct": 0
  },
  {
    "question": "Mise en place means?",
    "choices": [
      "cleaning station",
      "everything in its place",
      "menu plan",
      "table setting"
    ],
    "correct": 1
  },
  {
    "question": "Julienne is a cut described as?",
    "choices": [
      "thin matchstick",
      "cubes",
      "slices",
      "mince"
    ],
    "correct": 0
  },
  {
    "question": "An emulsion combines?",
    "choices": [
      "two solids",
      "two gases",
      "oil & water",
      "sugars"
    ],
    "correct": 2
  },
  {
    "question": "A bain-marie is a?",
    "choices": [
      "water bath",
      "oven",
      "pressure cooker",
      "chiller"
    ],
    "correct": 0
  },
  {
    "question": "Roasting uses primarily?",
    "choices": [
      "dry heat in oven",
      "wet heat",
      "steam",
      "direct flame"
    ],
    "correct": 0
  },
  {
    "question": "Sweating onions means?",
    "choices": [
      "fast browning",
      "slow cook without color",
      "blanching",
      "caramelizing"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CookingTechniquesQuizSettings): CookingTechniquesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CookingTechniquesQuizState, action: CookingTechniquesQuizAction): CookingTechniquesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CookingTechniquesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
