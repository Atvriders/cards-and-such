import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DubaiQuizSettings { questions: "10" | "20"; }
export interface DubaiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DubaiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Dubai is in which country?",
    "choices": [
      "Saudi Arabia",
      "UAE",
      "Qatar",
      "Oman"
    ],
    "correct": 1
  },
  {
    "question": "The Burj Khalifa was completed in?",
    "choices": [
      "2005",
      "2010",
      "2015",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Burj Khalifa height is approximately?",
    "choices": [
      "500m",
      "700m",
      "830m",
      "1000m"
    ],
    "correct": 2
  },
  {
    "question": "Dubai's currency is the?",
    "choices": [
      "Dinar",
      "Dirham",
      "Riyal",
      "Lira"
    ],
    "correct": 1
  },
  {
    "question": "Palm Jumeirah is shaped like a?",
    "choices": [
      "dolphin",
      "palm tree",
      "cross",
      "star"
    ],
    "correct": 1
  },
  {
    "question": "Dubai's main language is?",
    "choices": [
      "English only",
      "Arabic",
      "Persian",
      "Urdu"
    ],
    "correct": 1
  },
  {
    "question": "The Dubai Mall is one of the?",
    "choices": [
      "smallest",
      "largest in the world",
      "most ancient",
      "first ever"
    ],
    "correct": 1
  },
  {
    "question": "The Burj Al Arab is shaped like a?",
    "choices": [
      "sail",
      "tree",
      "palm",
      "star"
    ],
    "correct": 0
  },
  {
    "question": "Dubai Metro opened in?",
    "choices": [
      "1999",
      "2004",
      "2009",
      "2015"
    ],
    "correct": 2
  },
  {
    "question": "World Expo 2020 (held 2021) was hosted by?",
    "choices": [
      "Tokyo",
      "Dubai",
      "Milan",
      "Astana"
    ],
    "correct": 1
  },
  {
    "question": "Dubai's main airport (DXB) is one of the?",
    "choices": [
      "smallest",
      "busiest int'l",
      "oldest",
      "newest only"
    ],
    "correct": 1
  },
  {
    "question": "Dubai is one of the seven?",
    "choices": [
      "Emirates",
      "cantons",
      "provinces",
      "khanates"
    ],
    "correct": 0
  },
  {
    "question": "Sheikh Zayed Road is a famous?",
    "choices": [
      "river",
      "mountain",
      "highway",
      "forest"
    ],
    "correct": 2
  },
  {
    "question": "Dubai Creek divides Bur Dubai and?",
    "choices": [
      "Deira",
      "Sharjah",
      "Abu Dhabi",
      "Ajman"
    ],
    "correct": 0
  },
  {
    "question": "The Museum of the Future opened in?",
    "choices": [
      "2015",
      "2018",
      "2022",
      "2024"
    ],
    "correct": 2
  },
  {
    "question": "Skiing is offered indoors at?",
    "choices": [
      "Mall of the Emirates",
      "Dubai Mall",
      "Marina Mall",
      "Ibn Battuta"
    ],
    "correct": 0
  },
  {
    "question": "The Dubai Marina is a?",
    "choices": [
      "natural harbor",
      "artificial canal",
      "river",
      "lake"
    ],
    "correct": 1
  },
  {
    "question": "Friday is a traditional?",
    "choices": [
      "working day",
      "weekend day in UAE",
      "holiday only",
      "ramadan only"
    ],
    "correct": 1
  },
  {
    "question": "Dubai's tallest hotel was?",
    "choices": [
      "Burj Al Arab",
      "Atlantis",
      "Address",
      "JW Marriott"
    ],
    "correct": 0
  },
  {
    "question": "Old Dubai's gold souk is in?",
    "choices": [
      "Deira",
      "Marina",
      "Downtown",
      "Jumeirah"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DubaiQuizSettings): DubaiQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DubaiQuizState, action: DubaiQuizAction): DubaiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DubaiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
