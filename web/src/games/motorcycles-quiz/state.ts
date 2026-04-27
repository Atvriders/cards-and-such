import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MotorcyclesQuizSettings { questions: "10" | "20" | "30"; }
export interface MotorcyclesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MotorcyclesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Harley-Davidson founded in?",
    "choices": [
      "Detroit",
      "Milwaukee",
      "Chicago",
      "Pittsburgh"
    ],
    "correct": 1
  },
  {
    "question": "Year Harley founded?",
    "choices": [
      "1903",
      "1910",
      "1915",
      "1920"
    ],
    "correct": 0
  },
  {
    "question": "Ducati nationality?",
    "choices": [
      "German",
      "Italian",
      "Spanish",
      "French"
    ],
    "correct": 1
  },
  {
    "question": "Kawasaki nationality?",
    "choices": [
      "Korean",
      "Japanese",
      "Chinese",
      "Taiwanese"
    ],
    "correct": 1
  },
  {
    "question": "Honda Goldwing is a?",
    "choices": [
      "Sportbike",
      "Touring bike",
      "Cruiser",
      "Dirtbike"
    ],
    "correct": 1
  },
  {
    "question": "Vincent Black Shadow was famous for?",
    "choices": [
      "Speed",
      "Beauty",
      "Ruggedness",
      "Stunt riding"
    ],
    "correct": 0
  },
  {
    "question": "Triumph nationality?",
    "choices": [
      "British",
      "German",
      "Italian",
      "American"
    ],
    "correct": 0
  },
  {
    "question": "BSA stands for?",
    "choices": [
      "Birmingham Small Arms",
      "British Sports Association",
      "Bavarian Speed Auto",
      "Belgian Standard Atelier"
    ],
    "correct": 0
  },
  {
    "question": "First motorcycle invented by?",
    "choices": [
      "Daimler",
      "Benz",
      "Honda",
      "Indian"
    ],
    "correct": 0
  },
  {
    "question": "Year of first motorcycle?",
    "choices": [
      "1867",
      "1885",
      "1900",
      "1920"
    ],
    "correct": 1
  },
  {
    "question": "Indian Motorcycles started in?",
    "choices": [
      "1901",
      "1910",
      "1920",
      "1930"
    ],
    "correct": 0
  },
  {
    "question": "Yamaha originally made?",
    "choices": [
      "Bikes",
      "Pianos",
      "Cars",
      "Phones"
    ],
    "correct": 1
  },
  {
    "question": "Suzuki Hayabusa is named after?",
    "choices": [
      "Falcon",
      "Eagle",
      "Hawk",
      "Owl"
    ],
    "correct": 0
  },
  {
    "question": "Vespa nationality?",
    "choices": [
      "Italian",
      "Spanish",
      "Greek",
      "French"
    ],
    "correct": 0
  },
  {
    "question": "MotoGP top class displacement?",
    "choices": [
      "500cc",
      "750cc",
      "1000cc",
      "1200cc"
    ],
    "correct": 2
  },
  {
    "question": "Most-titled MotoGP rider?",
    "choices": [
      "Rossi",
      "Marquez",
      "Doohan",
      "Hailwood"
    ],
    "correct": 0
  },
  {
    "question": "Valentino Rossi nationality?",
    "choices": [
      "Italian",
      "Spanish",
      "American",
      "British"
    ],
    "correct": 0
  },
  {
    "question": "Marc Marquez nationality?",
    "choices": [
      "Italian",
      "Spanish",
      "Portuguese",
      "French"
    ],
    "correct": 1
  },
  {
    "question": "Isle of Man TT held since?",
    "choices": [
      "1907",
      "1920",
      "1947",
      "1955"
    ],
    "correct": 0
  },
  {
    "question": "Royal Enfield is now made in?",
    "choices": [
      "UK",
      "USA",
      "India",
      "Japan"
    ],
    "correct": 2
  },
  {
    "question": "BMW R series are?",
    "choices": [
      "Boxer twins",
      "Inline 4",
      "V-twin",
      "Single"
    ],
    "correct": 0
  },
  {
    "question": "Cafe racer style emerged in?",
    "choices": [
      "UK 1950s-60s",
      "US 1960s",
      "Italy 1970s",
      "Japan 1980s"
    ],
    "correct": 0
  },
  {
    "question": "Chopper style associated with?",
    "choices": [
      "UK",
      "Japan",
      "USA",
      "Germany"
    ],
    "correct": 2
  },
  {
    "question": "Easy Rider movie year?",
    "choices": [
      "1969",
      "1972",
      "1975",
      "1980"
    ],
    "correct": 0
  },
  {
    "question": "Ducati's signature engine?",
    "choices": [
      "V-twin (L-twin)",
      "Boxer",
      "Inline 4",
      "Single"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MotorcyclesQuizSettings): MotorcyclesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MotorcyclesQuizState, action: MotorcyclesQuizAction): MotorcyclesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MotorcyclesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
