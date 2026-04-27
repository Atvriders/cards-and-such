import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NewYearQuizSettings { questions: "10" | "20" | "30"; }
export interface NewYearQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NewYearQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Times Square Ball drop began in?",
    "choices": [
      "1900",
      "1907",
      "1925",
      "1945"
    ],
    "correct": 1
  },
  {
    "question": "Auld Lang Syne lyrics are by?",
    "choices": [
      "Burns",
      "Yeats",
      "Wordsworth",
      "Keats"
    ],
    "correct": 0
  },
  {
    "question": "Chinese New Year is also called?",
    "choices": [
      "Lunar New Year",
      "Spring Festival",
      "Both",
      "Neither"
    ],
    "correct": 2
  },
  {
    "question": "Hogmanay is celebrated in?",
    "choices": [
      "Wales",
      "Scotland",
      "Ireland",
      "England"
    ],
    "correct": 1
  },
  {
    "question": "Spanish tradition: eat 12 ___ at midnight?",
    "choices": [
      "Olives",
      "Grapes",
      "Almonds",
      "Figs"
    ],
    "correct": 1
  },
  {
    "question": "Brazilian custom: wear which color?",
    "choices": [
      "Red",
      "Black",
      "White",
      "Blue"
    ],
    "correct": 2
  },
  {
    "question": "Russian New Year features?",
    "choices": [
      "Father Frost",
      "Krampus",
      "Santa",
      "Rudolph"
    ],
    "correct": 0
  },
  {
    "question": "Japan rings how many bell tolls?",
    "choices": [
      "12",
      "24",
      "108",
      "365"
    ],
    "correct": 2
  },
  {
    "question": "First-foot tradition in Scotland brings?",
    "choices": [
      "Bread",
      "Coal",
      "Whisky",
      "All these"
    ],
    "correct": 3
  },
  {
    "question": "Greeks bake the Vasilopita on?",
    "choices": [
      "Christmas",
      "New Year",
      "Easter",
      "Epiphany"
    ],
    "correct": 1
  },
  {
    "question": "The Roman calendar's first month was?",
    "choices": [
      "January",
      "March",
      "April",
      "June"
    ],
    "correct": 1
  },
  {
    "question": "Janus, namesake of January, has how many faces?",
    "choices": [
      "One",
      "Two",
      "Three",
      "Four"
    ],
    "correct": 1
  },
  {
    "question": "Ethiopia's New Year is in?",
    "choices": [
      "January",
      "March",
      "September",
      "November"
    ],
    "correct": 2
  },
  {
    "question": "Iranian Nowruz celebrates?",
    "choices": [
      "New moon",
      "Spring equinox",
      "Winter solstice",
      "Autumn"
    ],
    "correct": 1
  },
  {
    "question": "South Indian New Year Pongal is in?",
    "choices": [
      "January",
      "April",
      "October",
      "November"
    ],
    "correct": 0
  },
  {
    "question": "Americans often resolve to?",
    "choices": [
      "Lose weight",
      "Save money",
      "Quit smoking",
      "All these"
    ],
    "correct": 3
  },
  {
    "question": "What sphere drops in Sydney?",
    "choices": [
      "Ball",
      "Fireworks",
      "None - fireworks",
      "Cube"
    ],
    "correct": 2
  },
  {
    "question": "Which holiday follows New Year's Day?",
    "choices": [
      "Epiphany",
      "Easter",
      "Lunar NY",
      "MLK Day"
    ],
    "correct": 0
  },
  {
    "question": "Australian NY tradition often includes?",
    "choices": [
      "Snow",
      "Beach BBQ",
      "Sleigh rides",
      "Carolling"
    ],
    "correct": 1
  },
  {
    "question": "Ecuadorian custom: burn?",
    "choices": [
      "Old shoes",
      "Effigies (anos viejos)",
      "Letters",
      "Photos"
    ],
    "correct": 1
  },
  {
    "question": "Italian custom: throw out the?",
    "choices": [
      "Old broom",
      "Old furniture",
      "Old bread",
      "Old clothes"
    ],
    "correct": 1
  },
  {
    "question": "Denmark: smashing ___ at neighbours' doors?",
    "choices": [
      "Plates",
      "Eggs",
      "Cups",
      "Glasses"
    ],
    "correct": 0
  },
  {
    "question": "Filipinos eat round fruits to wish?",
    "choices": [
      "Health",
      "Wealth",
      "Love",
      "Travel"
    ],
    "correct": 1
  },
  {
    "question": "South Africa: throw ___ from windows?",
    "choices": [
      "Furniture",
      "Food",
      "Coins",
      "Glasses"
    ],
    "correct": 0
  },
  {
    "question": "Gregorian calendar started year is?",
    "choices": [
      "1066",
      "1492",
      "1582",
      "1620"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NewYearQuizSettings): NewYearQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NewYearQuizState, action: NewYearQuizAction): NewYearQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NewYearQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
