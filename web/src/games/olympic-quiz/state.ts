import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OlympicQuizSettings { questions: "10" | "20" | "30"; }
export interface OlympicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OlympicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who has the most Olympic gold medals all-time?",
    "choices": [
      "Michael Phelps",
      "Larissa Latynina",
      "Mark Spitz",
      "Carl Lewis"
    ],
    "correct": 0
  },
  {
    "question": "How many Olympic gold medals does Phelps have?",
    "choices": [
      "18",
      "20",
      "23",
      "25"
    ],
    "correct": 2
  },
  {
    "question": "Usain Bolt's 100m world record (s)?",
    "choices": [
      "9.58",
      "9.69",
      "9.74",
      "9.84"
    ],
    "correct": 0
  },
  {
    "question": "Bolt represents?",
    "choices": [
      "Jamaica",
      "USA",
      "UK",
      "Trinidad"
    ],
    "correct": 0
  },
  {
    "question": "Nadia Comaneci scored the first perfect 10 in?",
    "choices": [
      "1976 Montreal",
      "1980 Moscow",
      "1972 Munich",
      "1984 LA"
    ],
    "correct": 0
  },
  {
    "question": "Comaneci represented?",
    "choices": [
      "Romania",
      "Russia",
      "Hungary",
      "Bulgaria"
    ],
    "correct": 0
  },
  {
    "question": "Where were the first modern Olympics held?",
    "choices": [
      "Athens 1896",
      "Paris 1900",
      "St. Louis 1904",
      "London 1908"
    ],
    "correct": 0
  },
  {
    "question": "Who founded the modern Olympics?",
    "choices": [
      "Pierre de Coubertin",
      "Avery Brundage",
      "Juan Antonio Samaranch",
      "Henri de Baillet-Latour"
    ],
    "correct": 0
  },
  {
    "question": "Where were the 2020 Olympics held (postponed to 2021)?",
    "choices": [
      "Tokyo",
      "Rio",
      "Paris",
      "Beijing"
    ],
    "correct": 0
  },
  {
    "question": "Where are the 2024 Olympics held?",
    "choices": [
      "Paris",
      "Los Angeles",
      "Brisbane",
      "Tokyo"
    ],
    "correct": 0
  },
  {
    "question": "How often are the Summer Olympics held?",
    "choices": [
      "Every 4 years",
      "Every 2 years",
      "Every 5 years",
      "Every 3 years"
    ],
    "correct": 0
  },
  {
    "question": "Which Olympics introduced the Olympic torch relay?",
    "choices": [
      "1936 Berlin",
      "1932 LA",
      "1948 London",
      "1924 Paris"
    ],
    "correct": 0
  },
  {
    "question": "Who won 9 Olympic gold medals as a sprinter at 100m, 200m and 4x100m relay over 3 Games?",
    "choices": [
      "Usain Bolt (8 due to relay loss)",
      "Carl Lewis",
      "Jesse Owens",
      "Justin Gatlin"
    ],
    "correct": 0
  },
  {
    "question": "Carl Lewis won how many Olympic gold medals?",
    "choices": [
      "9",
      "8",
      "10",
      "7"
    ],
    "correct": 0
  },
  {
    "question": "Mark Spitz famously won how many golds in 1972?",
    "choices": [
      "7",
      "8",
      "9",
      "6"
    ],
    "correct": 0
  },
  {
    "question": "Where were the 2016 Olympics?",
    "choices": [
      "Rio",
      "Beijing",
      "Athens",
      "Sydney"
    ],
    "correct": 0
  },
  {
    "question": "Where were the 2008 Olympics?",
    "choices": [
      "Beijing",
      "Athens",
      "Sydney",
      "Atlanta"
    ],
    "correct": 0
  },
  {
    "question": "Where were the 1996 Olympics?",
    "choices": [
      "Atlanta",
      "Sydney",
      "Athens",
      "LA"
    ],
    "correct": 0
  },
  {
    "question": "Jesse Owens won 4 golds in?",
    "choices": [
      "1936 Berlin",
      "1924 Paris",
      "1948 London",
      "1928 Amsterdam"
    ],
    "correct": 0
  },
  {
    "question": "Larissa Latynina excelled in?",
    "choices": [
      "Gymnastics",
      "Swimming",
      "Track",
      "Skating"
    ],
    "correct": 0
  },
  {
    "question": "The Winter Olympics started in?",
    "choices": [
      "1924",
      "1900",
      "1908",
      "1936"
    ],
    "correct": 0
  },
  {
    "question": "Norway dominates which Winter sport in Olympic history?",
    "choices": [
      "Cross-country skiing",
      "Bobsled",
      "Curling",
      "Ice dance"
    ],
    "correct": 0
  },
  {
    "question": "Where were the 2014 Winter Olympics?",
    "choices": [
      "Sochi",
      "Vancouver",
      "PyeongChang",
      "Turin"
    ],
    "correct": 0
  },
  {
    "question": "Where were the 2010 Winter Olympics?",
    "choices": [
      "Vancouver",
      "Turin",
      "Salt Lake City",
      "Sochi"
    ],
    "correct": 0
  },
  {
    "question": "Where were the 2018 Winter Olympics?",
    "choices": [
      "PyeongChang",
      "Sochi",
      "Beijing",
      "Vancouver"
    ],
    "correct": 0
  },
  {
    "question": "Where were the 2022 Winter Olympics?",
    "choices": [
      "Beijing",
      "PyeongChang",
      "Sochi",
      "Tokyo"
    ],
    "correct": 0
  },
  {
    "question": "Simone Biles competes in?",
    "choices": [
      "Gymnastics",
      "Swimming",
      "Track",
      "Skating"
    ],
    "correct": 0
  },
  {
    "question": "Florence Griffith-Joyner ran for?",
    "choices": [
      "USA",
      "Jamaica",
      "UK",
      "Cuba"
    ],
    "correct": 0
  },
  {
    "question": "Who lit the 1996 Atlanta torch?",
    "choices": [
      "Muhammad Ali",
      "Carl Lewis",
      "Mary Lou Retton",
      "Janet Evans"
    ],
    "correct": 0
  },
  {
    "question": "Who won the most golds at the 2008 Beijing Games?",
    "choices": [
      "Michael Phelps",
      "Usain Bolt",
      "Yelena Isinbayeva",
      "Yang Wei"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OlympicQuizSettings): OlympicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OlympicQuizState, action: OlympicQuizAction): OlympicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OlympicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
