import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SevenSummitsQuizSettings { questions: "10" | "20" | "30"; }
export interface SevenSummitsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SevenSummitsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Highest peak in Asia?",
    "choices": [
      "K2",
      "Everest",
      "Lhotse",
      "Manaslu"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in South America?",
    "choices": [
      "Aconcagua",
      "Huascarán",
      "Chimborazo",
      "Ojos del Salado"
    ],
    "correct": 0
  },
  {
    "question": "Highest peak in North America?",
    "choices": [
      "Logan",
      "Denali",
      "Whitney",
      "Pico de Orizaba"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in Africa?",
    "choices": [
      "Kenya",
      "Kilimanjaro",
      "Stanley",
      "Margherita"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in Europe?",
    "choices": [
      "Mont Blanc",
      "Elbrus",
      "Matterhorn",
      "Triglav"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in Antarctica?",
    "choices": [
      "Sidley",
      "Vinson",
      "Kirkpatrick",
      "Tyree"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in Australia (Bass list)?",
    "choices": [
      "Kosciuszko",
      "Townsend",
      "Bogong",
      "Twynam"
    ],
    "correct": 0
  },
  {
    "question": "Highest peak in Oceania (Messner list)?",
    "choices": [
      "Carstensz Pyramid",
      "Mauna Kea",
      "Kosciuszko",
      "Cook"
    ],
    "correct": 0
  },
  {
    "question": "Aconcagua is in?",
    "choices": [
      "Chile",
      "Argentina",
      "Peru",
      "Bolivia"
    ],
    "correct": 1
  },
  {
    "question": "Denali is in?",
    "choices": [
      "Yukon",
      "Alaska",
      "BC",
      "Alberta"
    ],
    "correct": 1
  },
  {
    "question": "Kilimanjaro country?",
    "choices": [
      "Kenya",
      "Tanzania",
      "Uganda",
      "Rwanda"
    ],
    "correct": 1
  },
  {
    "question": "Elbrus country?",
    "choices": [
      "Russia",
      "Georgia",
      "Turkey",
      "Ukraine"
    ],
    "correct": 0
  },
  {
    "question": "Carstensz is in?",
    "choices": [
      "Australia",
      "Indonesia",
      "PNG",
      "Philippines"
    ],
    "correct": 1
  },
  {
    "question": "Approximate height of Everest?",
    "choices": [
      "7,000 m",
      "8,000 m",
      "8,849 m",
      "9,500 m"
    ],
    "correct": 2
  },
  {
    "question": "Aconcagua height?",
    "choices": [
      "~5,000 m",
      "~6,961 m",
      "~8,000 m",
      "~7,500 m"
    ],
    "correct": 1
  },
  {
    "question": "Denali height?",
    "choices": [
      "~4,000 m",
      "~6,190 m",
      "~5,000 m",
      "~8,000 m"
    ],
    "correct": 1
  },
  {
    "question": "Kilimanjaro height?",
    "choices": [
      "~3,000 m",
      "~5,895 m",
      "~7,000 m",
      "~6,500 m"
    ],
    "correct": 1
  },
  {
    "question": "First person to complete the Seven Summits?",
    "choices": [
      "Dick Bass",
      "Reinhold Messner",
      "Pat Morrow",
      "Ed Viesturs"
    ],
    "correct": 0
  },
  {
    "question": "Year Bass completed?",
    "choices": [
      "1985",
      "1990",
      "1995",
      "1980"
    ],
    "correct": 0
  },
  {
    "question": "Bass list uses which Australian peak?",
    "choices": [
      "Kosciuszko",
      "Carstensz",
      "Cook",
      "Wilhelm"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SevenSummitsQuizSettings): SevenSummitsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SevenSummitsQuizState, action: SevenSummitsQuizAction): SevenSummitsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SevenSummitsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
