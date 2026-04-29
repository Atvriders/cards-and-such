import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ApplesToApplesKidsQuizSettings { questions: "10"; }
export interface ApplesToApplesKidsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ApplesToApplesKidsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Apples to Apples Kids has what reading level vocabulary?",
    "choices": [
      "Adult",
      "Kid-friendly",
      "Latin",
      "Technical"
    ],
    "correct": 1
  },
  {
    "question": "In Apples to Apples, how do players win a round?",
    "choices": [
      "Most matching adjective played by judge",
      "Highest dice",
      "Auction win",
      "Random draw"
    ],
    "correct": 0
  },
  {
    "question": "In Apples to Apples Kids, judges select?",
    "choices": [
      "Best fit noun for adjective",
      "Best art",
      "Fastest answer",
      "Highest dice"
    ],
    "correct": 0
  },
  {
    "question": "Apples to Apples first published in?",
    "choices": [
      "1995",
      "1999",
      "2002",
      "2008"
    ],
    "correct": 1
  },
  {
    "question": "Apples to Apples Kids is for ages?",
    "choices": [
      "2+",
      "5+",
      "9+",
      "12+"
    ],
    "correct": 2
  },
  {
    "question": "How many cards are in a typical hand?",
    "choices": [
      "3",
      "5",
      "7",
      "10"
    ],
    "correct": 2
  },
  {
    "question": "The judge's role rotates after?",
    "choices": [
      "Each round",
      "Three rounds",
      "Game end",
      "Never"
    ],
    "correct": 0
  },
  {
    "question": "Apples to Apples uses cards of two types: red apples and?",
    "choices": [
      "Blue apples",
      "Green apples",
      "Yellow apples",
      "Orange apples"
    ],
    "correct": 1
  },
  {
    "question": "Red apple cards represent?",
    "choices": [
      "Adjectives",
      "Nouns",
      "Verbs",
      "Colors"
    ],
    "correct": 1
  },
  {
    "question": "Green apple cards represent?",
    "choices": [
      "Adjectives",
      "Nouns",
      "Verbs",
      "Sounds"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ApplesToApplesKidsQuizSettings): ApplesToApplesKidsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ApplesToApplesKidsQuizState, action: ApplesToApplesKidsQuizAction): ApplesToApplesKidsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ApplesToApplesKidsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
