import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitDisneyQuizSettings { questions: "10"; }
export interface TrivialPursuitDisneyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitDisneyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Walt Disney founded his studio with whom?",
    "choices": [
      "Roy Disney",
      "Mickey Avery",
      "Mickey Mouse",
      "Ub Iwerks alone"
    ],
    "correct": 0
  },
  {
    "question": "Disney's first feature animation was?",
    "choices": [
      "Snow White",
      "Pinocchio",
      "Bambi",
      "Dumbo"
    ],
    "correct": 0
  },
  {
    "question": "Snow White released in which year?",
    "choices": [
      "1932",
      "1937",
      "1941",
      "1948"
    ],
    "correct": 1
  },
  {
    "question": "Mickey Mouse first appeared in?",
    "choices": [
      "Steamboat Willie",
      "Plane Crazy",
      "The Karnival Kid",
      "Mickey's Christmas Carol"
    ],
    "correct": 1
  },
  {
    "question": "Disneyland opened in what year?",
    "choices": [
      "1950",
      "1955",
      "1960",
      "1971"
    ],
    "correct": 1
  },
  {
    "question": "Walt Disney World opened in?",
    "choices": [
      "1965",
      "1971",
      "1976",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "'A Whole New World' is from which film?",
    "choices": [
      "Aladdin",
      "The Little Mermaid",
      "Tangled",
      "Mulan"
    ],
    "correct": 0
  },
  {
    "question": "Pixar's first feature film was?",
    "choices": [
      "Toy Story",
      "A Bug's Life",
      "Monsters Inc",
      "Finding Nemo"
    ],
    "correct": 0
  },
  {
    "question": "Frozen released in which year?",
    "choices": [
      "2010",
      "2013",
      "2016",
      "2019"
    ],
    "correct": 1
  },
  {
    "question": "Which is NOT a Disney princess?",
    "choices": [
      "Tiana",
      "Mulan",
      "Moana",
      "Asuka"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrivialPursuitDisneyQuizSettings): TrivialPursuitDisneyQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrivialPursuitDisneyQuizState, action: TrivialPursuitDisneyQuizAction): TrivialPursuitDisneyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrivialPursuitDisneyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
