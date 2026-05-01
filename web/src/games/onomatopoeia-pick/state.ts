import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OnomatopoeiaPickSettings { questions: "8" | "10" | "12"; }
export interface OnomatopoeiaPickState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OnomatopoeiaPickAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Sound of a cat?",
    "choices": [
      "meow",
      "table",
      "house",
      "run"
    ],
    "correct": 0
  },
  {
    "question": "Bee sound?",
    "choices": [
      "sit",
      "buzz",
      "jump",
      "rock"
    ],
    "correct": 1
  },
  {
    "question": "Bell sound?",
    "choices": [
      "green",
      "ding",
      "yellow",
      "tree"
    ],
    "correct": 1
  },
  {
    "question": "Drum sound?",
    "choices": [
      "read",
      "bang",
      "study",
      "sleep"
    ],
    "correct": 1
  },
  {
    "question": "Snake sound?",
    "choices": [
      "hiss",
      "sing",
      "glow",
      "bake"
    ],
    "correct": 0
  },
  {
    "question": "Splash word \u2014 onomatopoeia?",
    "choices": [
      "splash",
      "walked",
      "white",
      "tall"
    ],
    "correct": 0
  },
  {
    "question": "Chicken sound?",
    "choices": [
      "bark",
      "cluck",
      "roar",
      "oink"
    ],
    "correct": 1
  },
  {
    "question": "Cow sound?",
    "choices": [
      "meow",
      "quack",
      "moo",
      "cluck"
    ],
    "correct": 2
  },
  {
    "question": "Frog sound?",
    "choices": [
      "ribbit",
      "chirp",
      "oink",
      "baa"
    ],
    "correct": 0
  },
  {
    "question": "Pig sound?",
    "choices": [
      "meow",
      "baa",
      "oink",
      "cluck"
    ],
    "correct": 2
  },
  {
    "question": "Dog sound?",
    "choices": [
      "bark",
      "tree",
      "table",
      "chair"
    ],
    "correct": 0
  },
  {
    "question": "Duck sound?",
    "choices": [
      "meow",
      "quack",
      "neigh",
      "baa"
    ],
    "correct": 1
  },
  {
    "question": "Sheep sound?",
    "choices": [
      "moo",
      "oink",
      "baa",
      "buzz"
    ],
    "correct": 2
  },
  {
    "question": "Horse sound?",
    "choices": [
      "neigh",
      "purr",
      "roar",
      "tweet"
    ],
    "correct": 0
  },
  {
    "question": "Lion sound?",
    "choices": [
      "squeak",
      "roar",
      "chirp",
      "hoot"
    ],
    "correct": 1
  },
  {
    "question": "Mouse sound?",
    "choices": [
      "squeak",
      "moo",
      "growl",
      "bark"
    ],
    "correct": 0
  },
  {
    "question": "Owl sound?",
    "choices": [
      "hoot",
      "buzz",
      "moo",
      "purr"
    ],
    "correct": 0
  },
  {
    "question": "Bird sound?",
    "choices": [
      "tweet",
      "growl",
      "oink",
      "moo"
    ],
    "correct": 0
  },
  {
    "question": "Clock sound?",
    "choices": [
      "tick",
      "table",
      "chair",
      "house"
    ],
    "correct": 0
  },
  {
    "question": "Heart sound?",
    "choices": [
      "thump",
      "study",
      "read",
      "sleep"
    ],
    "correct": 0
  },
  {
    "question": "Fire sound?",
    "choices": [
      "crackle",
      "table",
      "house",
      "tall"
    ],
    "correct": 0
  },
  {
    "question": "Water drip sound?",
    "choices": [
      "plop",
      "tall",
      "wide",
      "green"
    ],
    "correct": 0
  },
  {
    "question": "Glass breaking sound?",
    "choices": [
      "smash",
      "tree",
      "house",
      "blue"
    ],
    "correct": 0
  },
  {
    "question": "Whip sound?",
    "choices": [
      "crack",
      "study",
      "tall",
      "soft"
    ],
    "correct": 0
  },
  {
    "question": "Sneeze sound?",
    "choices": [
      "achoo",
      "table",
      "blue",
      "jump"
    ],
    "correct": 0
  },
  {
    "question": "Cough sound?",
    "choices": [
      "ahem",
      "study",
      "house",
      "tree"
    ],
    "correct": 0
  },
  {
    "question": "Knock on door sound?",
    "choices": [
      "rap",
      "tall",
      "blue",
      "soft"
    ],
    "correct": 0
  },
  {
    "question": "Cat purr sound?",
    "choices": [
      "purr",
      "tall",
      "house",
      "read"
    ],
    "correct": 0
  },
  {
    "question": "Wind sound?",
    "choices": [
      "whoosh",
      "tall",
      "blue",
      "soft"
    ],
    "correct": 0
  },
  {
    "question": "Explosion sound?",
    "choices": [
      "boom",
      "tree",
      "study",
      "tall"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OnomatopoeiaPickSettings): OnomatopoeiaPickState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OnomatopoeiaPickState, action: OnomatopoeiaPickAction): OnomatopoeiaPickState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OnomatopoeiaPickState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
