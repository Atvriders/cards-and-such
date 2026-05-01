import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SuperlativeQuizSettings { questions: "8" | "10" | "12"; }
export interface SuperlativeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SuperlativeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Superlative of 'big':",
    "choices": [
      "biggest",
      "more big",
      "bigger",
      "big-est"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'happy':",
    "choices": [
      "happiest",
      "most happy",
      "happier",
      "happyest"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'good':",
    "choices": [
      "best",
      "goodest",
      "most good",
      "better"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'bad':",
    "choices": [
      "worst",
      "baddest",
      "most bad",
      "worse"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'far' (distance):",
    "choices": [
      "farthest",
      "farest",
      "most far",
      "further"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'beautiful':",
    "choices": [
      "most beautiful",
      "beautifulest",
      "beautifullest",
      "more beautiful"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'expensive':",
    "choices": [
      "most expensive",
      "expensivest",
      "more expensive",
      "expensiver"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'fast':",
    "choices": [
      "fastest",
      "most fast",
      "faster",
      "fasterest"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'tall':",
    "choices": [
      "tallest",
      "most tall",
      "taller",
      "tallish"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'thin':",
    "choices": [
      "thinnest",
      "thinest",
      "most thin",
      "thinner"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'hot':",
    "choices": [
      "hottest",
      "hotest",
      "most hot",
      "hotter"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'easy':",
    "choices": [
      "easiest",
      "easyest",
      "most easy",
      "easier"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'little' (size):",
    "choices": [
      "smallest / littlest",
      "more little",
      "less",
      "lesser"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'much/many':",
    "choices": [
      "most",
      "muchest",
      "manyest",
      "more"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'old' (family):",
    "choices": [
      "eldest",
      "olderest",
      "most old",
      "older"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'She is the ___ student in the class.'",
    "choices": [
      "smartest",
      "most smart",
      "most smartest",
      "smarter"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'This is the ___ movie I've seen.'",
    "choices": [
      "most interesting",
      "interestingest",
      "more interesting",
      "most interestingest"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'He is the ___ runner.'",
    "choices": [
      "fastest",
      "most fast",
      "faster",
      "most fastest"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'That was the ___ day of my life.'",
    "choices": [
      "worst",
      "baddest",
      "worsest",
      "most bad"
    ],
    "correct": 0
  },
  {
    "question": "Which is correct? 'Mount Everest is the ___ mountain.'",
    "choices": [
      "highest",
      "most high",
      "higher",
      "most highest"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'careful':",
    "choices": [
      "most careful",
      "carefulest",
      "carefullest",
      "more careful"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'simple':",
    "choices": [
      "simplest",
      "most simple (also acceptable)",
      "simpler",
      "more simple"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'narrow':",
    "choices": [
      "narrowest",
      "most narrow (also OK)",
      "narrower",
      "more narrow"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'clever':",
    "choices": [
      "cleverest / most clever",
      "clevester",
      "clevestest",
      "cleverer"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'busy':",
    "choices": [
      "busiest",
      "busyest",
      "most busy",
      "busier"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'late' (recent):",
    "choices": [
      "latest",
      "most late",
      "later",
      "lattest"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'safe':",
    "choices": [
      "safest",
      "most safe",
      "safer",
      "safely"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'large':",
    "choices": [
      "largest",
      "most large",
      "larger",
      "largely"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'famous':",
    "choices": [
      "most famous",
      "famousest",
      "more famous",
      "famouser"
    ],
    "correct": 0
  },
  {
    "question": "Superlative of 'wise':",
    "choices": [
      "wisest",
      "most wise",
      "wiser",
      "wisely"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SuperlativeQuizSettings): SuperlativeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SuperlativeQuizState, action: SuperlativeQuizAction): SuperlativeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SuperlativeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
