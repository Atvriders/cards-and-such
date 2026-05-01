import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ContractionQuizSettings { questions: "8" | "10" | "12"; }
export interface ContractionQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ContractionQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'do not' contracts to:",
    "choices": [
      "don't",
      "dont",
      "do'nt",
      "do'not"
    ],
    "correct": 0
  },
  {
    "question": "'will not' contracts to:",
    "choices": [
      "won't",
      "willn't",
      "will'nt",
      "wont"
    ],
    "correct": 0
  },
  {
    "question": "'cannot' contracts to:",
    "choices": [
      "can't",
      "cann't",
      "ca'nt",
      "can'ot"
    ],
    "correct": 0
  },
  {
    "question": "'I am' contracts to:",
    "choices": [
      "I'm",
      "Im",
      "I'am",
      "I'me"
    ],
    "correct": 0
  },
  {
    "question": "'you are' contracts to:",
    "choices": [
      "you're",
      "youre",
      "your're",
      "you'are"
    ],
    "correct": 0
  },
  {
    "question": "'they are' contracts to:",
    "choices": [
      "they're",
      "theyre",
      "they'r",
      "their're"
    ],
    "correct": 0
  },
  {
    "question": "'we are' contracts to:",
    "choices": [
      "we're",
      "were",
      "we'are",
      "wer'e"
    ],
    "correct": 0
  },
  {
    "question": "'it is' contracts to:",
    "choices": [
      "it's",
      "its",
      "it'is",
      "its'"
    ],
    "correct": 0
  },
  {
    "question": "'he is' contracts to:",
    "choices": [
      "he's",
      "hes",
      "he'is",
      "h'es"
    ],
    "correct": 0
  },
  {
    "question": "'she is' contracts to:",
    "choices": [
      "she's",
      "shes",
      "she'is",
      "sh'es"
    ],
    "correct": 0
  },
  {
    "question": "'I have' contracts to:",
    "choices": [
      "I've",
      "Iv'e",
      "Ihave",
      "I'av"
    ],
    "correct": 0
  },
  {
    "question": "'they have' contracts to:",
    "choices": [
      "they've",
      "theyv'e",
      "theyhave",
      "they'av"
    ],
    "correct": 0
  },
  {
    "question": "'I will' contracts to:",
    "choices": [
      "I'll",
      "Ill",
      "I'wll",
      "Iwill"
    ],
    "correct": 0
  },
  {
    "question": "'he will' contracts to:",
    "choices": [
      "he'll",
      "hell",
      "he'wll",
      "hewill"
    ],
    "correct": 0
  },
  {
    "question": "'is not' contracts to:",
    "choices": [
      "isn't",
      "is'nt",
      "isnt",
      "i'snt"
    ],
    "correct": 0
  },
  {
    "question": "'are not' contracts to:",
    "choices": [
      "aren't",
      "are'nt",
      "arent",
      "aren'ot"
    ],
    "correct": 0
  },
  {
    "question": "'was not' contracts to:",
    "choices": [
      "wasn't",
      "was'nt",
      "wasnt",
      "was'not"
    ],
    "correct": 0
  },
  {
    "question": "'were not' contracts to:",
    "choices": [
      "weren't",
      "were'nt",
      "werent",
      "were'not"
    ],
    "correct": 0
  },
  {
    "question": "'has not' contracts to:",
    "choices": [
      "hasn't",
      "has'nt",
      "hasnt",
      "has'not"
    ],
    "correct": 0
  },
  {
    "question": "'have not' contracts to:",
    "choices": [
      "haven't",
      "have'nt",
      "havent",
      "have'not"
    ],
    "correct": 0
  },
  {
    "question": "'had not' contracts to:",
    "choices": [
      "hadn't",
      "had'nt",
      "hadnt",
      "had'not"
    ],
    "correct": 0
  },
  {
    "question": "'should not' contracts to:",
    "choices": [
      "shouldn't",
      "should'nt",
      "shouldnt",
      "should'not"
    ],
    "correct": 0
  },
  {
    "question": "'would not' contracts to:",
    "choices": [
      "wouldn't",
      "would'nt",
      "wouldnt",
      "would'not"
    ],
    "correct": 0
  },
  {
    "question": "'could not' contracts to:",
    "choices": [
      "couldn't",
      "could'nt",
      "couldnt",
      "could'not"
    ],
    "correct": 0
  },
  {
    "question": "'I would' contracts to:",
    "choices": [
      "I'd",
      "Id",
      "I'wd",
      "Iwould"
    ],
    "correct": 0
  },
  {
    "question": "'I had' contracts to:",
    "choices": [
      "I'd",
      "Id",
      "I'hd",
      "Ihad"
    ],
    "correct": 0
  },
  {
    "question": "'let us' contracts to:",
    "choices": [
      "let's",
      "lets",
      "let'us",
      "le't us"
    ],
    "correct": 0
  },
  {
    "question": "'who is' contracts to:",
    "choices": [
      "who's",
      "whos",
      "who'is",
      "whois"
    ],
    "correct": 0
  },
  {
    "question": "'that is' contracts to:",
    "choices": [
      "that's",
      "thats",
      "that'is",
      "tha'ts"
    ],
    "correct": 0
  },
  {
    "question": "'there is' contracts to:",
    "choices": [
      "there's",
      "theres",
      "there'is",
      "ther'es"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ContractionQuizSettings): ContractionQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ContractionQuizState, action: ContractionQuizAction): ContractionQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ContractionQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
