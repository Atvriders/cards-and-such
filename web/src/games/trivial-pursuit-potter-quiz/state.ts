import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitPotterQuizSettings { questions: "10"; }
export interface TrivialPursuitPotterQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitPotterQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Harry Potter author is?",
    "choices": [
      "J.K. Rowling",
      "J.R.R. Tolkien",
      "C.S. Lewis",
      "Philip Pullman"
    ],
    "correct": 0
  },
  {
    "question": "Harry's pet owl is named?",
    "choices": [
      "Errol",
      "Hedwig",
      "Pigwidgeon",
      "Crookshanks"
    ],
    "correct": 1
  },
  {
    "question": "Hogwarts has how many founder houses?",
    "choices": [
      "Three",
      "Four",
      "Five",
      "Six"
    ],
    "correct": 1
  },
  {
    "question": "Hermione's last name is?",
    "choices": [
      "Granger",
      "Weasley",
      "Lovegood",
      "Patil"
    ],
    "correct": 0
  },
  {
    "question": "The Goblet of Fire is for which event?",
    "choices": [
      "OWL exam",
      "Triwizard Tournament",
      "Yule Ball",
      "Quidditch Cup"
    ],
    "correct": 1
  },
  {
    "question": "Voldemort split his soul into how many Horcruxes (originally)?",
    "choices": [
      "Five",
      "Six",
      "Seven",
      "Eight"
    ],
    "correct": 1
  },
  {
    "question": "Quidditch features how many balls in play?",
    "choices": [
      "Three",
      "Four",
      "Five",
      "Six"
    ],
    "correct": 1
  },
  {
    "question": "The Headmaster after Dumbledore is?",
    "choices": [
      "McGonagall",
      "Snape (briefly)",
      "Hagrid",
      "Slughorn"
    ],
    "correct": 1
  },
  {
    "question": "Harry's wand is made from which wood?",
    "choices": [
      "Holly",
      "Yew",
      "Oak",
      "Vine"
    ],
    "correct": 0
  },
  {
    "question": "The first book is titled (UK)?",
    "choices": [
      "Sorcerer's Stone",
      "Philosopher's Stone",
      "Chamber of Secrets",
      "Half-Blood Prince"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrivialPursuitPotterQuizSettings): TrivialPursuitPotterQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrivialPursuitPotterQuizState, action: TrivialPursuitPotterQuizAction): TrivialPursuitPotterQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrivialPursuitPotterQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
