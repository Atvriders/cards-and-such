import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LakeQuizSettings { questions: "10" | "20"; }
export interface LakeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LakeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "World's largest lake by surface area?",
    "choices": [
      "Lake Superior",
      "Caspian Sea",
      "Lake Victoria",
      "Great Bear Lake"
    ],
    "correct": 1
  },
  {
    "question": "Deepest freshwater lake in the world?",
    "choices": [
      "Lake Tanganyika",
      "Lake Baikal",
      "Lake Superior",
      "Crater Lake"
    ],
    "correct": 1
  },
  {
    "question": "Largest of the Great Lakes by surface area?",
    "choices": [
      "Lake Michigan",
      "Lake Huron",
      "Lake Superior",
      "Lake Erie"
    ],
    "correct": 2
  },
  {
    "question": "Lake Victoria is shared by which countries?",
    "choices": [
      "Kenya, Tanzania, Uganda",
      "Egypt, Sudan, Ethiopia",
      "South Africa, Mozambique, Zimbabwe",
      "Nigeria, Ghana, Cameroon"
    ],
    "correct": 0
  },
  {
    "question": "Which lake straddles the US-Canada border most prominently?",
    "choices": [
      "Lake Superior",
      "Lake Michigan",
      "Lake Tahoe",
      "Crater Lake"
    ],
    "correct": 0
  },
  {
    "question": "Lake Baikal is in which country?",
    "choices": [
      "China",
      "Mongolia",
      "Russia",
      "Kazakhstan"
    ],
    "correct": 2
  },
  {
    "question": "Loch Ness is in which country?",
    "choices": [
      "Ireland",
      "Scotland",
      "Wales",
      "England"
    ],
    "correct": 1
  },
  {
    "question": "Largest lake entirely within the United States?",
    "choices": [
      "Lake Tahoe",
      "Great Salt Lake",
      "Lake Michigan",
      "Lake Okeechobee"
    ],
    "correct": 2
  },
  {
    "question": "The Dead Sea is between which countries?",
    "choices": [
      "Egypt and Israel",
      "Israel and Jordan",
      "Lebanon and Syria",
      "Syria and Iraq"
    ],
    "correct": 1
  },
  {
    "question": "The Caspian Sea is technically a?",
    "choices": [
      "Sea",
      "Lake",
      "Bay",
      "Gulf"
    ],
    "correct": 1
  },
  {
    "question": "Lake Tanganyika is in which continent?",
    "choices": [
      "Asia",
      "Africa",
      "South America",
      "Oceania"
    ],
    "correct": 1
  },
  {
    "question": "Highest navigable lake in the world?",
    "choices": [
      "Lake Titicaca",
      "Lake Geneva",
      "Lake Tahoe",
      "Crater Lake"
    ],
    "correct": 0
  },
  {
    "question": "Lake Titicaca is shared by which countries?",
    "choices": [
      "Peru and Bolivia",
      "Chile and Argentina",
      "Ecuador and Peru",
      "Brazil and Bolivia"
    ],
    "correct": 0
  },
  {
    "question": "Crater Lake is in which US state?",
    "choices": [
      "Washington",
      "Oregon",
      "California",
      "Idaho"
    ],
    "correct": 1
  },
  {
    "question": "Lake Geneva is on the border of which countries?",
    "choices": [
      "France and Italy",
      "Switzerland and France",
      "Switzerland and Germany",
      "Austria and Switzerland"
    ],
    "correct": 1
  },
  {
    "question": "Which Great Lake is entirely within the US?",
    "choices": [
      "Lake Erie",
      "Lake Ontario",
      "Lake Michigan",
      "Lake Superior"
    ],
    "correct": 2
  },
  {
    "question": "The Aral Sea is famous for?",
    "choices": [
      "Saltiness",
      "Shrinking",
      "Coldness",
      "Volcanic origin"
    ],
    "correct": 1
  },
  {
    "question": "Lake Tahoe is on the border of which two states?",
    "choices": [
      "Nevada and California",
      "Nevada and Utah",
      "California and Oregon",
      "Oregon and Idaho"
    ],
    "correct": 0
  },
  {
    "question": "Largest lake in Africa?",
    "choices": [
      "Lake Tanganyika",
      "Lake Malawi",
      "Lake Victoria",
      "Lake Chad"
    ],
    "correct": 2
  },
  {
    "question": "Largest lake in South America?",
    "choices": [
      "Lake Titicaca",
      "Lake Maracaibo",
      "Lake Buenos Aires",
      "Lake Poop\u00f3"
    ],
    "correct": 1
  },
  {
    "question": "Lake Como is in which country?",
    "choices": [
      "Switzerland",
      "France",
      "Italy",
      "Austria"
    ],
    "correct": 2
  },
  {
    "question": "What is the saltiest major body of water on Earth?",
    "choices": [
      "Dead Sea",
      "Great Salt Lake",
      "Don Juan Pond",
      "Caspian Sea"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LakeQuizSettings): LakeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LakeQuizState, action: LakeQuizAction): LakeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LakeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
