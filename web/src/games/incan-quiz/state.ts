import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IncanQuizSettings { questions: "10" | "20" | "30"; }
export interface IncanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IncanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Inca Empire was centered in?",
    "choices": [
      "Mexico",
      "Peru/Andes",
      "Brazil",
      "Colombia"
    ],
    "correct": 1
  },
  {
    "question": "Capital of the Inca Empire?",
    "choices": [
      "Lima",
      "Cusco",
      "Quito",
      "Machu Picchu"
    ],
    "correct": 1
  },
  {
    "question": "Inca road network length was?",
    "choices": [
      "1,000 km",
      "Over 30,000 km",
      "5,000 km",
      "100,000 km"
    ],
    "correct": 1
  },
  {
    "question": "Quipus were used for?",
    "choices": [
      "Music",
      "Recording numerical data with knots",
      "Cooking",
      "War"
    ],
    "correct": 1
  },
  {
    "question": "Last great Inca emperor (before conquest)?",
    "choices": [
      "Pachacuti",
      "Atahualpa",
      "Manco Capac",
      "Tupac Amaru"
    ],
    "correct": 1
  },
  {
    "question": "Spanish conqueror of the Incas?",
    "choices": [
      "Cortes",
      "Pizarro",
      "Balboa",
      "Magellan"
    ],
    "correct": 1
  },
  {
    "question": "Inca royal estate famous archaeological site?",
    "choices": [
      "Tikal",
      "Machu Picchu",
      "Teotihuacan",
      "Chichen Itza"
    ],
    "correct": 1
  },
  {
    "question": "Inca staple crops?",
    "choices": [
      "Wheat and rye",
      "Potatoes and maize",
      "Rice and millet",
      "Beans only"
    ],
    "correct": 1
  },
  {
    "question": "Inca sun god?",
    "choices": [
      "Viracocha",
      "Inti",
      "Chasca",
      "Mama Killa"
    ],
    "correct": 1
  },
  {
    "question": "Inca year of conquest?",
    "choices": [
      "1492",
      "1532-1533",
      "1607",
      "1700"
    ],
    "correct": 1
  },
  {
    "question": "Inca terraced agriculture used?",
    "choices": [
      "Drainage stones and canals",
      "Pure flat land",
      "Hydroponics",
      "Crop rotation only"
    ],
    "correct": 0
  },
  {
    "question": "Quechua is?",
    "choices": [
      "A god",
      "A language family of the Andes",
      "A tool",
      "A city"
    ],
    "correct": 1
  },
  {
    "question": "Inca emperor was titled?",
    "choices": [
      "Sapa Inca",
      "Tlatoani",
      "Khan",
      "Caesar"
    ],
    "correct": 0
  },
  {
    "question": "Mit'a was a system of?",
    "choices": [
      "Marriage",
      "Labor tribute",
      "Tax in money",
      "Education"
    ],
    "correct": 1
  },
  {
    "question": "Inca expansion height under?",
    "choices": [
      "Pachacuti",
      "Atahualpa",
      "Manco",
      "Huayna Capac"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: IncanQuizSettings): IncanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: IncanQuizState, action: IncanQuizAction): IncanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: IncanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
