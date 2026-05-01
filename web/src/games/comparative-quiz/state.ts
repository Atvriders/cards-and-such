import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComparativeQuizSettings { questions: "8" | "10" | "12"; }
export interface ComparativeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComparativeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Comparative of 'big':",
    "choices": [
      "bigger",
      "more big",
      "biggest",
      "big-er"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'happy':",
    "choices": [
      "happier",
      "more happy",
      "happiest",
      "happyer"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'good':",
    "choices": [
      "better",
      "gooder",
      "more good",
      "best"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'bad':",
    "choices": [
      "worse",
      "badder",
      "more bad",
      "worst"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'far':",
    "choices": [
      "farther",
      "farer",
      "more far",
      "farthest"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'beautiful':",
    "choices": [
      "more beautiful",
      "beautifuler",
      "beautifuller",
      "most beautiful"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'expensive':",
    "choices": [
      "more expensive",
      "expensiver",
      "expensivest",
      "most expensive"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'fast':",
    "choices": [
      "faster",
      "more fast",
      "fastest",
      "fasterer"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'tall':",
    "choices": [
      "taller",
      "more tall",
      "tallest",
      "tallish"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'thin':",
    "choices": [
      "thinner",
      "thiner",
      "more thin",
      "thinnest"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'hot':",
    "choices": [
      "hotter",
      "hoter",
      "more hot",
      "hottest"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'easy':",
    "choices": [
      "easier",
      "easyer",
      "more easy",
      "easiest"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'little' (size):",
    "choices": [
      "smaller / littler",
      "littlest",
      "more little",
      "least"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'much/many':",
    "choices": [
      "more",
      "mucher",
      "manyer",
      "most"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'old' (general):",
    "choices": [
      "older",
      "elder only",
      "more old",
      "oldest"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'She is ___ than her sister.'",
    "choices": [
      "taller",
      "more tall",
      "more taller",
      "tallest"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'This book is ___ than that one.'",
    "choices": [
      "more interesting",
      "interestinger",
      "most interesting",
      "more interestinger"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'He runs ___ than me.'",
    "choices": [
      "faster",
      "more fast",
      "fastest",
      "more faster"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'My grade was ___ than yours.'",
    "choices": [
      "worse",
      "badder",
      "worser",
      "baddest"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'Today is ___ than yesterday.'",
    "choices": [
      "hotter",
      "more hot",
      "hottest",
      "more hotter"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'careful':",
    "choices": [
      "more careful",
      "carefuler",
      "carefullest",
      "carefully"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'simple':",
    "choices": [
      "simpler",
      "more simple (also acceptable)",
      "simplest",
      "simply"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'narrow':",
    "choices": [
      "narrower",
      "more narrow",
      "narrowest",
      "narrowly"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'clever':",
    "choices": [
      "cleverer / more clever",
      "clevester",
      "clevest",
      "cleverly"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'busy':",
    "choices": [
      "busier",
      "busyer",
      "more busy",
      "busiest"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'late' (time):",
    "choices": [
      "later",
      "latest",
      "more late",
      "latter"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'safe':",
    "choices": [
      "safer",
      "more safe",
      "safest",
      "safely"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'large':",
    "choices": [
      "larger",
      "more large",
      "largest",
      "largely"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'famous':",
    "choices": [
      "more famous",
      "famouser",
      "famousest",
      "famously"
    ],
    "correct": 0
  },
  {
    "question": "Comparative of 'wise':",
    "choices": [
      "wiser",
      "more wise",
      "wisest",
      "wisely"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ComparativeQuizSettings): ComparativeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ComparativeQuizState, action: ComparativeQuizAction): ComparativeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ComparativeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
