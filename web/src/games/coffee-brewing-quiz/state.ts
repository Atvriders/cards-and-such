import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CoffeeBrewingQuizSettings { questions: "10" | "20"; }
export interface CoffeeBrewingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CoffeeBrewingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The two most common coffee species are Arabica and?",
    "choices": [
      "Liberica",
      "Robusta",
      "Excelsa",
      "Catuai"
    ],
    "correct": 1
  },
  {
    "question": "Espresso is brewed under approximately how many bars of pressure?",
    "choices": [
      "3",
      "6",
      "9",
      "15"
    ],
    "correct": 2
  },
  {
    "question": "Pour-over coffee is typically brewed using?",
    "choices": [
      "pressure",
      "gravity drip",
      "immersion",
      "percolation"
    ],
    "correct": 1
  },
  {
    "question": "French press is an example of?",
    "choices": [
      "drip",
      "pressure",
      "immersion brewing",
      "percolator"
    ],
    "correct": 2
  },
  {
    "question": "Aeropress brewing involves?",
    "choices": [
      "high pressure machine",
      "manual air pressure",
      "vacuum",
      "pour-over"
    ],
    "correct": 1
  },
  {
    "question": "A typical pour-over ratio is around?",
    "choices": [
      "1:5",
      "1:10",
      "1:16",
      "1:30"
    ],
    "correct": 2
  },
  {
    "question": "Light roasts generally have?",
    "choices": [
      "less acidity",
      "more acidity",
      "more bitterness",
      "no flavor"
    ],
    "correct": 1
  },
  {
    "question": "Dark roasts emphasize?",
    "choices": [
      "fruit notes",
      "floral",
      "bitter and roasted notes",
      "sweetness"
    ],
    "correct": 2
  },
  {
    "question": "Optimal brewing water temperature is around?",
    "choices": [
      "70\u00b0C",
      "85\u00b0C",
      "93\u00b0C",
      "105\u00b0C"
    ],
    "correct": 2
  },
  {
    "question": "Espresso shot typical volume is about?",
    "choices": [
      "10ml",
      "30ml",
      "60ml",
      "100ml"
    ],
    "correct": 1
  },
  {
    "question": "Coffee freshness is best within how many weeks of roasting?",
    "choices": [
      "1-4",
      "6-8",
      "12-16",
      "none"
    ],
    "correct": 0
  },
  {
    "question": "Cold brew is brewed for how long typically?",
    "choices": [
      "10 minutes",
      "1 hour",
      "12-24 hours",
      "1 week"
    ],
    "correct": 2
  },
  {
    "question": "A 'crema' is the foam atop a fresh?",
    "choices": [
      "latte",
      "drip coffee",
      "espresso",
      "cold brew"
    ],
    "correct": 2
  },
  {
    "question": "Coffee originated in?",
    "choices": [
      "Brazil",
      "Ethiopia",
      "Colombia",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "The Chemex was invented in?",
    "choices": [
      "1901",
      "1941",
      "1962",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "V60 was created by which company?",
    "choices": [
      "Bodum",
      "Hario",
      "Kalita",
      "Aeropress"
    ],
    "correct": 1
  },
  {
    "question": "Espresso grind is typically?",
    "choices": [
      "coarse",
      "medium",
      "fine",
      "extra coarse"
    ],
    "correct": 2
  },
  {
    "question": "French press grind is typically?",
    "choices": [
      "fine",
      "medium-fine",
      "coarse",
      "powder"
    ],
    "correct": 2
  },
  {
    "question": "'Bloom' in pour-over refers to?",
    "choices": [
      "foam",
      "CO2 release on first pour",
      "crema",
      "cooling"
    ],
    "correct": 1
  },
  {
    "question": "Decaf coffee retains roughly what % of caffeine?",
    "choices": [
      "50",
      "25",
      "2-3",
      "0"
    ],
    "correct": 2
  },
  {
    "question": "A 'flat white' originated in?",
    "choices": [
      "Italy",
      "USA",
      "Australia/NZ",
      "France"
    ],
    "correct": 2
  },
  {
    "question": "Robusta beans contain more caffeine than?",
    "choices": [
      "green tea",
      "Arabica",
      "Liberica",
      "matcha"
    ],
    "correct": 1
  },
  {
    "question": "Barista is the Italian word for?",
    "choices": [
      "server",
      "bartender/barperson",
      "chef",
      "host"
    ],
    "correct": 1
  },
  {
    "question": "Specialty coffee scores at least how many points (SCA)?",
    "choices": [
      "60",
      "70",
      "80",
      "90"
    ],
    "correct": 2
  },
  {
    "question": "Moka pot brews on the?",
    "choices": [
      "stovetop",
      "oven",
      "microwave",
      "fridge"
    ],
    "correct": 0
  },
  {
    "question": "Robusta is preferred by some for espresso for its?",
    "choices": [
      "acidity",
      "crema and body",
      "fruit notes",
      "sweetness"
    ],
    "correct": 1
  },
  {
    "question": "Single-origin means coffee from?",
    "choices": [
      "one farm/region",
      "blends",
      "blended roasters",
      "grocery"
    ],
    "correct": 0
  },
  {
    "question": "Coffee cherry contains how many beans typically?",
    "choices": [
      "1",
      "2",
      "4",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Tamping pressure for espresso is roughly?",
    "choices": [
      "1 lb",
      "5 lbs",
      "30 lbs",
      "100 lbs"
    ],
    "correct": 2
  },
  {
    "question": "'Channeling' in espresso causes?",
    "choices": [
      "even extraction",
      "uneven extraction",
      "cooling",
      "crema"
    ],
    "correct": 1
  },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CoffeeBrewingQuizSettings): CoffeeBrewingQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CoffeeBrewingQuizState, action: CoffeeBrewingQuizAction): CoffeeBrewingQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CoffeeBrewingQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
