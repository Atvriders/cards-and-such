import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MedicalDiscoveriesQuizSettings { questions: "10" | "20" | "30"; }
export interface MedicalDiscoveriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MedicalDiscoveriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Penicillin was discovered by?",
    "choices": [
      "Pasteur",
      "Fleming",
      "Salk",
      "Lister"
    ],
    "correct": 1
  },
  {
    "question": "Year penicillin was discovered?",
    "choices": [
      "1900",
      "1928",
      "1945",
      "1962"
    ],
    "correct": 1
  },
  {
    "question": "Polio vaccine pioneer?",
    "choices": [
      "Pasteur",
      "Salk",
      "Koch",
      "Banting"
    ],
    "correct": 1
  },
  {
    "question": "Insulin was first isolated by?",
    "choices": [
      "Pasteur",
      "Banting and Best",
      "Salk",
      "Fleming"
    ],
    "correct": 1
  },
  {
    "question": "X-rays were discovered by?",
    "choices": [
      "Edison",
      "Roentgen",
      "Curie",
      "Tesla"
    ],
    "correct": 1
  },
  {
    "question": "First successful heart transplant?",
    "choices": [
      "1950",
      "1967",
      "1980",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Smallpox vaccine pioneer?",
    "choices": [
      "Jenner",
      "Pasteur",
      "Koch",
      "Lister"
    ],
    "correct": 0
  },
  {
    "question": "DNA double helix discoverers?",
    "choices": [
      "Mendel and Lamarck",
      "Watson and Crick",
      "Pauling alone",
      "Darwin"
    ],
    "correct": 1
  },
  {
    "question": "First anesthetic widely used?",
    "choices": [
      "Aspirin",
      "Ether",
      "Cocaine",
      "Morphine"
    ],
    "correct": 1
  },
  {
    "question": "Antibiotic streptomycin discovered by?",
    "choices": [
      "Waksman",
      "Fleming",
      "Salk",
      "Pasteur"
    ],
    "correct": 0
  },
  {
    "question": "Pasteurization is named after?",
    "choices": [
      "Louis Pasteur",
      "Robert Pasteur",
      "Mary Pasteur",
      "James Pasteur"
    ],
    "correct": 0
  },
  {
    "question": "First MRI scanner came in the?",
    "choices": [
      "1950s",
      "1970s",
      "1990s",
      "2010s"
    ],
    "correct": 1
  },
  {
    "question": "First test-tube baby born in?",
    "choices": [
      "1968",
      "1978",
      "1988",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "Stethoscope was invented by?",
    "choices": [
      "Laennec",
      "Fleming",
      "Lister",
      "Pasteur"
    ],
    "correct": 0
  },
  {
    "question": "First successful organ transplant was a?",
    "choices": [
      "Heart",
      "Kidney (1954)",
      "Liver",
      "Lung"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MedicalDiscoveriesQuizSettings): MedicalDiscoveriesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MedicalDiscoveriesQuizState, action: MedicalDiscoveriesQuizAction): MedicalDiscoveriesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MedicalDiscoveriesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
