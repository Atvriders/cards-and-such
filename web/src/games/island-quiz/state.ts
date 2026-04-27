import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IslandQuizSettings { questions: "10" | "20"; }
export interface IslandQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IslandQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "World's largest island?",
    "choices": [
      "New Guinea",
      "Borneo",
      "Madagascar",
      "Greenland"
    ],
    "correct": 3
  },
  {
    "question": "Largest island in the Mediterranean?",
    "choices": [
      "Sardinia",
      "Sicily",
      "Corsica",
      "Cyprus"
    ],
    "correct": 1
  },
  {
    "question": "The island of Madagascar is off the coast of which continent?",
    "choices": [
      "South America",
      "Asia",
      "Africa",
      "Antarctica"
    ],
    "correct": 2
  },
  {
    "question": "Borneo is divided among which countries?",
    "choices": [
      "Indonesia, Malaysia, Brunei",
      "Indonesia, Philippines, Vietnam",
      "Malaysia, Singapore, Thailand",
      "India, Sri Lanka, Bangladesh"
    ],
    "correct": 0
  },
  {
    "question": "Iceland is in which ocean?",
    "choices": [
      "Pacific",
      "Atlantic",
      "Arctic",
      "Indian"
    ],
    "correct": 1
  },
  {
    "question": "Largest island of Japan?",
    "choices": [
      "Hokkaido",
      "Honshu",
      "Kyushu",
      "Shikoku"
    ],
    "correct": 1
  },
  {
    "question": "Easter Island belongs to which country?",
    "choices": [
      "Chile",
      "Peru",
      "Ecuador",
      "France"
    ],
    "correct": 0
  },
  {
    "question": "Which is NOT one of the British Isles?",
    "choices": [
      "Ireland",
      "Isle of Man",
      "Iceland",
      "Great Britain"
    ],
    "correct": 2
  },
  {
    "question": "Hawaii is in which ocean?",
    "choices": [
      "Atlantic",
      "Indian",
      "Arctic",
      "Pacific"
    ],
    "correct": 3
  },
  {
    "question": "Which island contains the country of Cuba?",
    "choices": [
      "Cuba (itself)",
      "Hispaniola",
      "Jamaica",
      "Puerto Rico"
    ],
    "correct": 0
  },
  {
    "question": "Hispaniola is shared by which two countries?",
    "choices": [
      "Cuba and Jamaica",
      "Haiti and Dominican Republic",
      "Puerto Rico and Cuba",
      "Bahamas and Cuba"
    ],
    "correct": 1
  },
  {
    "question": "The Gal\u00e1pagos Islands belong to which country?",
    "choices": [
      "Peru",
      "Ecuador",
      "Colombia",
      "Mexico"
    ],
    "correct": 1
  },
  {
    "question": "Largest island in the Caribbean?",
    "choices": [
      "Jamaica",
      "Cuba",
      "Hispaniola",
      "Puerto Rico"
    ],
    "correct": 1
  },
  {
    "question": "Which large island is north of Australia?",
    "choices": [
      "Java",
      "New Guinea",
      "Sumatra",
      "Sulawesi"
    ],
    "correct": 1
  },
  {
    "question": "The Falkland Islands are in which ocean?",
    "choices": [
      "Atlantic",
      "Pacific",
      "Indian",
      "Southern"
    ],
    "correct": 0
  },
  {
    "question": "Greenland is autonomous within which country?",
    "choices": [
      "Norway",
      "Denmark",
      "Iceland",
      "Sweden"
    ],
    "correct": 1
  },
  {
    "question": "Which UK city is on the Isle of Wight?",
    "choices": [
      "Newport",
      "Cardiff",
      "Belfast",
      "Liverpool"
    ],
    "correct": 0
  },
  {
    "question": "Which island is the home of komodo dragons?",
    "choices": [
      "Bali",
      "Komodo",
      "Java",
      "Sumatra"
    ],
    "correct": 1
  },
  {
    "question": "Tasmania is part of which country?",
    "choices": [
      "New Zealand",
      "Australia",
      "Indonesia",
      "Papua New Guinea"
    ],
    "correct": 1
  },
  {
    "question": "The Canary Islands belong to which country?",
    "choices": [
      "Portugal",
      "Morocco",
      "Spain",
      "Italy"
    ],
    "correct": 2
  },
  {
    "question": "Which chain includes Honolulu?",
    "choices": [
      "Aleutian Islands",
      "Hawaiian Islands",
      "Marshall Islands",
      "Mariana Islands"
    ],
    "correct": 1
  },
  {
    "question": "Which island is shared by Indonesia and Papua New Guinea?",
    "choices": [
      "Borneo",
      "Java",
      "Sumatra",
      "New Guinea"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: IslandQuizSettings): IslandQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: IslandQuizState, action: IslandQuizAction): IslandQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: IslandQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
