import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DillingerQuizSettings { questions: "10" | "20"; }
export interface DillingerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DillingerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "John Dillinger was killed in what year?",
    "choices": [
      "1932",
      "1934",
      "1936",
      "1938"
    ],
    "correct": 1
  },
  {
    "question": "Outside which Chicago theater was he shot?",
    "choices": [
      "Biograph",
      "Chicago",
      "Roxy",
      "Palace"
    ],
    "correct": 0
  },
  {
    "question": "FBI director who pursued Dillinger?",
    "choices": [
      "Eliot Ness",
      "J. Edgar Hoover",
      "Melvin Purvis",
      "Walter Winchell"
    ],
    "correct": 1
  },
  {
    "question": "Lead FBI agent on the case?",
    "choices": [
      "Eliot Ness",
      "Melvin Purvis",
      "Sam Cowley",
      "James Crowley"
    ],
    "correct": 1
  },
  {
    "question": "Dillinger's home state?",
    "choices": [
      "Illinois",
      "Indiana",
      "Michigan",
      "Ohio"
    ],
    "correct": 1
  },
  {
    "question": "Who was the 'lady in red'?",
    "choices": [
      "Anna Sage",
      "Polly Hamilton",
      "Billie Frechette",
      "Evelyn Frechette"
    ],
    "correct": 0
  },
  {
    "question": "Dillinger famously escaped Crown Point Jail using a?",
    "choices": [
      "Hidden file",
      "Wooden gun",
      "Bedsheet rope",
      "Bribed guard"
    ],
    "correct": 1
  },
  {
    "question": "Approximate FBI bounty (in 1934 dollars)?",
    "choices": [
      "$1,000",
      "$5,000",
      "$10,000",
      "$50,000"
    ],
    "correct": 2
  },
  {
    "question": "Famous Wisconsin gunfight site of his gang?",
    "choices": [
      "Little Bohemia",
      "Long Branch",
      "Rosie's",
      "Cedar Point"
    ],
    "correct": 0
  },
  {
    "question": "Public officials labeled him Public Enemy Number?",
    "choices": [
      "1",
      "2",
      "3",
      "5"
    ],
    "correct": 0
  },
  {
    "question": "1973 biopic title?",
    "choices": [
      "Dillinger",
      "Public Enemies",
      "The Untouchables",
      "Kansas City Confidential"
    ],
    "correct": 0
  },
  {
    "question": "Who played Dillinger in 'Public Enemies' (2009)?",
    "choices": [
      "Johnny Depp",
      "Christian Bale",
      "Brad Pitt",
      "Russell Crowe"
    ],
    "correct": 0
  },
  {
    "question": "What kind of gun did Anna Sage signal with?",
    "choices": [
      "Red dress",
      "Orange skirt",
      "Blue scarf",
      "Green coat"
    ],
    "correct": 1
  },
  {
    "question": "Dillinger Gang member known as 'Baby Face'?",
    "choices": [
      "George Nelson",
      "Homer Van Meter",
      "Harry Pierpont",
      "Pretty Boy Floyd"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DillingerQuizSettings): DillingerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DillingerQuizState, action: DillingerQuizAction): DillingerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DillingerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
