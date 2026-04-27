import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChineseNewYearQuizSettings { questions: "10" | "20" | "30"; }
export interface ChineseNewYearQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChineseNewYearQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Chinese New Year follows which calendar?",
    "choices": [
      "Solar",
      "Lunisolar",
      "Gregorian",
      "Julian"
    ],
    "correct": 1
  },
  {
    "question": "Spring Festival lasts how many days?",
    "choices": [
      "3",
      "7",
      "10",
      "15"
    ],
    "correct": 3
  },
  {
    "question": "How many zodiac animals?",
    "choices": [
      "10",
      "12",
      "13",
      "16"
    ],
    "correct": 1
  },
  {
    "question": "First zodiac animal?",
    "choices": [
      "Tiger",
      "Rat",
      "Ox",
      "Dragon"
    ],
    "correct": 1
  },
  {
    "question": "Lucky color of CNY is?",
    "choices": [
      "Red",
      "Gold",
      "Both",
      "Yellow"
    ],
    "correct": 2
  },
  {
    "question": "Money is given in?",
    "choices": [
      "Red envelopes",
      "Gold coins",
      "White envelopes",
      "Yellow paper"
    ],
    "correct": 0
  },
  {
    "question": "Red envelopes are called?",
    "choices": [
      "Hongbao",
      "Hongbai",
      "Honglu",
      "Hongtai"
    ],
    "correct": 0
  },
  {
    "question": "Lion dance scares away?",
    "choices": [
      "Nian",
      "Tigers",
      "Snakes",
      "Demons"
    ],
    "correct": 0
  },
  {
    "question": "Last day of CNY is?",
    "choices": [
      "Lantern Festival",
      "Tomb-sweeping",
      "Mid-Autumn",
      "Dragon Boat"
    ],
    "correct": 0
  },
  {
    "question": "Dumplings symbolize?",
    "choices": [
      "Long life",
      "Wealth (resemble ingots)",
      "Family",
      "Travel"
    ],
    "correct": 1
  },
  {
    "question": "Niangao means?",
    "choices": [
      "Year cake",
      "Year fish",
      "Year tea",
      "Year bread"
    ],
    "correct": 0
  },
  {
    "question": "Fish is eaten because?",
    "choices": [
      "Surplus pun",
      "Lucky color",
      "Tradition only",
      "Meat ban"
    ],
    "correct": 0
  },
  {
    "question": "Spring couplets are written on?",
    "choices": [
      "Red paper",
      "Gold paper",
      "Silk",
      "Bamboo"
    ],
    "correct": 0
  },
  {
    "question": "Firecrackers used to scare?",
    "choices": [
      "Bad luck",
      "Nian",
      "Spirits",
      "Both nian and bad luck"
    ],
    "correct": 3
  },
  {
    "question": "Reunion dinner is on?",
    "choices": [
      "NY Eve",
      "First day",
      "Last day",
      "Mid-festival"
    ],
    "correct": 0
  },
  {
    "question": "CNY flower (Chinese)?",
    "choices": [
      "Plum blossom",
      "Peach blossom",
      "Both",
      "Jasmine"
    ],
    "correct": 2
  },
  {
    "question": "Vietnam's CNY is called?",
    "choices": [
      "Tet",
      "Songkran",
      "Imlek",
      "Seollal"
    ],
    "correct": 0
  },
  {
    "question": "Korea's lunar NY is?",
    "choices": [
      "Tet",
      "Seollal",
      "Songkran",
      "Imlek"
    ],
    "correct": 1
  },
  {
    "question": "Mongolia's New Year is?",
    "choices": [
      "Tsagaan Sar",
      "Naadam",
      "Ulaanbaatar",
      "Yurt"
    ],
    "correct": 0
  },
  {
    "question": "Don't ___ on New Year's Day?",
    "choices": [
      "Eat fish",
      "Sweep",
      "Sleep",
      "Smile"
    ],
    "correct": 1
  },
  {
    "question": "Tangerines symbolize?",
    "choices": [
      "Family",
      "Wealth/luck",
      "Health",
      "Long life"
    ],
    "correct": 1
  },
  {
    "question": "What's banned to wash on day 1?",
    "choices": [
      "Hair",
      "Floor",
      "Clothes",
      "All these"
    ],
    "correct": 0
  },
  {
    "question": "CNY date can fall between?",
    "choices": [
      "Jan 21-Feb 20",
      "Feb 1-Feb 28",
      "Jan 1-Feb 1",
      "Mar 1-Apr 1"
    ],
    "correct": 0
  },
  {
    "question": "Year of Tiger comes after?",
    "choices": [
      "Ox",
      "Rabbit",
      "Dragon",
      "Snake"
    ],
    "correct": 0
  },
  {
    "question": "Lantern Festival ends with eating?",
    "choices": [
      "Dumplings",
      "Tangyuan",
      "Mooncakes",
      "Zongzi"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChineseNewYearQuizSettings): ChineseNewYearQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChineseNewYearQuizState, action: ChineseNewYearQuizAction): ChineseNewYearQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChineseNewYearQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
