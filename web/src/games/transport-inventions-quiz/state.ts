import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TransportInventionsQuizSettings { questions: "10" | "20" | "30"; }
export interface TransportInventionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TransportInventionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Steam locomotive pioneer?",
    "choices": [
      "Watt",
      "Stephenson",
      "Trevithick",
      "Fulton"
    ],
    "correct": 1
  },
  {
    "question": "First commercial steamboat by?",
    "choices": [
      "Fulton",
      "Watt",
      "Stephenson",
      "Bell"
    ],
    "correct": 0
  },
  {
    "question": "Wright Brothers first flight at?",
    "choices": [
      "Kitty Hawk",
      "Dayton",
      "Detroit",
      "Pasadena"
    ],
    "correct": 0
  },
  {
    "question": "Year of first powered flight?",
    "choices": [
      "1893",
      "1903",
      "1913",
      "1923"
    ],
    "correct": 1
  },
  {
    "question": "Ford Model T introduced in?",
    "choices": [
      "1898",
      "1908",
      "1918",
      "1928"
    ],
    "correct": 1
  },
  {
    "question": "Diesel engine inventor?",
    "choices": [
      "Otto",
      "Diesel",
      "Benz",
      "Daimler"
    ],
    "correct": 1
  },
  {
    "question": "First gasoline automobile by?",
    "choices": [
      "Ford",
      "Benz",
      "Daimler",
      "Otto"
    ],
    "correct": 1
  },
  {
    "question": "Karl Benz nationality?",
    "choices": [
      "French",
      "German",
      "British",
      "Italian"
    ],
    "correct": 1
  },
  {
    "question": "Pneumatic tire inventor?",
    "choices": [
      "Dunlop",
      "Goodyear",
      "Firestone",
      "Michelin"
    ],
    "correct": 0
  },
  {
    "question": "First commercial jet airliner?",
    "choices": [
      "DC-3",
      "Comet",
      "707",
      "747"
    ],
    "correct": 1
  },
  {
    "question": "Boeing 747 entered service in?",
    "choices": [
      "1960",
      "1970",
      "1980",
      "1990"
    ],
    "correct": 1
  },
  {
    "question": "Concorde first flew in?",
    "choices": [
      "1959",
      "1969",
      "1979",
      "1989"
    ],
    "correct": 1
  },
  {
    "question": "Helicopter pioneer?",
    "choices": [
      "Sikorsky",
      "Wright",
      "Lindbergh",
      "Yeager"
    ],
    "correct": 0
  },
  {
    "question": "First nonstop transatlantic solo flight by?",
    "choices": [
      "Earhart",
      "Lindbergh",
      "Wright",
      "Yeager"
    ],
    "correct": 1
  },
  {
    "question": "Year of Lindbergh's solo flight?",
    "choices": [
      "1917",
      "1927",
      "1937",
      "1947"
    ],
    "correct": 1
  },
  {
    "question": "First subway system opened in?",
    "choices": [
      "New York",
      "London",
      "Paris",
      "Berlin"
    ],
    "correct": 1
  },
  {
    "question": "London Underground opened in?",
    "choices": [
      "1843",
      "1863",
      "1883",
      "1903"
    ],
    "correct": 1
  },
  {
    "question": "Bullet train (Shinkansen) launched in?",
    "choices": [
      "1944",
      "1964",
      "1984",
      "2004"
    ],
    "correct": 1
  },
  {
    "question": "Hovercraft inventor?",
    "choices": [
      "Cockerell",
      "Sikorsky",
      "Whittle",
      "Wright"
    ],
    "correct": 0
  },
  {
    "question": "Jet engine pioneer?",
    "choices": [
      "Whittle",
      "Diesel",
      "Otto",
      "Wright"
    ],
    "correct": 0
  },
  {
    "question": "First electric tram service appeared in?",
    "choices": [
      "1881",
      "1901",
      "1921",
      "1941"
    ],
    "correct": 0
  },
  {
    "question": "Bicycle 'safety' design popularized in?",
    "choices": [
      "1860s",
      "1880s",
      "1900s",
      "1920s"
    ],
    "correct": 1
  },
  {
    "question": "Henry Ford pioneered?",
    "choices": [
      "Steam",
      "Assembly line",
      "Diesel",
      "Jet"
    ],
    "correct": 1
  },
  {
    "question": "Volkswagen Beetle designed by?",
    "choices": [
      "Porsche",
      "Benz",
      "Daimler",
      "Otto"
    ],
    "correct": 0
  },
  {
    "question": "Suez Canal opened in?",
    "choices": [
      "1859",
      "1869",
      "1879",
      "1889"
    ],
    "correct": 1
  },
  {
    "question": "Panama Canal opened in?",
    "choices": [
      "1894",
      "1904",
      "1914",
      "1924"
    ],
    "correct": 2
  },
  {
    "question": "First Mars rover wheel-driven?",
    "choices": [
      "Sojourner",
      "Spirit",
      "Opportunity",
      "Curiosity"
    ],
    "correct": 0
  },
  {
    "question": "Hindenburg disaster year?",
    "choices": [
      "1927",
      "1937",
      "1947",
      "1957"
    ],
    "correct": 1
  },
  {
    "question": "Modern container shipping pioneered by?",
    "choices": [
      "McLean",
      "Onassis",
      "Ford",
      "Edison"
    ],
    "correct": 0
  },
  {
    "question": "First high-speed rail nation?",
    "choices": [
      "USA",
      "France",
      "Japan",
      "Germany"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TransportInventionsQuizSettings): TransportInventionsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TransportInventionsQuizState, action: TransportInventionsQuizAction): TransportInventionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TransportInventionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
