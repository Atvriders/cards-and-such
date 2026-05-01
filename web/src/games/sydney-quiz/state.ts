import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SydneyQuizSettings { questions: "10" | "20"; }
export interface SydneyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SydneyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Sydney Opera House was designed by?",
    "choices": [
      "Frank Lloyd Wright",
      "Jørn Utzon",
      "Norman Foster",
      "Le Corbusier"
    ],
    "correct": 1
  },
  {
    "question": "Sydney Harbour Bridge was completed in?",
    "choices": [
      "1912",
      "1932",
      "1952",
      "1972"
    ],
    "correct": 1
  },
  {
    "question": "Bondi is famous for its?",
    "choices": [
      "mountains",
      "beach",
      "casino",
      "cathedral"
    ],
    "correct": 1
  },
  {
    "question": "Sydney is the capital of which Australian state?",
    "choices": [
      "Victoria",
      "New South Wales",
      "Queensland",
      "Western Australia"
    ],
    "correct": 1
  },
  {
    "question": "The Rocks is a historic?",
    "choices": [
      "geological park",
      "colonial-era waterfront district",
      "outback ranch",
      "ski resort"
    ],
    "correct": 1
  },
  {
    "question": "The First Fleet arrived at Sydney Cove in?",
    "choices": [
      "1688",
      "1788",
      "1888",
      "1901"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's central rail and ferry hub is?",
    "choices": [
      "Central Station",
      "Circular Quay",
      "Town Hall",
      "Wynyard"
    ],
    "correct": 1
  },
  {
    "question": "The Sydney Tower is also called the?",
    "choices": [
      "Sky Needle",
      "Eye/Sydney Tower Eye",
      "Big Spike",
      "Sun Spire"
    ],
    "correct": 1
  },
  {
    "question": "The Sydney 2000 Olympics were primarily held at?",
    "choices": [
      "Bondi",
      "Homebush/Sydney Olympic Park",
      "Manly",
      "The Rocks"
    ],
    "correct": 1
  },
  {
    "question": "Manly is reached from the city by?",
    "choices": [
      "light rail",
      "ferry",
      "monorail",
      "tram"
    ],
    "correct": 1
  },
  {
    "question": "The 'Coathanger' is a nickname for the?",
    "choices": [
      "Opera House",
      "Harbour Bridge",
      "Sydney Tower",
      "Anzac Bridge"
    ],
    "correct": 1
  },
  {
    "question": "Australia's parliament is located in?",
    "choices": [
      "Sydney",
      "Melbourne",
      "Canberra",
      "Brisbane"
    ],
    "correct": 2
  },
  {
    "question": "The Coogee to Bondi route is a famous coastal?",
    "choices": [
      "highway",
      "walk",
      "tunnel",
      "ferry"
    ],
    "correct": 1
  },
  {
    "question": "Taronga Zoo overlooks?",
    "choices": [
      "Botany Bay",
      "Sydney Harbour",
      "Parramatta River",
      "Pacific Ocean"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's New Year fireworks center on the?",
    "choices": [
      "Opera House & Harbour Bridge",
      "Bondi Pavilion",
      "Centennial Park",
      "Royal Botanic Garden"
    ],
    "correct": 0
  },
  {
    "question": "Vegemite is a salty spread made from?",
    "choices": [
      "seaweed",
      "yeast extract",
      "olive paste",
      "anchovy"
    ],
    "correct": 1
  },
  {
    "question": "A 'flat white' coffee is widely claimed to have origins in?",
    "choices": [
      "Italy",
      "Australia/NZ",
      "France",
      "Spain"
    ],
    "correct": 1
  },
  {
    "question": "Lamingtons are sponge cake squares coated in?",
    "choices": [
      "honey & oats",
      "chocolate & coconut",
      "lemon glaze",
      "icing & nuts"
    ],
    "correct": 1
  },
  {
    "question": "A pavlova is a meringue dessert topped with?",
    "choices": [
      "chocolate ganache",
      "whipped cream & fruit",
      "ice cream & nuts",
      "caramel only"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's red-and-yellow flag at beaches marks?",
    "choices": [
      "surfing only",
      "the safe swim zone",
      "fishing area",
      "boat ramp"
    ],
    "correct": 1
  },
  {
    "question": "The Royal Botanic Garden sits next to?",
    "choices": [
      "the Opera House",
      "Bondi",
      "Manly",
      "Olympic Park"
    ],
    "correct": 0
  },
  {
    "question": "Darling Harbour is best known for?",
    "choices": [
      "industrial docks",
      "tourist attractions & SEA LIFE aquarium",
      "container ships only",
      "factories"
    ],
    "correct": 1
  },
  {
    "question": "Surry Hills is famous for?",
    "choices": [
      "mining",
      "cafés & boutiques",
      "ski lifts",
      "shipping"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's Anzac Bridge honors?",
    "choices": [
      "explorers",
      "Australian & NZ soldiers",
      "early settlers",
      "engineers"
    ],
    "correct": 1
  },
  {
    "question": "Hyde Park (Sydney) is the country's?",
    "choices": [
      "largest park",
      "oldest public park",
      "tallest park",
      "newest park"
    ],
    "correct": 1
  },
  {
    "question": "The Sydney Mardi Gras is a parade celebrating?",
    "choices": [
      "Carnival",
      "LGBTQ+ pride",
      "Anzac Day",
      "Federation"
    ],
    "correct": 1
  },
  {
    "question": "Cockatoo Island is a UNESCO site located in?",
    "choices": [
      "Sydney Harbour",
      "Botany Bay",
      "Pittwater",
      "Hawkesbury River"
    ],
    "correct": 0
  },
  {
    "question": "Sydney's famous outdoor pool carved into a cliff is at?",
    "choices": [
      "Manly",
      "Bondi Icebergs",
      "Coogee Pavilion",
      "Bronte Gully"
    ],
    "correct": 1
  },
  {
    "question": "The Indigenous people of the Sydney area are the?",
    "choices": [
      "Yolŋu",
      "Eora/Gadigal",
      "Noongar",
      "Pitjantjatjara"
    ],
    "correct": 1
  },
  {
    "question": "Sydney's iconic ferries depart from?",
    "choices": [
      "Central Station",
      "Circular Quay",
      "Bondi Junction",
      "Town Hall"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SydneyQuizSettings): SydneyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SydneyQuizState, action: SydneyQuizAction): SydneyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SydneyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
