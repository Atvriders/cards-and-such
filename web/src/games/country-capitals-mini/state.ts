import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CountryCapitalsMiniSettings { questions: "10" | "20"; }
export interface CountryCapitalsMiniState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CountryCapitalsMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Capital of France?",
    "choices": [
      "Lyon",
      "Paris",
      "Marseille",
      "Nice"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Germany?",
    "choices": [
      "Munich",
      "Hamburg",
      "Berlin",
      "Frankfurt"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Italy?",
    "choices": [
      "Milan",
      "Rome",
      "Naples",
      "Florence"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Spain?",
    "choices": [
      "Barcelona",
      "Seville",
      "Madrid",
      "Valencia"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Japan?",
    "choices": [
      "Osaka",
      "Kyoto",
      "Tokyo",
      "Yokohama"
    ],
    "correct": 2
  },
  {
    "question": "Capital of China?",
    "choices": [
      "Shanghai",
      "Beijing",
      "Hong Kong",
      "Guangzhou"
    ],
    "correct": 1
  },
  {
    "question": "Capital of India?",
    "choices": [
      "Mumbai",
      "Kolkata",
      "New Delhi",
      "Bangalore"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Brazil?",
    "choices": [
      "Rio de Janeiro",
      "S\u00e3o Paulo",
      "Bras\u00edlia",
      "Salvador"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Australia?",
    "choices": [
      "Sydney",
      "Melbourne",
      "Brisbane",
      "Canberra"
    ],
    "correct": 3
  },
  {
    "question": "Capital of Canada?",
    "choices": [
      "Toronto",
      "Vancouver",
      "Montreal",
      "Ottawa"
    ],
    "correct": 3
  },
  {
    "question": "Capital of Egypt?",
    "choices": [
      "Alexandria",
      "Cairo",
      "Giza",
      "Luxor"
    ],
    "correct": 1
  },
  {
    "question": "Capital of South Africa (executive)?",
    "choices": [
      "Cape Town",
      "Johannesburg",
      "Pretoria",
      "Durban"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Russia?",
    "choices": [
      "St Petersburg",
      "Moscow",
      "Kazan",
      "Sochi"
    ],
    "correct": 1
  },
  {
    "question": "Capital of South Korea?",
    "choices": [
      "Busan",
      "Seoul",
      "Incheon",
      "Daegu"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Mexico?",
    "choices": [
      "Guadalajara",
      "Mexico City",
      "Monterrey",
      "Puebla"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Argentina?",
    "choices": [
      "C\u00f3rdoba",
      "Buenos Aires",
      "Mendoza",
      "Rosario"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Turkey?",
    "choices": [
      "Istanbul",
      "Ankara",
      "Izmir",
      "Bursa"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Greece?",
    "choices": [
      "Thessaloniki",
      "Athens",
      "Sparta",
      "Patras"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Portugal?",
    "choices": [
      "Porto",
      "Lisbon",
      "Faro",
      "Coimbra"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Netherlands?",
    "choices": [
      "Rotterdam",
      "Amsterdam",
      "The Hague",
      "Utrecht"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Sweden?",
    "choices": [
      "Gothenburg",
      "Stockholm",
      "Malm\u00f6",
      "Uppsala"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Norway?",
    "choices": [
      "Bergen",
      "Oslo",
      "Trondheim",
      "Stavanger"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Thailand?",
    "choices": [
      "Phuket",
      "Bangkok",
      "Chiang Mai",
      "Pattaya"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Vietnam?",
    "choices": [
      "Ho Chi Minh City",
      "Hanoi",
      "Da Nang",
      "Hue"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CountryCapitalsMiniSettings): CountryCapitalsMiniState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CountryCapitalsMiniState, action: CountryCapitalsMiniAction): CountryCapitalsMiniState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CountryCapitalsMiniState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
