import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UsPresidentsMemQuizSettings { questions: "10"; }
export interface UsPresidentsMemQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UsPresidentsMemQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "US Presidents Memory tiles depict?",
    "choices": [
      "Portraits of US Presidents",
      "State flags",
      "Capitals",
      "Random faces"
    ],
    "correct": 0
  },
  {
    "question": "The first US President was?",
    "choices": [
      "George Washington",
      "John Adams",
      "Thomas Jefferson",
      "Andrew Jackson"
    ],
    "correct": 0
  },
  {
    "question": "The 16th President was?",
    "choices": [
      "Abraham Lincoln",
      "Ulysses Grant",
      "James Buchanan",
      "Chester Arthur"
    ],
    "correct": 0
  },
  {
    "question": "Match rule is?",
    "choices": [
      "Two tiles showing the same President",
      "Same color",
      "Same number",
      "Same suit"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages typically?",
    "choices": [
      "6 and up",
      "21 and up",
      "16 and up",
      "Adults only"
    ],
    "correct": 0
  },
  {
    "question": "The 32nd President was?",
    "choices": [
      "Franklin D. Roosevelt",
      "Herbert Hoover",
      "Calvin Coolidge",
      "Dwight Eisenhower"
    ],
    "correct": 0
  },
  {
    "question": "The youngest elected President was?",
    "choices": [
      "John F. Kennedy at 43",
      "Theodore Roosevelt",
      "Bill Clinton",
      "Barack Obama"
    ],
    "correct": 0
  },
  {
    "question": "The deck doubles as a?",
    "choices": [
      "Civics learning tool",
      "Cooking guide",
      "Math drill",
      "Spelling drill"
    ],
    "correct": 0
  },
  {
    "question": "Players win by?",
    "choices": [
      "Collecting the most matched pairs",
      "Highest score by points",
      "Bidding most",
      "Drawing aces"
    ],
    "correct": 0
  },
  {
    "question": "Concentration's other name is?",
    "choices": [
      "Memory or Match-Up",
      "Whist",
      "Skat",
      "Tarock"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: UsPresidentsMemQuizSettings): UsPresidentsMemQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: UsPresidentsMemQuizState, action: UsPresidentsMemQuizAction): UsPresidentsMemQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: UsPresidentsMemQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
