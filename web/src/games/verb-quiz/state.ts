import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VerbQuizSettings { questions: "8" | "10" | "12"; }
export interface VerbQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VerbQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which is a verb?",
    "choices": [
      "dog",
      "run",
      "blue",
      "mountain"
    ],
    "correct": 1
  },
  {
    "question": "Past of 'go'?",
    "choices": [
      "goed",
      "gone",
      "went",
      "going"
    ],
    "correct": 2
  },
  {
    "question": "Past of 'eat'?",
    "choices": [
      "eated",
      "ate",
      "eaten",
      "eats"
    ],
    "correct": 1
  },
  {
    "question": "Past of 'see'?",
    "choices": [
      "seed",
      "saw",
      "seen",
      "sees"
    ],
    "correct": 1
  },
  {
    "question": "Past of 'sing'?",
    "choices": [
      "singed",
      "sang",
      "sung",
      "sings"
    ],
    "correct": 1
  },
  {
    "question": "Past participle of 'do'?",
    "choices": [
      "did",
      "doing",
      "done",
      "does"
    ],
    "correct": 2
  },
  {
    "question": "Verb form: She ___ a book.",
    "choices": [
      "read",
      "reading",
      "reads",
      "readed"
    ],
    "correct": 2
  },
  {
    "question": "Past of 'swim'?",
    "choices": [
      "swimmed",
      "swam",
      "swum",
      "swims"
    ],
    "correct": 1
  },
  {
    "question": "Pick the verb.",
    "choices": [
      "fast",
      "quickly",
      "sleeps",
      "tired"
    ],
    "correct": 2
  },
  {
    "question": "Past of 'bring'?",
    "choices": [
      "bringed",
      "brung",
      "brought",
      "brings"
    ],
    "correct": 2
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VerbQuizSettings): VerbQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VerbQuizState, action: VerbQuizAction): VerbQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VerbQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
