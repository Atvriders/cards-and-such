import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TensesQuizSettings { questions: "8" | "10" | "12"; }
export interface TensesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TensesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which tense: 'She walks to school every day.'?",
    "choices": [
      "simple present",
      "simple past",
      "present perfect",
      "future"
    ],
    "correct": 0
  },
  {
    "question": "Which tense: 'They walked to school yesterday.'?",
    "choices": [
      "simple past",
      "simple present",
      "past perfect",
      "future"
    ],
    "correct": 0
  },
  {
    "question": "Which tense: 'I will see you tomorrow.'?",
    "choices": [
      "simple future",
      "present continuous",
      "past simple",
      "present perfect"
    ],
    "correct": 0
  },
  {
    "question": "Which tense: 'He is reading a book right now.'?",
    "choices": [
      "present continuous",
      "simple present",
      "present perfect",
      "past continuous"
    ],
    "correct": 0
  },
  {
    "question": "Which tense: 'They were playing when it started raining.'?",
    "choices": [
      "past continuous",
      "past perfect",
      "present continuous",
      "future continuous"
    ],
    "correct": 0
  },
  {
    "question": "Which tense: 'I have lived here for ten years.'?",
    "choices": [
      "present perfect",
      "simple past",
      "past perfect",
      "future perfect"
    ],
    "correct": 0
  },
  {
    "question": "Which tense: 'She had finished before I arrived.'?",
    "choices": [
      "past perfect",
      "present perfect",
      "simple past",
      "past continuous"
    ],
    "correct": 0
  },
  {
    "question": "Which tense: 'By next year, I will have graduated.'?",
    "choices": [
      "future perfect",
      "simple future",
      "present perfect",
      "past perfect"
    ],
    "correct": 0
  },
  {
    "question": "Past tense of 'go':",
    "choices": [
      "went",
      "goed",
      "gone",
      "going"
    ],
    "correct": 0
  },
  {
    "question": "Past participle of 'eat':",
    "choices": [
      "eaten",
      "ate",
      "eated",
      "eating"
    ],
    "correct": 0
  },
  {
    "question": "Past tense of 'run':",
    "choices": [
      "ran",
      "runned",
      "run",
      "running"
    ],
    "correct": 0
  },
  {
    "question": "Past participle of 'write':",
    "choices": [
      "written",
      "wrote",
      "writed",
      "writting"
    ],
    "correct": 0
  },
  {
    "question": "Past tense of 'bring':",
    "choices": [
      "brought",
      "bringed",
      "brung",
      "brang"
    ],
    "correct": 0
  },
  {
    "question": "Past tense of 'teach':",
    "choices": [
      "taught",
      "teached",
      "teach",
      "teached up"
    ],
    "correct": 0
  },
  {
    "question": "Past participle of 'speak':",
    "choices": [
      "spoken",
      "spoke",
      "speaked",
      "speaking"
    ],
    "correct": 0
  },
  {
    "question": "'I ___ never been to Paris.' (present perfect)",
    "choices": [
      "have",
      "had",
      "will",
      "am"
    ],
    "correct": 0
  },
  {
    "question": "'She ___ studying when I called.' (past continuous)",
    "choices": [
      "was",
      "is",
      "has",
      "will be"
    ],
    "correct": 0
  },
  {
    "question": "'They ___ leave tomorrow.' (future)",
    "choices": [
      "will",
      "have",
      "had",
      "are"
    ],
    "correct": 0
  },
  {
    "question": "Which is present perfect continuous? 'I ___ working since 9.'",
    "choices": [
      "have been",
      "had been",
      "am",
      "was"
    ],
    "correct": 0
  },
  {
    "question": "Which is past perfect? 'When I arrived, she ___ left.'",
    "choices": [
      "had",
      "has",
      "have",
      "will have"
    ],
    "correct": 0
  },
  {
    "question": "Which sentence uses simple present?",
    "choices": [
      "She works in Paris.",
      "She is working.",
      "She has worked.",
      "She worked."
    ],
    "correct": 0
  },
  {
    "question": "Which sentence is in past simple?",
    "choices": [
      "I saw a movie.",
      "I see a movie.",
      "I have seen a movie.",
      "I am seeing a movie."
    ],
    "correct": 0
  },
  {
    "question": "Which sentence is in present continuous?",
    "choices": [
      "They are eating.",
      "They eat.",
      "They ate.",
      "They have eaten."
    ],
    "correct": 0
  },
  {
    "question": "Which uses future continuous?",
    "choices": [
      "I will be sleeping.",
      "I will sleep.",
      "I have slept.",
      "I am sleeping."
    ],
    "correct": 0
  },
  {
    "question": "Past tense of 'drink':",
    "choices": [
      "drank",
      "drinked",
      "drunk",
      "drinking"
    ],
    "correct": 0
  },
  {
    "question": "Past participle of 'drive':",
    "choices": [
      "driven",
      "drove",
      "drived",
      "driving"
    ],
    "correct": 0
  },
  {
    "question": "Past tense of 'swim':",
    "choices": [
      "swam",
      "swum",
      "swimmed",
      "swim"
    ],
    "correct": 0
  },
  {
    "question": "Past tense of 'fly':",
    "choices": [
      "flew",
      "flied",
      "flyed",
      "flown"
    ],
    "correct": 0
  },
  {
    "question": "Past participle of 'choose':",
    "choices": [
      "chosen",
      "chose",
      "choosed",
      "choosing"
    ],
    "correct": 0
  },
  {
    "question": "Tense of 'I had been waiting for an hour.'?",
    "choices": [
      "past perfect continuous",
      "present perfect",
      "past continuous",
      "simple past"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TensesQuizSettings): TensesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TensesQuizState, action: TensesQuizAction): TensesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TensesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
