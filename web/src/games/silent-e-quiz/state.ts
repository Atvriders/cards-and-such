import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SilentEQuizSettings { questions: "8" | "10" | "12"; }
export interface SilentEQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SilentEQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Adding silent 'e' to 'cap' gives:",
    "choices": [
      "cape",
      "caep",
      "cappe",
      "caap"
    ],
    "correct": 0
  },
  {
    "question": "Adding silent 'e' to 'kit' gives:",
    "choices": [
      "kite",
      "kitee",
      "kiet",
      "kkite"
    ],
    "correct": 0
  },
  {
    "question": "Adding silent 'e' to 'hop' gives:",
    "choices": [
      "hope",
      "hoop",
      "hoppe",
      "hoap"
    ],
    "correct": 0
  },
  {
    "question": "Adding silent 'e' to 'rid' gives:",
    "choices": [
      "ride",
      "riid",
      "rdie",
      "ridd"
    ],
    "correct": 0
  },
  {
    "question": "Adding silent 'e' to 'tub' gives:",
    "choices": [
      "tube",
      "tuub",
      "tibe",
      "tbeu"
    ],
    "correct": 0
  },
  {
    "question": "Silent 'e' typically makes the preceding vowel:",
    "choices": [
      "long",
      "short",
      "silent",
      "doubled"
    ],
    "correct": 0
  },
  {
    "question": "Which word has a silent 'e' that lengthens a vowel?",
    "choices": [
      "bake",
      "bag",
      "bat",
      "back"
    ],
    "correct": 0
  },
  {
    "question": "Which word follows the silent-e rule?",
    "choices": [
      "cute",
      "cut",
      "cup",
      "cub"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'pin'?",
    "choices": [
      "pine",
      "pinee",
      "ppin",
      "piine"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'cod'?",
    "choices": [
      "code",
      "cood",
      "codde",
      "ccode"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'tap'?",
    "choices": [
      "tape",
      "taap",
      "ttape",
      "tapp"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'hat'?",
    "choices": [
      "hate",
      "haat",
      "hattt",
      "hatte"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'mad'?",
    "choices": [
      "made",
      "maad",
      "madde",
      "mmade"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'fin'?",
    "choices": [
      "fine",
      "fiin",
      "finne",
      "ffine"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'rob'?",
    "choices": [
      "robe",
      "roob",
      "robbe",
      "rrobe"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'cub'?",
    "choices": [
      "cube",
      "cuub",
      "cubbe",
      "ccube"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'plan'?",
    "choices": [
      "plane",
      "plaan",
      "planne",
      "pplane"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'slid'?",
    "choices": [
      "slide",
      "sliid",
      "sllide",
      "sliddee"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'not'?",
    "choices": [
      "note",
      "noot",
      "nottt",
      "nnote"
    ],
    "correct": 0
  },
  {
    "question": "Which is the silent-e form of 'cut'?",
    "choices": [
      "cute",
      "cuut",
      "cuttt",
      "ccute"
    ],
    "correct": 0
  },
  {
    "question": "In 'home', the 'e' is:",
    "choices": [
      "silent",
      "long e",
      "schwa",
      "stressed"
    ],
    "correct": 0
  },
  {
    "question": "In 'time', the 'e' is:",
    "choices": [
      "silent",
      "long",
      "stressed",
      "voiced"
    ],
    "correct": 0
  },
  {
    "question": "In 'cake', the 'a' is:",
    "choices": [
      "long (because of silent e)",
      "short",
      "silent",
      "schwa"
    ],
    "correct": 0
  },
  {
    "question": "In 'rope', the 'o' is:",
    "choices": [
      "long",
      "short",
      "silent",
      "schwa"
    ],
    "correct": 0
  },
  {
    "question": "In 'use', the 'u' is:",
    "choices": [
      "long",
      "short",
      "silent",
      "schwa"
    ],
    "correct": 0
  },
  {
    "question": "In 'face', the 'a' sounds:",
    "choices": [
      "long",
      "short",
      "silent",
      "nasal"
    ],
    "correct": 0
  },
  {
    "question": "In 'mile', the 'i' sounds:",
    "choices": [
      "long",
      "short",
      "silent",
      "schwa"
    ],
    "correct": 0
  },
  {
    "question": "In 'these', the 'e' sounds:",
    "choices": [
      "long e",
      "short",
      "silent both",
      "schwa"
    ],
    "correct": 0
  },
  {
    "question": "Which word is NOT a silent-e word?",
    "choices": [
      "bench",
      "bake",
      "kite",
      "tube"
    ],
    "correct": 0
  },
  {
    "question": "Which pair shows the silent-e rule?",
    "choices": [
      "mat / mate",
      "cat / cats",
      "run / running",
      "big / bigger"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SilentEQuizSettings): SilentEQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SilentEQuizState, action: SilentEQuizAction): SilentEQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SilentEQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
