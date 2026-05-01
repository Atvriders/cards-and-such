import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ClicheQuizSettings { questions: "8" | "10" | "12"; }
export interface ClicheQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ClicheQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Complete: 'At the end of the ___'",
    "choices": [
      "day",
      "rope",
      "line",
      "tunnel"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Think outside the ___'",
    "choices": [
      "box",
      "wall",
      "page",
      "frame"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Low-hanging ___'",
    "choices": [
      "fruit",
      "branch",
      "cloud",
      "tree"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Move the ___'",
    "choices": [
      "needle",
      "goalpost",
      "chess piece",
      "marker"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Hit the ground ___'",
    "choices": [
      "running",
      "walking",
      "moving",
      "rolling"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'A perfect ___'",
    "choices": [
      "storm",
      "mess",
      "circle",
      "dawn"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Avoid like the ___'",
    "choices": [
      "plague",
      "flu",
      "rain",
      "devil"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Read between the ___'",
    "choices": [
      "lines",
      "pages",
      "words",
      "chapters"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Time will ___'",
    "choices": [
      "tell",
      "heal",
      "pass",
      "march"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Only time will ___'",
    "choices": [
      "tell",
      "show",
      "say",
      "know"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'A blessing in ___'",
    "choices": [
      "disguise",
      "hiding",
      "secret",
      "wait"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'It is what it ___'",
    "choices": [
      "is",
      "was",
      "seems",
      "becomes"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Every cloud has a silver ___'",
    "choices": [
      "lining",
      "edge",
      "frame",
      "shadow"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'When life gives you ___'",
    "choices": [
      "lemons",
      "apples",
      "trouble",
      "rain"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Last but not ___'",
    "choices": [
      "least",
      "lost",
      "low",
      "loud"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'In the nick of ___'",
    "choices": [
      "time",
      "fate",
      "luck",
      "moment"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Easier said than ___'",
    "choices": [
      "done",
      "made",
      "tried",
      "told"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'A penny for your ___'",
    "choices": [
      "thoughts",
      "trouble",
      "secrets",
      "wisdom"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Better late than ___'",
    "choices": [
      "never",
      "early",
      "sorry",
      "missed"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Don't count your chickens before they ___'",
    "choices": [
      "hatch",
      "lay",
      "crow",
      "fly"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'The early bird catches the ___'",
    "choices": [
      "worm",
      "sun",
      "dew",
      "prize"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Actions speak louder than ___'",
    "choices": [
      "words",
      "thoughts",
      "promises",
      "noise"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Don't judge a book by its ___'",
    "choices": [
      "cover",
      "title",
      "weight",
      "author"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'When in Rome, do as the Romans ___'",
    "choices": [
      "do",
      "say",
      "live",
      "eat"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Beauty is in the eye of the ___'",
    "choices": [
      "beholder",
      "lover",
      "artist",
      "stranger"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'A picture is worth a thousand ___'",
    "choices": [
      "words",
      "stories",
      "memories",
      "moments"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'There's no place like ___'",
    "choices": [
      "home",
      "Kansas",
      "here",
      "Earth"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'Birds of a feather flock ___'",
    "choices": [
      "together",
      "south",
      "high",
      "fast"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'The grass is always greener on the ___'",
    "choices": [
      "other side",
      "hill",
      "lawn",
      "horizon"
    ],
    "correct": 0
  },
  {
    "question": "Complete: 'You can't have your cake and ___ it too'",
    "choices": [
      "eat",
      "save",
      "give",
      "hide"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ClicheQuizSettings): ClicheQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ClicheQuizState, action: ClicheQuizAction): ClicheQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ClicheQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
