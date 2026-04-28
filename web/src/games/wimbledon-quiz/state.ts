import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WimbledonQuizSettings { questions: "10" | "20" | "30"; }
export interface WimbledonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WimbledonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Most Wimbledon men's singles titles?",
    "choices": [
      "Federer",
      "Sampras",
      "Djokovic",
      "Nadal"
    ],
    "correct": 0
  },
  {
    "question": "How many Wimbledon titles has Federer?",
    "choices": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correct": 1
  },
  {
    "question": "Most Wimbledon women's singles titles?",
    "choices": [
      "Court",
      "Navratilova",
      "Williams",
      "Graf"
    ],
    "correct": 1
  },
  {
    "question": "Wimbledon is played on what surface?",
    "choices": [
      "Clay",
      "Hard",
      "Grass",
      "Carpet"
    ],
    "correct": 2
  },
  {
    "question": "Who won Wimbledon men's 2024?",
    "choices": [
      "Alcaraz",
      "Sinner",
      "Djokovic",
      "Medvedev"
    ],
    "correct": 0
  },
  {
    "question": "Bjorn Borg won how many in a row?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Wimbledon final was played on which day traditionally?",
    "choices": [
      "Saturday",
      "Sunday",
      "Monday",
      "Wednesday"
    ],
    "correct": 1
  },
  {
    "question": "Strawberries and ___ at Wimbledon?",
    "choices": [
      "sugar",
      "cream",
      "tea",
      "cake"
    ],
    "correct": 1
  },
  {
    "question": "Centre Court got a roof in?",
    "choices": [
      "2005",
      "2007",
      "2009",
      "2011"
    ],
    "correct": 2
  },
  {
    "question": "Longest Wimbledon match (Isner-Mahut)?",
    "choices": [
      "8 hrs",
      "9 hrs",
      "11 hrs",
      "13 hrs"
    ],
    "correct": 2
  },
  {
    "question": "Wimbledon was founded in?",
    "choices": [
      "1877",
      "1898",
      "1923",
      "1968"
    ],
    "correct": 0
  },
  {
    "question": "Open Era began in?",
    "choices": [
      "1962",
      "1968",
      "1972",
      "1978"
    ],
    "correct": 1
  },
  {
    "question": "All England Club is in?",
    "choices": [
      "Wimbledon",
      "Greenwich",
      "Hampstead",
      "Richmond"
    ],
    "correct": 0
  },
  {
    "question": "Steffi Graf won Wimbledon how many times?",
    "choices": [
      "5",
      "6",
      "7",
      "9"
    ],
    "correct": 2
  },
  {
    "question": "Pete Sampras won Wimbledon how many times?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WimbledonQuizSettings): WimbledonQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WimbledonQuizState, action: WimbledonQuizAction): WimbledonQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WimbledonQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
