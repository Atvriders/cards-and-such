import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ArticleQuizSettings { questions: "8" | "10" | "12"; }
export interface ArticleQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ArticleQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Choose the article: '___ apple a day keeps the doctor away.'",
    "choices": [
      "An",
      "A",
      "The",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose the article: '___ sun rises in the east.'",
    "choices": [
      "The",
      "A",
      "An",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'I saw ___ elephant at the zoo.'",
    "choices": [
      "an",
      "a",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'She is ___ honest person.'",
    "choices": [
      "an",
      "a",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'He is ___ university student.'",
    "choices": [
      "a",
      "an",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'I need ___ hour to finish.'",
    "choices": [
      "an",
      "a",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: '___ Eiffel Tower is in Paris.'",
    "choices": [
      "The",
      "A",
      "An",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'I love ___ music.' (general)",
    "choices": [
      "(none)",
      "a",
      "an",
      "the"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'She plays ___ guitar.' (instrument)",
    "choices": [
      "the",
      "a",
      "an",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'He is ___ engineer.'",
    "choices": [
      "an",
      "a",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'I bought ___ new car yesterday.'",
    "choices": [
      "a",
      "an",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: '___ car I bought yesterday is red.' (specific)",
    "choices": [
      "The",
      "A",
      "An",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'Mount Everest is ___ highest mountain.'",
    "choices": [
      "the",
      "a",
      "an",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: '___ Nile is in Africa.'",
    "choices": [
      "The",
      "A",
      "An",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'She lives in ___ United States.'",
    "choices": [
      "the",
      "a",
      "an",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'He went to ___ Japan last year.'",
    "choices": [
      "(none)",
      "the",
      "a",
      "an"
    ],
    "correct": 0
  },
  {
    "question": "Choose: '___ Mississippi River is long.'",
    "choices": [
      "The",
      "A",
      "An",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'I had ___ egg for breakfast.'",
    "choices": [
      "an",
      "a",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'It was ___ unforgettable trip.'",
    "choices": [
      "an",
      "a",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'He plays ___ soccer every day.' (sport)",
    "choices": [
      "(none)",
      "a",
      "an",
      "the"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'Please open ___ window.' (specific known)",
    "choices": [
      "the",
      "a",
      "an",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'I want ___ banana.' (any one)",
    "choices": [
      "a",
      "an",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'She is ___ best student in the class.'",
    "choices": [
      "the",
      "a",
      "an",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: '___ moon orbits ___ earth.'",
    "choices": [
      "The / the",
      "A / a",
      "An / an",
      "(none) / (none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'I read ___ interesting book yesterday.'",
    "choices": [
      "an",
      "a",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'He is ___ MBA graduate.' (sounds 'em-bee-ay')",
    "choices": [
      "an",
      "a",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'She works at ___ NASA.' (acronym)",
    "choices": [
      "(none)",
      "a",
      "an",
      "the"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'It costs ___ euro.'",
    "choices": [
      "a",
      "an",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: 'He has ___ one-year-old son.' (sounds 'wun')",
    "choices": [
      "a",
      "an",
      "the",
      "(none)"
    ],
    "correct": 0
  },
  {
    "question": "Choose: '___ rich should help ___ poor.'",
    "choices": [
      "The / the",
      "A / a",
      "An / an",
      "(none) / (none)"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ArticleQuizSettings): ArticleQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ArticleQuizState, action: ArticleQuizAction): ArticleQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ArticleQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
