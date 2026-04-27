import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CarsHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface CarsHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CarsHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First mass-produced car?",
    "choices": [
      "Model A",
      "Model T",
      "Model S",
      "Beetle"
    ],
    "correct": 1
  },
  {
    "question": "Henry Ford founded Ford in?",
    "choices": [
      "1903",
      "1908",
      "1913",
      "1920"
    ],
    "correct": 0
  },
  {
    "question": "Karl Benz patented the automobile in?",
    "choices": [
      "1879",
      "1886",
      "1895",
      "1900"
    ],
    "correct": 1
  },
  {
    "question": "Tesla Motors founded year?",
    "choices": [
      "1998",
      "2003",
      "2008",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Tesla's first car?",
    "choices": [
      "Model S",
      "Model 3",
      "Roadster",
      "Cybertruck"
    ],
    "correct": 2
  },
  {
    "question": "Volkswagen Beetle origin country?",
    "choices": [
      "Italy",
      "Germany",
      "France",
      "Czech"
    ],
    "correct": 1
  },
  {
    "question": "Toyota's first car was?",
    "choices": [
      "Crown",
      "Model AA",
      "Corolla",
      "Camry"
    ],
    "correct": 1
  },
  {
    "question": "Chevrolet co-founder?",
    "choices": [
      "Henry Ford",
      "Louis Chevrolet",
      "Walter Chrysler",
      "Ransom Olds"
    ],
    "correct": 1
  },
  {
    "question": "Lamborghini was originally a?",
    "choices": [
      "Bicycle co.",
      "Tractor co.",
      "Boat co.",
      "Plane co."
    ],
    "correct": 1
  },
  {
    "question": "Ferrari founded year?",
    "choices": [
      "1929 (Scuderia)",
      "1939",
      "1947",
      "1955"
    ],
    "correct": 0
  },
  {
    "question": "Rolls-Royce founders?",
    "choices": [
      "Charles Rolls & Henry Royce",
      "Charles Royce & Henry Rolls",
      "Two Rolls",
      "Two Royces"
    ],
    "correct": 0
  },
  {
    "question": "Bentley brand founded in?",
    "choices": [
      "1885",
      "1919",
      "1930",
      "1945"
    ],
    "correct": 1
  },
  {
    "question": "Porsche 911 introduced in?",
    "choices": [
      "1955",
      "1963",
      "1970",
      "1975"
    ],
    "correct": 1
  },
  {
    "question": "First successful electric car date?",
    "choices": [
      "1830s",
      "1880s",
      "1900s",
      "1950s"
    ],
    "correct": 0
  },
  {
    "question": "First hybrid mass-market car?",
    "choices": [
      "Honda Insight",
      "Toyota Prius",
      "Both",
      "Chevy Volt"
    ],
    "correct": 2
  },
  {
    "question": "Toyota Prius launched in?",
    "choices": [
      "1995",
      "1997",
      "2001",
      "2003"
    ],
    "correct": 1
  },
  {
    "question": "GM founded by?",
    "choices": [
      "Billy Durant",
      "Henry Ford",
      "Alfred Sloan",
      "Walter Chrysler"
    ],
    "correct": 0
  },
  {
    "question": "Chrysler founded in?",
    "choices": [
      "1900",
      "1925",
      "1935",
      "1945"
    ],
    "correct": 1
  },
  {
    "question": "BMW originally made?",
    "choices": [
      "Cars",
      "Aircraft engines",
      "Motorcycles",
      "Tractors"
    ],
    "correct": 1
  },
  {
    "question": "Mercedes-Benz emblem has?",
    "choices": [
      "3 points",
      "4 points",
      "5 points",
      "6 points"
    ],
    "correct": 0
  },
  {
    "question": "Audi's four rings represent?",
    "choices": [
      "4 cylinders",
      "4 founders",
      "4 models",
      "4 merged companies"
    ],
    "correct": 3
  },
  {
    "question": "Honda founded as a?",
    "choices": [
      "Car co.",
      "Motorcycle co.",
      "Boat co.",
      "Plane co."
    ],
    "correct": 1
  },
  {
    "question": "First car with seatbelts standard?",
    "choices": [
      "Ford T",
      "Volvo PV544",
      "Chevy Bel Air",
      "Citroen DS"
    ],
    "correct": 1
  },
  {
    "question": "Bugatti Veyron top speed (mph)?",
    "choices": [
      "~230",
      "~253",
      "~268",
      "~280"
    ],
    "correct": 2
  },
  {
    "question": "Cybertruck first revealed?",
    "choices": [
      "2019",
      "2020",
      "2021",
      "2022"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CarsHistoryQuizSettings): CarsHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CarsHistoryQuizState, action: CarsHistoryQuizAction): CarsHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CarsHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
