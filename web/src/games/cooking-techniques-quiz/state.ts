import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CookingTechniquesQuizSettings { questions: "10" | "20"; }
export interface CookingTechniquesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CookingTechniquesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Saut\u00e9ing uses which type of heat?",
    "choices": [
      "Low slow",
      "High dry quick",
      "Wet steam",
      "Cold"
    ],
    "correct": 1
  },
  {
    "question": "Braising combines searing with?",
    "choices": [
      "frying",
      "slow moist cooking",
      "grilling",
      "baking dry"
    ],
    "correct": 1
  },
  {
    "question": "Blanching vegetables is followed by?",
    "choices": [
      "roasting",
      "ice bath",
      "frying",
      "drying"
    ],
    "correct": 1
  },
  {
    "question": "Sous vide cooks food in?",
    "choices": [
      "oil",
      "vacuum-sealed water bath",
      "steam",
      "smoke"
    ],
    "correct": 1
  },
  {
    "question": "'Mise en place' means?",
    "choices": [
      "taste as you go",
      "everything in place",
      "season heavily",
      "reduce sauce"
    ],
    "correct": 1
  },
  {
    "question": "The Maillard reaction produces?",
    "choices": [
      "caramelization of sugar",
      "browning and flavor",
      "steam",
      "smoke"
    ],
    "correct": 1
  },
  {
    "question": "A 'roux' is made from flour and?",
    "choices": [
      "water",
      "butter",
      "milk",
      "oil"
    ],
    "correct": 1
  },
  {
    "question": "Deglazing a pan uses?",
    "choices": [
      "cold water",
      "liquid to lift fond",
      "oil",
      "cream"
    ],
    "correct": 1
  },
  {
    "question": "Caramelization happens with?",
    "choices": [
      "proteins",
      "sugars",
      "fats",
      "starches"
    ],
    "correct": 1
  },
  {
    "question": "Poaching is cooking gently in?",
    "choices": [
      "oil",
      "liquid below boiling",
      "steam",
      "fat"
    ],
    "correct": 1
  },
  {
    "question": "'Brunoise' is a cut of?",
    "choices": [
      "1cm cubes",
      "very fine 3mm dice",
      "julienne",
      "slices"
    ],
    "correct": 1
  },
  {
    "question": "A bain-marie is a?",
    "choices": [
      "pressure cooker",
      "water bath",
      "stockpot",
      "steamer"
    ],
    "correct": 1
  },
  {
    "question": "Tempering chocolate creates?",
    "choices": [
      "a soft texture",
      "glossy snap",
      "grainy finish",
      "liquid form"
    ],
    "correct": 1
  },
  {
    "question": "'Reduction' concentrates flavor by?",
    "choices": [
      "adding water",
      "evaporating liquid",
      "freezing",
      "whipping"
    ],
    "correct": 1
  },
  {
    "question": "A chiffonade is used for?",
    "choices": [
      "roots",
      "leafy herbs",
      "onions",
      "meats"
    ],
    "correct": 1
  },
  {
    "question": "Confit involves cooking in?",
    "choices": [
      "water",
      "fat at low temp",
      "brine",
      "wine"
    ],
    "correct": 1
  },
  {
    "question": "Searing aims to develop?",
    "choices": [
      "pink center",
      "crust and color",
      "steam",
      "tenderness"
    ],
    "correct": 1
  },
  {
    "question": "Emulsification combines?",
    "choices": [
      "sugar and water",
      "oil and water",
      "flour and milk",
      "egg and salt"
    ],
    "correct": 1
  },
  {
    "question": "A bechamel is a sauce made from milk and?",
    "choices": [
      "roux",
      "cream",
      "butter only",
      "egg"
    ],
    "correct": 0
  },
  {
    "question": "'Al dente' refers to pasta that is?",
    "choices": [
      "overcooked",
      "firm to the bite",
      "raw",
      "mushy"
    ],
    "correct": 1
  },
  {
    "question": "Smoking foods uses?",
    "choices": [
      "raw heat",
      "wood smoke",
      "ice",
      "steam"
    ],
    "correct": 1
  },
  {
    "question": "'Folding' batter prevents?",
    "choices": [
      "under-mixing",
      "loss of air",
      "over-flouring",
      "burning"
    ],
    "correct": 1
  },
  {
    "question": "Proofing dough means?",
    "choices": [
      "kneading",
      "letting it rise",
      "baking",
      "cooling"
    ],
    "correct": 1
  },
  {
    "question": "Dry brining uses?",
    "choices": [
      "water",
      "salt",
      "sugar",
      "vinegar"
    ],
    "correct": 1
  },
  {
    "question": "'Resting' cooked meat allows?",
    "choices": [
      "evaporation",
      "juice redistribution",
      "cooling",
      "browning"
    ],
    "correct": 1
  },
  {
    "question": "Flamb\u00e9ing involves igniting?",
    "choices": [
      "water",
      "alcohol",
      "oil",
      "sugar"
    ],
    "correct": 1
  },
  {
    "question": "A double boiler is used for gentle?",
    "choices": [
      "frying",
      "melting/cooking",
      "poaching",
      "boiling"
    ],
    "correct": 1
  },
  {
    "question": "Whisking egg whites incorporates?",
    "choices": [
      "fat",
      "air",
      "sugar",
      "heat"
    ],
    "correct": 1
  },
  {
    "question": "Pickling preserves food using?",
    "choices": [
      "sugar",
      "acid/brine",
      "oil",
      "smoke"
    ],
    "correct": 1
  },
  {
    "question": "Pan-frying uses more oil than?",
    "choices": [
      "deep frying",
      "saut\u00e9ing",
      "boiling",
      "sous vide"
    ],
    "correct": 1
  },
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
