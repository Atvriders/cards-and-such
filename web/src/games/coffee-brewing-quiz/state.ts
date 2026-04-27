import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CoffeeBrewingQuizSettings { questions: "10" | "20"; }
export interface CoffeeBrewingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CoffeeBrewingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Espresso brewing time is roughly?",
    "choices": [
      "5 sec",
      "25-30 sec",
      "2 min",
      "5 min"
    ],
    "correct": 1
  },
  {
    "question": "Pour-over coffee uses?",
    "choices": [
      "pressure",
      "gravity drip",
      "percolation",
      "French press"
    ],
    "correct": 1
  },
  {
    "question": "Ideal brewing water temperature?",
    "choices": [
      "140°F",
      "180°F",
      "195-205°F",
      "220°F"
    ],
    "correct": 2
  },
  {
    "question": "A French press uses?",
    "choices": [
      "paper filter",
      "metal mesh",
      "gold filter",
      "none"
    ],
    "correct": 1
  },
  {
    "question": "Cold brew steeps for?",
    "choices": [
      "10 min",
      "1 hour",
      "12-24 hours",
      "several days"
    ],
    "correct": 2
  },
  {
    "question": "Light roasts retain more?",
    "choices": [
      "caffeine",
      "oils",
      "sugar",
      "fat"
    ],
    "correct": 0
  },
  {
    "question": "An AeroPress uses?",
    "choices": [
      "centrifuge",
      "manual pressure",
      "electricity",
      "steam only"
    ],
    "correct": 1
  },
  {
    "question": "Burr grinders produce?",
    "choices": [
      "uneven grind",
      "even grind",
      "powder",
      "flakes"
    ],
    "correct": 1
  },
  {
    "question": "Crema is the foam on?",
    "choices": [
      "cappuccino",
      "espresso",
      "drip coffee",
      "cold brew"
    ],
    "correct": 1
  },
  {
    "question": "A typical cappuccino is?",
    "choices": [
      "1/3 espresso 1/3 milk 1/3 foam",
      "all milk",
      "all foam",
      "drip coffee"
    ],
    "correct": 0
  },
  {
    "question": "The bean is technically a?",
    "choices": [
      "nut",
      "seed",
      "fruit",
      "leaf"
    ],
    "correct": 1
  },
  {
    "question": "Arabica is generally?",
    "choices": [
      "bitter & strong",
      "smoother & sweeter",
      "caffeinated",
      "acidic"
    ],
    "correct": 1
  },
  {
    "question": "A V60 is a?",
    "choices": [
      "French press",
      "pour-over dripper",
      "espresso machine",
      "grinder"
    ],
    "correct": 1
  },
  {
    "question": "Robusta has more?",
    "choices": [
      "sugar",
      "caffeine",
      "oil",
      "aroma"
    ],
    "correct": 1
  },
  {
    "question": "Ratio rule of thumb is?",
    "choices": [
      "1:5 coffee to water",
      "1:15 coffee to water",
      "1:30",
      "1:100"
    ],
    "correct": 1
  },
  {
    "question": "Stovetop moka pots are popular in?",
    "choices": [
      "Italy",
      "Brazil",
      "Ethiopia",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "Which country produces the most coffee?",
    "choices": [
      "Vietnam",
      "Colombia",
      "Brazil",
      "Ethiopia"
    ],
    "correct": 2
  },
  {
    "question": "Bloom (in pour-over) refers to?",
    "choices": [
      "foaming top",
      "initial CO2 release",
      "old grounds",
      "oil layer"
    ],
    "correct": 1
  },
  {
    "question": "A flat white originated in?",
    "choices": [
      "UK",
      "Australia/NZ",
      "Italy",
      "France"
    ],
    "correct": 1
  },
  {
    "question": "Decaf still has about?",
    "choices": [
      "0%",
      "2-3%",
      "20%",
      "50%"
    ],
    "correct": 1
  }
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
