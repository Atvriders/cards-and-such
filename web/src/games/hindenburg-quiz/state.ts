import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HindenburgQuizSettings { questions: "10" | "20" | "30"; }
export interface HindenburgQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HindenburgQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In what year did the Hindenburg crash?",
    "choices": [
      "1935",
      "1936",
      "1937",
      "1938"
    ],
    "correct": 2
  },
  {
    "question": "Where did the Hindenburg crash?",
    "choices": [
      "New Jersey",
      "New York",
      "Pennsylvania",
      "Connecticut"
    ],
    "correct": 0
  },
  {
    "question": "What gas filled the Hindenburg?",
    "choices": [
      "Helium",
      "Hydrogen",
      "Methane",
      "Argon"
    ],
    "correct": 1
  },
  {
    "question": "Hindenburg was a German?",
    "choices": [
      "Plane",
      "Airship",
      "Submarine",
      "Train"
    ],
    "correct": 1
  },
  {
    "question": "Famous radio reporter who covered the crash?",
    "choices": [
      "Edward R. Murrow",
      "Herbert Morrison",
      "Walter Cronkite",
      "Lowell Thomas"
    ],
    "correct": 1
  },
  {
    "question": "His famous line was?",
    "choices": [
      "Oh the humanity!",
      "God save us!",
      "She's burning!",
      "Down she goes!"
    ],
    "correct": 0
  },
  {
    "question": "What date did Hindenburg crash?",
    "choices": [
      "May 4, 1937",
      "May 6, 1937",
      "June 6, 1937",
      "April 6, 1937"
    ],
    "correct": 1
  },
  {
    "question": "How many people died?",
    "choices": [
      "13",
      "26",
      "36",
      "46"
    ],
    "correct": 2
  },
  {
    "question": "Crash site name?",
    "choices": [
      "Lakehurst",
      "Lakeshore",
      "Lakewood",
      "Lakeville"
    ],
    "correct": 0
  },
  {
    "question": "Hindenburg flew between Germany and?",
    "choices": [
      "UK",
      "France",
      "USA",
      "Brazil"
    ],
    "correct": 2
  },
  {
    "question": "Captain on the final flight?",
    "choices": [
      "Hugo Eckener",
      "Max Pruss",
      "Ernst Lehmann",
      "Albert Sammt"
    ],
    "correct": 1
  },
  {
    "question": "Hindenburg's full designation?",
    "choices": [
      "LZ 127",
      "LZ 129",
      "LZ 130",
      "LZ 131"
    ],
    "correct": 1
  },
  {
    "question": "Sister airship?",
    "choices": [
      "Graf Zeppelin",
      "Graf Zeppelin II",
      "Bodensee",
      "Schwaben"
    ],
    "correct": 1
  },
  {
    "question": "Hindenburg was named after?",
    "choices": [
      "A general",
      "A president",
      "A philosopher",
      "A king"
    ],
    "correct": 1
  },
  {
    "question": "Approximate length of Hindenburg?",
    "choices": [
      "100 m",
      "250 m",
      "500 m",
      "800 m"
    ],
    "correct": 1
  },
  {
    "question": "Cause of fire (most accepted theory)?",
    "choices": [
      "Bomb",
      "Static electricity igniting hydrogen",
      "Engine failure",
      "Lightning"
    ],
    "correct": 1
  },
  {
    "question": "How long did the fire last?",
    "choices": [
      "~30 sec",
      "~37 sec",
      "~1 min",
      "~3 min"
    ],
    "correct": 1
  },
  {
    "question": "USA refused to sell Germany?",
    "choices": [
      "Hydrogen",
      "Helium",
      "Coal",
      "Oil"
    ],
    "correct": 1
  },
  {
    "question": "Hindenburg was built by?",
    "choices": [
      "Junkers",
      "Zeppelin",
      "Dornier",
      "Heinkel"
    ],
    "correct": 1
  },
  {
    "question": "After the disaster, airship passenger travel?",
    "choices": [
      "Boomed",
      "Continued normally",
      "Effectively ended",
      "Was nationalized"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HindenburgQuizSettings): HindenburgQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HindenburgQuizState, action: HindenburgQuizAction): HindenburgQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HindenburgQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
