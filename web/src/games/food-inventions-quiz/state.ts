import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FoodInventionsQuizSettings { questions: "10" | "20" | "30"; }
export interface FoodInventionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FoodInventionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pasteurization helps preserve?",
    "choices": [
      "Wood",
      "Milk and beverages",
      "Metal",
      "Paper"
    ],
    "correct": 1
  },
  {
    "question": "Canned food invented during?",
    "choices": [
      "Roman era",
      "Napoleonic era (Appert)",
      "Industrial Revolution mid-1800s",
      "WWII"
    ],
    "correct": 1
  },
  {
    "question": "Coca-Cola was created in?",
    "choices": [
      "1850",
      "1886",
      "1900",
      "1910"
    ],
    "correct": 1
  },
  {
    "question": "Frozen food popularized by?",
    "choices": [
      "Birdseye",
      "Heinz",
      "Kellogg",
      "Nestle"
    ],
    "correct": 0
  },
  {
    "question": "Cornflakes invented by?",
    "choices": [
      "Kelloggs",
      "Post",
      "Nestle",
      "General Mills"
    ],
    "correct": 0
  },
  {
    "question": "Margarine was invented as a substitute for?",
    "choices": [
      "Olive oil",
      "Butter",
      "Lard",
      "Cream"
    ],
    "correct": 1
  },
  {
    "question": "Tea bags became popular in the?",
    "choices": [
      "1900s-1910s",
      "1950s",
      "1970s",
      "1850s"
    ],
    "correct": 0
  },
  {
    "question": "Microwave dinners (TV dinners) by?",
    "choices": [
      "Stouffer 1970s",
      "Swanson 1953",
      "Lean Cuisine 1990",
      "Banquet 1960"
    ],
    "correct": 1
  },
  {
    "question": "Pasteur invented?",
    "choices": [
      "Pasteurization",
      "Refrigeration",
      "Canning",
      "Drying"
    ],
    "correct": 0
  },
  {
    "question": "Bread sliced commercially first in?",
    "choices": [
      "1928",
      "1950",
      "1900",
      "1970"
    ],
    "correct": 0
  },
  {
    "question": "Champagne is associated with?",
    "choices": [
      "Champagne region of France",
      "Italy",
      "Spain",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Pasteurized homogenized milk became standard in?",
    "choices": [
      "1800s",
      "Mid 20th century",
      "2000s",
      "1700s"
    ],
    "correct": 1
  },
  {
    "question": "Frosted Flakes/sugary cereals expanded in?",
    "choices": [
      "1900s",
      "1950s",
      "1980s",
      "2000s"
    ],
    "correct": 1
  },
  {
    "question": "First successful instant coffee?",
    "choices": [
      "Maxwell House 1900",
      "Nescafe 1938",
      "Folgers 1950",
      "Sanka 1903"
    ],
    "correct": 1
  },
  {
    "question": "Sliced bread became 'best thing' phrase from?",
    "choices": [
      "1880s",
      "1930s ad",
      "1960s",
      "1990s"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FoodInventionsQuizSettings): FoodInventionsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FoodInventionsQuizState, action: FoodInventionsQuizAction): FoodInventionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FoodInventionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
