import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MardiGrasQuizSettings { questions: "10" | "20" | "30"; }
export interface MardiGrasQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MardiGrasQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Mardi Gras means?",
    "choices": [
      "Big Tuesday",
      "Fat Tuesday",
      "Lent Tuesday",
      "Holy Tuesday"
    ],
    "correct": 1
  },
  {
    "question": "Mardi Gras is the day before?",
    "choices": [
      "Easter",
      "Christmas",
      "Ash Wednesday",
      "Palm Sunday"
    ],
    "correct": 2
  },
  {
    "question": "Most famous US Mardi Gras city?",
    "choices": [
      "Mobile",
      "New Orleans",
      "Galveston",
      "St. Louis"
    ],
    "correct": 1
  },
  {
    "question": "Mardi Gras colors are?",
    "choices": [
      "Purple, green, gold",
      "Red, white, blue",
      "Blue, yellow, red",
      "Pink, blue, gold"
    ],
    "correct": 0
  },
  {
    "question": "Purple symbolizes?",
    "choices": [
      "Justice",
      "Faith",
      "Power",
      "Love"
    ],
    "correct": 0
  },
  {
    "question": "Gold symbolizes?",
    "choices": [
      "Power",
      "Justice",
      "Faith",
      "Joy"
    ],
    "correct": 0
  },
  {
    "question": "Green symbolizes?",
    "choices": [
      "Faith",
      "Hope",
      "Power",
      "Love"
    ],
    "correct": 0
  },
  {
    "question": "Krewes are?",
    "choices": [
      "Bands",
      "Parade clubs",
      "Dancers",
      "Bakers"
    ],
    "correct": 1
  },
  {
    "question": "King Cake hides what?",
    "choices": [
      "Coin",
      "Bean",
      "Plastic baby",
      "Ring"
    ],
    "correct": 2
  },
  {
    "question": "Carnival officially starts on?",
    "choices": [
      "Christmas",
      "Epiphany (Jan 6)",
      "New Year",
      "Valentine's"
    ],
    "correct": 1
  },
  {
    "question": "Beads are thrown from?",
    "choices": [
      "Floats",
      "Balconies",
      "Both",
      "Cars"
    ],
    "correct": 2
  },
  {
    "question": "First Mardi Gras in US was in?",
    "choices": [
      "1670",
      "1699",
      "1718",
      "1830"
    ],
    "correct": 1
  },
  {
    "question": "Rio's Carnival rivals?",
    "choices": [
      "Venice",
      "New Orleans",
      "Both",
      "Paris"
    ],
    "correct": 2
  },
  {
    "question": "Brazilian samba schools compete in?",
    "choices": [
      "Rio",
      "Salvador",
      "Both",
      "Sao Paulo"
    ],
    "correct": 0
  },
  {
    "question": "Venice Carnival is famous for?",
    "choices": [
      "Costumes",
      "Masks",
      "Music",
      "Dance"
    ],
    "correct": 1
  },
  {
    "question": "Trinidad Carnival features?",
    "choices": [
      "Calypso",
      "Soca",
      "Both",
      "Reggae"
    ],
    "correct": 2
  },
  {
    "question": "Mardi Gras Indians of NOLA are known for?",
    "choices": [
      "Beadwork suits",
      "Drumming",
      "Singing",
      "All these"
    ],
    "correct": 3
  },
  {
    "question": "Zulu Krewe parades on?",
    "choices": [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday"
    ],
    "correct": 3
  },
  {
    "question": "Rex is the?",
    "choices": [
      "King of Carnival",
      "Queen",
      "Knight",
      "Jester"
    ],
    "correct": 0
  },
  {
    "question": "How many days is Carnival?",
    "choices": [
      "1",
      "Up to 3 weeks",
      "1 week",
      "1 month"
    ],
    "correct": 1
  },
  {
    "question": "Lent lasts how many days?",
    "choices": [
      "20",
      "30",
      "40",
      "50"
    ],
    "correct": 2
  },
  {
    "question": "Mardi Gras parade floats are decorated by?",
    "choices": [
      "Krewes",
      "City",
      "Sponsors",
      "Tourists"
    ],
    "correct": 0
  },
  {
    "question": "King Cake colors mirror Mardi Gras?",
    "choices": [
      "Yes",
      "No",
      "Half",
      "Sometimes"
    ],
    "correct": 0
  },
  {
    "question": "Most parade flow is in?",
    "choices": [
      "French Quarter",
      "Garden District",
      "Uptown via St. Charles",
      "CBD"
    ],
    "correct": 2
  },
  {
    "question": "Mardi Gras was banned in NOLA in?",
    "choices": [
      "1850s",
      "1875",
      "1918 (WWI)",
      "Never"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MardiGrasQuizSettings): MardiGrasQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MardiGrasQuizState, action: MardiGrasQuizAction): MardiGrasQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MardiGrasQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
