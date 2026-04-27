import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NationalParksQuizSettings { questions: "10" | "20"; }
export interface NationalParksQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NationalParksQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First US National Park (1872)?",
    "choices": [
      "Yosemite",
      "Yellowstone",
      "Grand Canyon",
      "Glacier"
    ],
    "correct": 1
  },
  {
    "question": "Yellowstone is mostly in which state?",
    "choices": [
      "Montana",
      "Wyoming",
      "Idaho",
      "Colorado"
    ],
    "correct": 1
  },
  {
    "question": "Old Faithful is a famous geyser in which park?",
    "choices": [
      "Glacier",
      "Yosemite",
      "Yellowstone",
      "Zion"
    ],
    "correct": 2
  },
  {
    "question": "The Grand Canyon is in which state?",
    "choices": [
      "Arizona",
      "Nevada",
      "Utah",
      "New Mexico"
    ],
    "correct": 0
  },
  {
    "question": "Half Dome is a granite peak in which park?",
    "choices": [
      "Yosemite",
      "Sequoia",
      "Kings Canyon",
      "Joshua Tree"
    ],
    "correct": 0
  },
  {
    "question": "Glacier National Park is in which state?",
    "choices": [
      "Alaska",
      "Montana",
      "Washington",
      "Wyoming"
    ],
    "correct": 1
  },
  {
    "question": "Acadia National Park is in which state?",
    "choices": [
      "Vermont",
      "New Hampshire",
      "Maine",
      "Massachusetts"
    ],
    "correct": 2
  },
  {
    "question": "Everglades National Park is in which state?",
    "choices": [
      "Florida",
      "Louisiana",
      "Georgia",
      "Alabama"
    ],
    "correct": 0
  },
  {
    "question": "Zion National Park is in which state?",
    "choices": [
      "Arizona",
      "Utah",
      "Nevada",
      "Colorado"
    ],
    "correct": 1
  },
  {
    "question": "Joshua Tree National Park is in which state?",
    "choices": [
      "Arizona",
      "Nevada",
      "California",
      "New Mexico"
    ],
    "correct": 2
  },
  {
    "question": "Denali National Park is in which state?",
    "choices": [
      "Alaska",
      "Washington",
      "Wyoming",
      "Hawaii"
    ],
    "correct": 0
  },
  {
    "question": "Crater Lake National Park is in which state?",
    "choices": [
      "Washington",
      "Oregon",
      "California",
      "Idaho"
    ],
    "correct": 1
  },
  {
    "question": "Death Valley National Park is in which state(s)?",
    "choices": [
      "California only",
      "California and Nevada",
      "Nevada only",
      "Arizona and Nevada"
    ],
    "correct": 1
  },
  {
    "question": "Great Smoky Mountains National Park spans which two states?",
    "choices": [
      "NC and TN",
      "VA and NC",
      "TN and KY",
      "GA and TN"
    ],
    "correct": 0
  },
  {
    "question": "Mount Rainier is in which state?",
    "choices": [
      "Washington",
      "Oregon",
      "Montana",
      "Wyoming"
    ],
    "correct": 0
  },
  {
    "question": "Banff National Park is in which country?",
    "choices": [
      "United States",
      "Canada",
      "Norway",
      "Switzerland"
    ],
    "correct": 1
  },
  {
    "question": "Serengeti National Park is in which country?",
    "choices": [
      "Kenya",
      "Uganda",
      "Tanzania",
      "Ethiopia"
    ],
    "correct": 2
  },
  {
    "question": "Kruger National Park is in which country?",
    "choices": [
      "Kenya",
      "Tanzania",
      "South Africa",
      "Botswana"
    ],
    "correct": 2
  },
  {
    "question": "Iguaz\u00fa National Park is shared by which countries?",
    "choices": [
      "Argentina and Brazil",
      "Brazil and Paraguay",
      "Argentina and Chile",
      "Peru and Brazil"
    ],
    "correct": 0
  },
  {
    "question": "Gal\u00e1pagos National Park is in which country?",
    "choices": [
      "Peru",
      "Ecuador",
      "Chile",
      "Colombia"
    ],
    "correct": 1
  },
  {
    "question": "Plitvice Lakes National Park is in which country?",
    "choices": [
      "Croatia",
      "Slovenia",
      "Albania",
      "Greece"
    ],
    "correct": 0
  },
  {
    "question": "Machu Picchu is part of which national park?",
    "choices": [
      "Man\u00fa",
      "Huascar\u00e1n",
      "Machu Picchu Historic Sanctuary",
      "Tambopata"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NationalParksQuizSettings): NationalParksQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NationalParksQuizState, action: NationalParksQuizAction): NationalParksQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NationalParksQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
