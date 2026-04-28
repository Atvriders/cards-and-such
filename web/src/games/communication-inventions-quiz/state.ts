import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CommunicationInventionsQuizSettings { questions: "10" | "20" | "30"; }
export interface CommunicationInventionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CommunicationInventionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Telephone is credited to?",
    "choices": [
      "Edison",
      "Bell",
      "Marconi",
      "Tesla"
    ],
    "correct": 1
  },
  {
    "question": "Year telephone was patented?",
    "choices": [
      "1860",
      "1876",
      "1890",
      "1900"
    ],
    "correct": 1
  },
  {
    "question": "Wireless telegraphy / radio?",
    "choices": [
      "Bell",
      "Marconi",
      "Edison",
      "Tesla"
    ],
    "correct": 1
  },
  {
    "question": "First television broadcast (mechanical)?",
    "choices": [
      "Baird (1926)",
      "RCA 1939",
      "BBC 1950",
      "Farnsworth 1928"
    ],
    "correct": 0
  },
  {
    "question": "Email invented in the?",
    "choices": [
      "1960s-70s",
      "1980s",
      "1990s",
      "2000s"
    ],
    "correct": 0
  },
  {
    "question": "World Wide Web was created by?",
    "choices": [
      "Cerf",
      "Berners-Lee",
      "Gates",
      "Jobs"
    ],
    "correct": 1
  },
  {
    "question": "Year of WWW proposal?",
    "choices": [
      "1969",
      "1989",
      "1995",
      "2000"
    ],
    "correct": 1
  },
  {
    "question": "First commercial mobile phone (Motorola DynaTAC)?",
    "choices": [
      "1970",
      "1983",
      "1995",
      "2000"
    ],
    "correct": 1
  },
  {
    "question": "Morse code is associated with the?",
    "choices": [
      "Telephone",
      "Telegraph",
      "Radio",
      "TV"
    ],
    "correct": 1
  },
  {
    "question": "Photography's early pioneer?",
    "choices": [
      "Daguerre",
      "Edison",
      "Bell",
      "Marconi"
    ],
    "correct": 0
  },
  {
    "question": "Printing press in Europe by?",
    "choices": [
      "Gutenberg (1440s)",
      "Caxton 1500",
      "Aldus 1490",
      "Plantin 1550"
    ],
    "correct": 0
  },
  {
    "question": "First widely used social network?",
    "choices": [
      "MySpace (2003)",
      "Friendster",
      "Facebook",
      "Twitter"
    ],
    "correct": 0
  },
  {
    "question": "First text message sent in?",
    "choices": [
      "1992",
      "2000",
      "1985",
      "1995"
    ],
    "correct": 0
  },
  {
    "question": "Fiber optic communication scaled in the?",
    "choices": [
      "1970s-80s",
      "1990s only",
      "2000s only",
      "1960s only"
    ],
    "correct": 0
  },
  {
    "question": "Satellite TV became common in the?",
    "choices": [
      "1960s",
      "1980s-90s",
      "2000s",
      "1950s"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CommunicationInventionsQuizSettings): CommunicationInventionsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CommunicationInventionsQuizState, action: CommunicationInventionsQuizAction): CommunicationInventionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CommunicationInventionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
