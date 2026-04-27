import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen40sQuizSettings { questions: "10" | "15"; }
export interface Nineteen40sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen40sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What 1941 attack brought the U.S. into WWII?",
    "choices": [
      "Battle of Midway",
      "Pearl Harbor",
      "Iwo Jima",
      "Stalingrad"
    ],
    "correct": 1
  },
  {
    "question": "D-Day landings occurred on which beaches?",
    "choices": [
      "Sicily",
      "Normandy",
      "Anzio",
      "Okinawa"
    ],
    "correct": 1
  },
  {
    "question": "The atomic bomb was dropped on what two Japanese cities?",
    "choices": [
      "Tokyo & Osaka",
      "Hiroshima & Nagasaki",
      "Kyoto & Kobe",
      "Yokohama & Sendai"
    ],
    "correct": 1
  },
  {
    "question": "Who succeeded FDR as U.S. President in 1945?",
    "choices": [
      "Eisenhower",
      "Truman",
      "Wallace",
      "Marshall"
    ],
    "correct": 1
  },
  {
    "question": "The United Nations was founded in what year?",
    "choices": [
      "1942",
      "1945",
      "1948",
      "1950"
    ],
    "correct": 1
  },
  {
    "question": "Anne Frank wrote her diary while hiding in which city?",
    "choices": [
      "Berlin",
      "Vienna",
      "Amsterdam",
      "Warsaw"
    ],
    "correct": 2
  },
  {
    "question": "Casablanca, the iconic film, was released in?",
    "choices": [
      "1939",
      "1942",
      "1945",
      "1948"
    ],
    "correct": 1
  },
  {
    "question": "Operation Overlord refers to which event?",
    "choices": [
      "Battle of Britain",
      "Pearl Harbor attack",
      "D-Day invasion",
      "Atomic bomb"
    ],
    "correct": 2
  },
  {
    "question": "Which baseball player broke the color barrier in 1947?",
    "choices": [
      "Willie Mays",
      "Hank Aaron",
      "Jackie Robinson",
      "Satchel Paige"
    ],
    "correct": 2
  },
  {
    "question": "Bing Crosby's 1942 song 'White Christmas' came from which film?",
    "choices": [
      "White Christmas",
      "Holiday Inn",
      "Christmas in Connecticut",
      "It's a Wonderful Life"
    ],
    "correct": 1
  },
  {
    "question": "The Marshall Plan helped rebuild what region?",
    "choices": [
      "Asia",
      "Europe",
      "Africa",
      "Latin America"
    ],
    "correct": 1
  },
  {
    "question": "Iron Curtain was a phrase coined by?",
    "choices": [
      "Roosevelt",
      "Truman",
      "Churchill",
      "Stalin"
    ],
    "correct": 2
  },
  {
    "question": "Which animated mouse debuted in his first sound cartoon in 1928 but starred in 1940's Fantasia?",
    "choices": [
      "Donald Duck",
      "Mickey Mouse",
      "Tom",
      "Bugs Bunny"
    ],
    "correct": 1
  },
  {
    "question": "The Berlin Airlift took place in?",
    "choices": [
      "1945-46",
      "1947-48",
      "1948-49",
      "1950-51"
    ],
    "correct": 2
  },
  {
    "question": "Which 1949 novel by Orwell warned of totalitarianism?",
    "choices": [
      "Animal Farm",
      "1984",
      "Brave New World",
      "Darkness at Noon"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen40sQuizSettings): Nineteen40sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen40sQuizState, action: Nineteen40sQuizAction): Nineteen40sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen40sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
