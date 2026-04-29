import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PictionaryManiaQuizSettings { questions: "10"; }
export interface PictionaryManiaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PictionaryManiaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In Pictionary Mania, how many teams draw simultaneously?",
    "choices": [
      "Only one at a time",
      "Two",
      "All teams at once",
      "Half the teams"
    ],
    "correct": 2
  },
  {
    "question": "Pictionary was invented by which person?",
    "choices": [
      "Alex Randolph",
      "Robert Angel",
      "Sid Sackson",
      "Reiner Knizia"
    ],
    "correct": 1
  },
  {
    "question": "Pictionary was first published in what year?",
    "choices": [
      "1979",
      "1985",
      "1990",
      "1994"
    ],
    "correct": 1
  },
  {
    "question": "Standard Pictionary uses how many category card colors?",
    "choices": [
      "Three",
      "Four",
      "Five",
      "Six"
    ],
    "correct": 1
  },
  {
    "question": "Pictionary was originally distributed by which company?",
    "choices": [
      "Hasbro",
      "Mattel",
      "Pictionary Inc / Angel Games",
      "Milton Bradley"
    ],
    "correct": 2
  },
  {
    "question": "In Pictionary, the 'P' category covers what?",
    "choices": [
      "Person/Place",
      "Phrase only",
      "Picture",
      "Plant"
    ],
    "correct": 0
  },
  {
    "question": "In Pictionary Mania, which time keeps every team honest?",
    "choices": [
      "A judge",
      "A timer",
      "A bell",
      "An audience vote"
    ],
    "correct": 1
  },
  {
    "question": "The classic Pictionary timer runs for how long?",
    "choices": [
      "30 seconds",
      "60 seconds",
      "90 seconds",
      "120 seconds"
    ],
    "correct": 1
  },
  {
    "question": "In Pictionary, you may NOT do which when drawing?",
    "choices": [
      "Use letters/numbers",
      "Use stick figures",
      "Use circles",
      "Use arrows"
    ],
    "correct": 0
  },
  {
    "question": "Pictionary is most often described as which kind of game?",
    "choices": [
      "Trivia",
      "Drawing party",
      "Strategy",
      "Memory"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PictionaryManiaQuizSettings): PictionaryManiaQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PictionaryManiaQuizState, action: PictionaryManiaQuizAction): PictionaryManiaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PictionaryManiaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
