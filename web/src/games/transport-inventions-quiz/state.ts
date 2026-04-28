import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TransportInventionsQuizSettings { questions: "10" | "20" | "30"; }
export interface TransportInventionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TransportInventionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First powered airplane flight by?",
    "choices": [
      "Curtiss",
      "Wright Brothers",
      "Lindbergh",
      "Earhart"
    ],
    "correct": 1
  },
  {
    "question": "Year of first Wright flight?",
    "choices": [
      "1903",
      "1910",
      "1920",
      "1899"
    ],
    "correct": 0
  },
  {
    "question": "Ford Model T started in?",
    "choices": [
      "1900",
      "1908",
      "1920",
      "1925"
    ],
    "correct": 1
  },
  {
    "question": "Steam engine pioneer for transport?",
    "choices": [
      "Watt and Stephenson",
      "Edison",
      "Tesla",
      "Bell"
    ],
    "correct": 0
  },
  {
    "question": "Diesel engine inventor?",
    "choices": [
      "Otto",
      "Diesel",
      "Maybach",
      "Daimler"
    ],
    "correct": 1
  },
  {
    "question": "First commercial jetliner?",
    "choices": [
      "707",
      "Comet",
      "DC-3",
      "Concorde"
    ],
    "correct": 1
  },
  {
    "question": "Hot-air balloon pioneers?",
    "choices": [
      "Wright Brothers",
      "Montgolfier Brothers",
      "Lilienthal",
      "Zeppelin"
    ],
    "correct": 1
  },
  {
    "question": "Submarine widely used in WWI by?",
    "choices": [
      "French only",
      "Germans (U-boats)",
      "British only",
      "Italians"
    ],
    "correct": 1
  },
  {
    "question": "First mass-produced electric car (modern)?",
    "choices": [
      "Tesla Roadster (2008)",
      "Nissan Leaf 2010",
      "GM EV1 1996",
      "Ford Focus EV 2011"
    ],
    "correct": 0
  },
  {
    "question": "Helicopter (practical) developed by?",
    "choices": [
      "Sikorsky",
      "Wright",
      "Lindbergh",
      "Curtiss"
    ],
    "correct": 0
  },
  {
    "question": "First gas-powered automobile?",
    "choices": [
      "Benz Patent-Motorwagen (1885-86)",
      "Ford Model T",
      "Stanley Steamer",
      "Cadillac"
    ],
    "correct": 0
  },
  {
    "question": "Suez Canal opened?",
    "choices": [
      "1830",
      "1869",
      "1900",
      "1914"
    ],
    "correct": 1
  },
  {
    "question": "Bicycle's safety design (chain drive)?",
    "choices": [
      "1820s",
      "1880s",
      "1900s",
      "1950s"
    ],
    "correct": 1
  },
  {
    "question": "First motor scooter marketed widely?",
    "choices": [
      "Vespa (1946)",
      "Honda Cub",
      "Lambretta 1900",
      "Harley 1903"
    ],
    "correct": 0
  },
  {
    "question": "Maglev trains use?",
    "choices": [
      "Wheels and rails",
      "Magnetic levitation",
      "Hovercraft",
      "Steam"
    ],
    "correct": 1
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
