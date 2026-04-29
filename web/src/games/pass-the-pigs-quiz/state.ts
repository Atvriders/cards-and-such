import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PassThePigsQuizSettings { questions: "10"; }
export interface PassThePigsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PassThePigsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pass the Pigs uses?",
    "choices": [
      "Two rubber pig figurines as dice",
      "Two D6 dice",
      "Five D6",
      "Cards"
    ],
    "correct": 0
  },
  {
    "question": "The first to reach 100 points wins, but?",
    "choices": [
      "A 'Pig Out' (1 dot, 1 side) loses turn score",
      "No penalty",
      "All-in or fold",
      "First to 0"
    ],
    "correct": 0
  },
  {
    "question": "A 'Sider' position scores?",
    "choices": [
      "0 (the basic landing position)",
      "10 always",
      "20",
      "Game over"
    ],
    "correct": 0
  },
  {
    "question": "A 'Razorback' is when a pig?",
    "choices": [
      "Lands on its back",
      "Lands on its snout",
      "Stands on legs",
      "Falls off table"
    ],
    "correct": 0
  },
  {
    "question": "Pass the Pigs was designed by?",
    "choices": [
      "David Moffat",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Pass the Pigs first appeared as?",
    "choices": [
      "PigMania in 1977",
      "1880s",
      "2010s",
      "2050"
    ],
    "correct": 0
  },
  {
    "question": "A 'Leaning Jowler' (rare) scores?",
    "choices": [
      "60 points (very rare)",
      "1 point",
      "10 points",
      "0"
    ],
    "correct": 0
  },
  {
    "question": "The 'Oinker' or 'Piggy Back' is when?",
    "choices": [
      "Pigs touch each other (loses ALL points)",
      "Pigs face same way",
      "Pigs pile up",
      "Pigs roll same"
    ],
    "correct": 0
  },
  {
    "question": "Pass the Pigs is published by?",
    "choices": [
      "Winning Moves",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "2 to 6",
      "Solo only",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PassThePigsQuizSettings): PassThePigsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PassThePigsQuizState, action: PassThePigsQuizAction): PassThePigsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PassThePigsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
