import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BhopalQuizSettings { questions: "10" | "20" | "30"; }
export interface BhopalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BhopalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Year of Bhopal disaster?",
    "choices": [
      "1982",
      "1983",
      "1984",
      "1985"
    ],
    "correct": 2
  },
  {
    "question": "Country of Bhopal?",
    "choices": [
      "India",
      "Pakistan",
      "Bangladesh",
      "Sri Lanka"
    ],
    "correct": 0
  },
  {
    "question": "Month of disaster?",
    "choices": [
      "October",
      "November",
      "December",
      "January"
    ],
    "correct": 2
  },
  {
    "question": "Company involved?",
    "choices": [
      "DuPont",
      "Dow",
      "Union Carbide",
      "Bayer"
    ],
    "correct": 2
  },
  {
    "question": "Toxic chemical released?",
    "choices": [
      "Chlorine",
      "Methyl isocyanate",
      "Ammonia",
      "Cyanide"
    ],
    "correct": 1
  },
  {
    "question": "Common name for the chemical?",
    "choices": [
      "MIC",
      "BIC",
      "CIC",
      "TIC"
    ],
    "correct": 0
  },
  {
    "question": "Plant produced what product?",
    "choices": [
      "Pesticide",
      "Fertilizer",
      "Explosive",
      "Plastic"
    ],
    "correct": 0
  },
  {
    "question": "Estimated immediate deaths?",
    "choices": [
      "~40",
      "~400",
      "~3,000+",
      "~30,000"
    ],
    "correct": 2
  },
  {
    "question": "Total deaths over years?",
    "choices": [
      "~1,000",
      "~5,000",
      "~15,000+",
      "~50,000"
    ],
    "correct": 2
  },
  {
    "question": "Bhopal is in which Indian state?",
    "choices": [
      "Madhya Pradesh",
      "Uttar Pradesh",
      "Maharashtra",
      "Gujarat"
    ],
    "correct": 0
  },
  {
    "question": "Affected population?",
    "choices": [
      "~50,000",
      "~500,000+",
      "~5,000,000",
      "~50,000"
    ],
    "correct": 1
  },
  {
    "question": "CEO arrested briefly?",
    "choices": [
      "Warren Anderson",
      "Jeff Reeve",
      "Jack Welch",
      "Bob Kennedy"
    ],
    "correct": 0
  },
  {
    "question": "Settlement amount paid by Union Carbide (1989)?",
    "choices": [
      "$47M",
      "$470M",
      "$4.7B",
      "$1B"
    ],
    "correct": 1
  },
  {
    "question": "Plant later acquired by?",
    "choices": [
      "BASF",
      "Dow Chemical",
      "BP",
      "Exxon"
    ],
    "correct": 1
  },
  {
    "question": "Health effects included?",
    "choices": [
      "Blindness",
      "Lung damage",
      "Birth defects",
      "All of the above"
    ],
    "correct": 3
  },
  {
    "question": "Date of the leak?",
    "choices": [
      "December 2-3",
      "December 9-10",
      "December 24-25",
      "November 2-3"
    ],
    "correct": 0
  },
  {
    "question": "Site contamination?",
    "choices": [
      "Cleaned by 1990",
      "Cleaned by 2010",
      "Still contaminated",
      "Was never contaminated"
    ],
    "correct": 2
  },
  {
    "question": "Number of safety systems that failed?",
    "choices": [
      "1",
      "2",
      "Multiple",
      "None"
    ],
    "correct": 2
  },
  {
    "question": "Tank that leaked was numbered?",
    "choices": [
      "E610",
      "T-1",
      "Reactor 4",
      "Vessel A"
    ],
    "correct": 0
  },
  {
    "question": "Was Anderson ever extradited?",
    "choices": [
      "Yes",
      "No",
      "Released on bail",
      "In prison"
    ],
    "correct": 1
  },
  {
    "question": "In what year did the Bhopal disaster occur?",
    "choices": [
      "1982",
      "1983",
      "1984",
      "1985"
    ],
    "correct": 2
  },
  {
    "question": "On what date did the gas leak begin?",
    "choices": [
      "December 2-3",
      "November 14",
      "January 5",
      "October 31"
    ],
    "correct": 0
  },
  {
    "question": "In which country is Bhopal?",
    "choices": [
      "Pakistan",
      "India",
      "Bangladesh",
      "Sri Lanka"
    ],
    "correct": 1
  },
  {
    "question": "Which gas leaked?",
    "choices": [
      "Chlorine",
      "Ammonia",
      "Methyl isocyanate",
      "Phosgene"
    ],
    "correct": 2
  },
  {
    "question": "Which company operated the plant?",
    "choices": [
      "Dow Chemical",
      "Union Carbide",
      "DuPont",
      "BASF"
    ],
    "correct": 1
  },
  {
    "question": "Approximate immediate death toll?",
    "choices": [
      "~500",
      "~3,800",
      "~10,000",
      "~25,000"
    ],
    "correct": 1
  },
  {
    "question": "The plant produced what kind of product?",
    "choices": [
      "Fertilizer",
      "Pesticide",
      "Plastics",
      "Solvents"
    ],
    "correct": 1
  },
  {
    "question": "CEO of Union Carbide arrested briefly?",
    "choices": [
      "Warren Anderson",
      "Jack Welch",
      "Andrew Liveris",
      "Charles Reilly"
    ],
    "correct": 0
  },
  {
    "question": "In what Indian state is Bhopal?",
    "choices": [
      "Maharashtra",
      "Madhya Pradesh",
      "Gujarat",
      "Bihar"
    ],
    "correct": 1
  },
  {
    "question": "Which company later acquired Union Carbide?",
    "choices": [
      "Dow Chemical",
      "BASF",
      "Bayer",
      "Monsanto"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BhopalQuizSettings): BhopalQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BhopalQuizState, action: BhopalQuizAction): BhopalQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BhopalQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
