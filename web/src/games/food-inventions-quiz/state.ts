import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FoodInventionsQuizSettings { questions: "10" | "20" | "30"; }
export interface FoodInventionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FoodInventionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pasteurization developed by?",
    "choices": [
      "Pasteur",
      "Edison",
      "Bell",
      "Liebig"
    ],
    "correct": 0
  },
  {
    "question": "Canning of food pioneered by?",
    "choices": [
      "Appert",
      "Birdseye",
      "Kellogg",
      "Heinz"
    ],
    "correct": 0
  },
  {
    "question": "Frozen food industry pioneer?",
    "choices": [
      "Birdseye",
      "Heinz",
      "Kellogg",
      "Appert"
    ],
    "correct": 0
  },
  {
    "question": "Cornflakes were created by?",
    "choices": [
      "Kellogg",
      "Post",
      "Heinz",
      "Cadbury"
    ],
    "correct": 0
  },
  {
    "question": "Coca-Cola invented in?",
    "choices": [
      "1866",
      "1886",
      "1906",
      "1926"
    ],
    "correct": 1
  },
  {
    "question": "Pepsi invented in?",
    "choices": [
      "1873",
      "1893",
      "1913",
      "1933"
    ],
    "correct": 1
  },
  {
    "question": "Microwave oven discovered by?",
    "choices": [
      "Spencer",
      "Edison",
      "Tesla",
      "Carlson"
    ],
    "correct": 0
  },
  {
    "question": "Microwave year?",
    "choices": [
      "1925",
      "1945",
      "1965",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "Sliced bread machine introduced in?",
    "choices": [
      "1908",
      "1928",
      "1948",
      "1968"
    ],
    "correct": 1
  },
  {
    "question": "Margarine invented in which country?",
    "choices": [
      "USA",
      "France",
      "UK",
      "Germany"
    ],
    "correct": 1
  },
  {
    "question": "Pasteur worked on which beverage spoilage?",
    "choices": [
      "Wine and beer",
      "Coffee",
      "Tea",
      "Milk only"
    ],
    "correct": 0
  },
  {
    "question": "Refrigeration mechanical pioneer?",
    "choices": [
      "Perkins",
      "Edison",
      "Carrier",
      "Birdseye"
    ],
    "correct": 0
  },
  {
    "question": "First chocolate bar by?",
    "choices": [
      "Fry",
      "Hershey",
      "Cadbury",
      "Nestle"
    ],
    "correct": 0
  },
  {
    "question": "Milk chocolate pioneer?",
    "choices": [
      "Hershey",
      "Lindt",
      "Daniel Peter",
      "Cadbury"
    ],
    "correct": 2
  },
  {
    "question": "Tea bags became popular in the?",
    "choices": [
      "1880s",
      "1900s",
      "1920s",
      "1950s"
    ],
    "correct": 2
  },
  {
    "question": "Instant coffee pioneer?",
    "choices": [
      "Nestle",
      "Folgers",
      "Maxwell House",
      "Sanka"
    ],
    "correct": 0
  },
  {
    "question": "Frozen TV dinners introduced by?",
    "choices": [
      "Swanson",
      "Birdseye",
      "Kellogg",
      "Heinz"
    ],
    "correct": 0
  },
  {
    "question": "Hamburger as fast food popularized by?",
    "choices": [
      "White Castle",
      "McDonald's",
      "Burger King",
      "Wendy's"
    ],
    "correct": 0
  },
  {
    "question": "McDonald's brothers opened first restaurant in?",
    "choices": [
      "1930",
      "1940",
      "1950",
      "1960"
    ],
    "correct": 1
  },
  {
    "question": "KFC founder?",
    "choices": [
      "Sanders",
      "Kroc",
      "Thomas",
      "Crocker"
    ],
    "correct": 0
  },
  {
    "question": "Toaster electric invented around?",
    "choices": [
      "1893",
      "1909",
      "1929",
      "1949"
    ],
    "correct": 1
  },
  {
    "question": "Saccharin (artificial sweetener) discovered in?",
    "choices": [
      "1859",
      "1879",
      "1899",
      "1919"
    ],
    "correct": 1
  },
  {
    "question": "Aspartame discovered in?",
    "choices": [
      "1945",
      "1965",
      "1985",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Vegemite invented in?",
    "choices": [
      "UK",
      "Australia",
      "NZ",
      "USA"
    ],
    "correct": 1
  },
  {
    "question": "Nutella was created in?",
    "choices": [
      "France",
      "Italy",
      "Germany",
      "Belgium"
    ],
    "correct": 1
  },
  {
    "question": "Sushi originated in?",
    "choices": [
      "China",
      "Japan",
      "Korea",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "Ice cream cone popularized at?",
    "choices": [
      "1904 World's Fair",
      "1920 Olympics",
      "1939 Fair",
      "1893 Fair"
    ],
    "correct": 0
  },
  {
    "question": "Pizza Margherita named after?",
    "choices": [
      "Queen",
      "Princess",
      "Cook",
      "City"
    ],
    "correct": 0
  },
  {
    "question": "Sliced bread machine inventor?",
    "choices": [
      "Rohwedder",
      "Birdseye",
      "Kellogg",
      "Heinz"
    ],
    "correct": 0
  },
  {
    "question": "First commercial yogurt brand?",
    "choices": [
      "Danone",
      "Yoplait",
      "Chobani",
      "Activia"
    ],
    "correct": 0
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
