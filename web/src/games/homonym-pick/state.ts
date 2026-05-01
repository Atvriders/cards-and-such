import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HomonymPickSettings { questions: "8" | "10" | "12"; }
export interface HomonymPickState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HomonymPickAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "BARK \u2014 homonym pair?",
    "choices": [
      "bark of dog / bark of tree",
      "bark of cat / leaf",
      "running / jumping",
      "car / truck"
    ],
    "correct": 0
  },
  {
    "question": "BAT \u2014 pair?",
    "choices": [
      "winged mammal / cricket bat",
      "drum / song",
      "cat / dog",
      "car / boat"
    ],
    "correct": 0
  },
  {
    "question": "LIGHT \u2014 pair?",
    "choices": [
      "weight / illumination",
      "color / sound",
      "heat / cold",
      "up / down"
    ],
    "correct": 0
  },
  {
    "question": "PEN \u2014 pair?",
    "choices": [
      "writing tool / animal enclosure",
      "cat / dog",
      "car / truck",
      "up / down"
    ],
    "correct": 0
  },
  {
    "question": "SPRING \u2014 pair?",
    "choices": [
      "coil / season",
      "summer / fall",
      "rain / sun",
      "cat / mouse"
    ],
    "correct": 0
  },
  {
    "question": "RING \u2014 pair?",
    "choices": [
      "jewelry / sound",
      "cat / dog",
      "red / blue",
      "up / down"
    ],
    "correct": 0
  },
  {
    "question": "FAIR \u2014 pair?",
    "choices": [
      "just / festival",
      "cat / dog",
      "run / jump",
      "loud / quiet"
    ],
    "correct": 0
  },
  {
    "question": "LEFT \u2014 pair?",
    "choices": [
      "direction / departed",
      "up / down",
      "cat / dog",
      "red / blue"
    ],
    "correct": 0
  },
  {
    "question": "TIRE \u2014 pair?",
    "choices": [
      "rubber wheel / fatigue",
      "cat / dog",
      "red / blue",
      "up / down"
    ],
    "correct": 0
  },
  {
    "question": "WAVE \u2014 pair?",
    "choices": [
      "water swell / hand gesture",
      "cat / dog",
      "red / blue",
      "up / down"
    ],
    "correct": 0
  },
  {
    "question": "MATCH \u2014 pair?",
    "choices": [
      "fire stick / contest",
      "cat / dog",
      "red / blue",
      "loud / soft"
    ],
    "correct": 0
  },
  {
    "question": "PARK \u2014 pair?",
    "choices": [
      "green space / to stop a car",
      "cat / dog",
      "run / walk",
      "hot / cold"
    ],
    "correct": 0
  },
  {
    "question": "BANK \u2014 pair?",
    "choices": [
      "money place / river edge",
      "cat / dog",
      "tall / short",
      "open / shut"
    ],
    "correct": 0
  },
  {
    "question": "ROCK \u2014 pair?",
    "choices": [
      "stone / sway gently",
      "cat / dog",
      "fast / slow",
      "loud / quiet"
    ],
    "correct": 0
  },
  {
    "question": "CLUB \u2014 pair?",
    "choices": [
      "heavy stick / group of people",
      "cat / dog",
      "red / green",
      "up / down"
    ],
    "correct": 0
  },
  {
    "question": "FILE \u2014 pair?",
    "choices": [
      "folder / nail tool",
      "cat / dog",
      "tall / short",
      "wet / dry"
    ],
    "correct": 0
  },
  {
    "question": "MEAN \u2014 pair?",
    "choices": [
      "unkind / average",
      "cat / dog",
      "fast / slow",
      "red / blue"
    ],
    "correct": 0
  },
  {
    "question": "BOW \u2014 pair?",
    "choices": [
      "weapon / bend forward",
      "cat / dog",
      "wet / dry",
      "tall / short"
    ],
    "correct": 0
  },
  {
    "question": "DUCK \u2014 pair?",
    "choices": [
      "bird / lower head",
      "cat / dog",
      "hot / cold",
      "up / down"
    ],
    "correct": 0
  },
  {
    "question": "JAM \u2014 pair?",
    "choices": [
      "fruit spread / traffic snarl",
      "cat / dog",
      "red / blue",
      "fast / slow"
    ],
    "correct": 0
  },
  {
    "question": "KIND \u2014 pair?",
    "choices": [
      "caring / type",
      "cat / dog",
      "wet / dry",
      "loud / soft"
    ],
    "correct": 0
  },
  {
    "question": "LEAVES \u2014 pair?",
    "choices": [
      "foliage / departs",
      "cat / dog",
      "tall / short",
      "red / blue"
    ],
    "correct": 0
  },
  {
    "question": "LIE \u2014 pair?",
    "choices": [
      "recline / falsehood",
      "cat / dog",
      "loud / quiet",
      "tall / short"
    ],
    "correct": 0
  },
  {
    "question": "MINE \u2014 pair?",
    "choices": [
      "belongs to me / dig site",
      "cat / dog",
      "fast / slow",
      "red / blue"
    ],
    "correct": 0
  },
  {
    "question": "POUND \u2014 pair?",
    "choices": [
      "weight / strike heavily",
      "cat / dog",
      "wet / dry",
      "tall / short"
    ],
    "correct": 0
  },
  {
    "question": "ROSE \u2014 pair?",
    "choices": [
      "flower / stood up",
      "cat / dog",
      "red / blue",
      "hot / cold"
    ],
    "correct": 0
  },
  {
    "question": "SAW \u2014 pair?",
    "choices": [
      "cutting tool / past tense of see",
      "cat / dog",
      "loud / quiet",
      "tall / short"
    ],
    "correct": 0
  },
  {
    "question": "SEAL \u2014 pair?",
    "choices": [
      "sea animal / close tightly",
      "cat / dog",
      "fast / slow",
      "wet / dry"
    ],
    "correct": 0
  },
  {
    "question": "TRUNK \u2014 pair?",
    "choices": [
      "tree base / car storage",
      "cat / dog",
      "tall / short",
      "red / blue"
    ],
    "correct": 0
  },
  {
    "question": "WELL \u2014 pair?",
    "choices": [
      "water hole / in good health",
      "cat / dog",
      "loud / quiet",
      "wet / dry"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HomonymPickSettings): HomonymPickState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HomonymPickState, action: HomonymPickAction): HomonymPickState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HomonymPickState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
