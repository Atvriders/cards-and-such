import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KatrinaQuizSettings { questions: "10" | "20" | "30"; }
export interface KatrinaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KatrinaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Year Katrina hit New Orleans?",
    "choices": [
      "2003",
      "2004",
      "2005",
      "2006"
    ],
    "correct": 2
  },
  {
    "question": "Date of landfall on Gulf Coast?",
    "choices": [
      "August 29",
      "September 11",
      "July 4",
      "October 1"
    ],
    "correct": 0
  },
  {
    "question": "Maximum category reached?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "City most devastated?",
    "choices": [
      "Houston",
      "Mobile",
      "New Orleans",
      "Tampa"
    ],
    "correct": 2
  },
  {
    "question": "Major sports venue used as shelter?",
    "choices": [
      "Astrodome",
      "Superdome",
      "Mercedes-Benz",
      "Caesars"
    ],
    "correct": 1
  },
  {
    "question": "U.S. President at the time?",
    "choices": [
      "Bill Clinton",
      "George W. Bush",
      "Barack Obama",
      "Joe Biden"
    ],
    "correct": 1
  },
  {
    "question": "FEMA director who resigned?",
    "choices": [
      "James Witt",
      "Michael Brown",
      "Joe Allbaugh",
      "Craig Fugate"
    ],
    "correct": 1
  },
  {
    "question": "How much of New Orleans flooded?",
    "choices": [
      "10%",
      "30%",
      "50%",
      "80%"
    ],
    "correct": 3
  },
  {
    "question": "Estimated death toll?",
    "choices": [
      "~50",
      "~250",
      "~1800",
      "~10,000"
    ],
    "correct": 2
  },
  {
    "question": "Federal levees were built by?",
    "choices": [
      "FEMA",
      "Army Corps of Engineers",
      "DHS",
      "HUD"
    ],
    "correct": 1
  },
  {
    "question": "Main neighborhood famously flooded?",
    "choices": [
      "French Quarter",
      "Lower Ninth Ward",
      "Garden District",
      "Tremé"
    ],
    "correct": 1
  },
  {
    "question": "Mayor of New Orleans?",
    "choices": [
      "Mitch Landrieu",
      "Ray Nagin",
      "Marc Morial",
      "LaToya Cantrell"
    ],
    "correct": 1
  },
  {
    "question": "Louisiana Governor?",
    "choices": [
      "Bobby Jindal",
      "Kathleen Blanco",
      "Edwin Edwards",
      "John Bel Edwards"
    ],
    "correct": 1
  },
  {
    "question": "Estimated damage cost?",
    "choices": [
      "$10B",
      "$50B",
      "$125B",
      "$500B"
    ],
    "correct": 2
  },
  {
    "question": "Storm formed over what?",
    "choices": [
      "Atlantic",
      "Bahamas",
      "Caribbean",
      "Gulf"
    ],
    "correct": 1
  },
  {
    "question": "Levees failed in how many places?",
    "choices": [
      "1",
      "5",
      "50+",
      "200"
    ],
    "correct": 2
  },
  {
    "question": "Population evacuated by Coast Guard?",
    "choices": [
      "3,000",
      "13,000",
      "33,000",
      "83,000"
    ],
    "correct": 2
  },
  {
    "question": "Storm surge peak?",
    "choices": [
      "10 ft",
      "20 ft",
      "28 ft",
      "50 ft"
    ],
    "correct": 2
  },
  {
    "question": "Heavy hit Mississippi city?",
    "choices": [
      "Tupelo",
      "Biloxi",
      "Jackson",
      "Hattiesburg"
    ],
    "correct": 1
  },
  {
    "question": "Coast Guard motto became?",
    "choices": [
      "Always ready",
      "Honor courage",
      "Brave bravo",
      "Safe haven"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KatrinaQuizSettings): KatrinaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KatrinaQuizState, action: KatrinaQuizAction): KatrinaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KatrinaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
