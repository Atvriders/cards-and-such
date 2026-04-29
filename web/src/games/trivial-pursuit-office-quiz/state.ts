import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitOfficeQuizSettings { questions: "10"; }
export interface TrivialPursuitOfficeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitOfficeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Office (US) is set in which Pennsylvania town?",
    "choices": [
      "Wilkes-Barre",
      "Scranton",
      "Allentown",
      "Erie"
    ],
    "correct": 1
  },
  {
    "question": "Michael Scott is played by?",
    "choices": [
      "Steve Carell",
      "Rainn Wilson",
      "John Krasinski",
      "Ed Helms"
    ],
    "correct": 0
  },
  {
    "question": "Dwight's farm grows mostly?",
    "choices": [
      "Soy",
      "Beets",
      "Corn",
      "Potatoes"
    ],
    "correct": 1
  },
  {
    "question": "Pam's last name (married) is?",
    "choices": [
      "Beesly",
      "Halpert",
      "Schrute",
      "Bernard"
    ],
    "correct": 1
  },
  {
    "question": "Jim and Pam's wedding takes place at?",
    "choices": [
      "Niagara Falls",
      "Disney World",
      "Casino Night",
      "Sandals"
    ],
    "correct": 0
  },
  {
    "question": "Stanley loves which crossword?",
    "choices": [
      "Sudoku",
      "Pretzel Day",
      "Crossword puzzles in pretzel-day cap",
      "USA Today"
    ],
    "correct": 0
  },
  {
    "question": "Andy Bernard attended which fictional college often referenced?",
    "choices": [
      "Harvard",
      "Cornell",
      "Princeton",
      "Yale"
    ],
    "correct": 1
  },
  {
    "question": "Threat Level Midnight is whose film?",
    "choices": [
      "Andy",
      "Michael",
      "Dwight",
      "Toby"
    ],
    "correct": 1
  },
  {
    "question": "Dunder Mifflin sells primarily?",
    "choices": [
      "Computers",
      "Paper",
      "Beets",
      "Tractors"
    ],
    "correct": 1
  },
  {
    "question": "The Office US ran for how many seasons?",
    "choices": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrivialPursuitOfficeQuizSettings): TrivialPursuitOfficeQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrivialPursuitOfficeQuizState, action: TrivialPursuitOfficeQuizAction): TrivialPursuitOfficeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrivialPursuitOfficeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
