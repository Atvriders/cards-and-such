import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DoubleLetterQuizSettings { questions: "8" | "10" | "12"; }
export interface DoubleLetterQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DoubleLetterQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which word has a double letter? 'accommodate'",
    "choices": [
      "yes (double c and double m)",
      "no",
      "only double c",
      "only double n"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "necessary",
      "neccessary",
      "necesary",
      "nessessary"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "embarrass",
      "embarass",
      "embarras",
      "embaress"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "occurrence",
      "occurence",
      "ocurrence",
      "ocurrance"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "committee",
      "comittee",
      "committe",
      "commitee"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "address",
      "adress",
      "addres",
      "adres"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "beginning",
      "begining",
      "beggining",
      "beginnning"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "recommend",
      "reccommend",
      "recomend",
      "recommmend"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "possess",
      "posess",
      "posses",
      "possesss"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "successful",
      "succesful",
      "sucessful",
      "successfull"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "parallel",
      "paralel",
      "parralel",
      "parellel"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "millennium",
      "milennium",
      "millenium",
      "millenium"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "tomorrow",
      "tommorow",
      "tomorow",
      "tommorrow"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "happened",
      "happend",
      "hapened",
      "happenned"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "professional",
      "proffesional",
      "profesional",
      "professionnal"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "written",
      "writen",
      "writtin",
      "writtenn"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "different",
      "diferent",
      "diffrent",
      "differrent"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "across",
      "accross",
      "acros",
      "acrross"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "aggressive",
      "agressive",
      "agresive",
      "aggresive"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "appearance",
      "apearance",
      "appearence",
      "appeerance"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "balloon",
      "baloon",
      "ballon",
      "baloonn"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "broccoli",
      "brocolli",
      "brocoli",
      "brocolly"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "cappuccino",
      "capuccino",
      "capuchino",
      "cappucino"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "dilemma",
      "dilema",
      "dillemma",
      "dilemmna"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "espresso",
      "expresso",
      "esspresso",
      "espreso"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "guarantee",
      "garantee",
      "guaruntee",
      "guarantie"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "harass",
      "harras",
      "harrass",
      "haras"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "lollipop",
      "lolipop",
      "lollypop",
      "lollipopp"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "mississippi",
      "misissippi",
      "missisipi",
      "mississipi"
    ],
    "correct": 0
  },
  {
    "question": "Spell correctly:",
    "choices": [
      "pumpkin (no double)",
      "pumkkin",
      "pumppkin",
      "pumpkinn"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DoubleLetterQuizSettings): DoubleLetterQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DoubleLetterQuizState, action: DoubleLetterQuizAction): DoubleLetterQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DoubleLetterQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
