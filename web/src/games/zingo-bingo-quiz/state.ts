import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ZingoBingoQuizSettings { questions: "10"; }
export interface ZingoBingoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ZingoBingoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Zingo! is published by?",
    "choices": [
      "ThinkFun",
      "Hasbro",
      "Mattel",
      "Z-Man"
    ],
    "correct": 0
  },
  {
    "question": "Zingo!'s defining accessory is the?",
    "choices": [
      "Zinger tile dispenser",
      "Sand timer",
      "Spinner",
      "Dice"
    ],
    "correct": 0
  },
  {
    "question": "The Zinger dispenses?",
    "choices": [
      "Two tiles at a time onto the table",
      "One die",
      "A card",
      "A coin"
    ],
    "correct": 0
  },
  {
    "question": "Players win by?",
    "choices": [
      "Filling their card first and yelling Zingo",
      "Highest score",
      "Bidding",
      "Trump take"
    ],
    "correct": 0
  },
  {
    "question": "Tiles show?",
    "choices": [
      "Pictures and matching words",
      "Numbers only",
      "Trump",
      "Suits"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages?",
    "choices": [
      "4 and up",
      "Adults only",
      "21+",
      "16+"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "2 to 6 (or 8)",
      "Solo only",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "About 15 minutes",
      "An hour",
      "All day",
      "Under 1 second"
    ],
    "correct": 0
  },
  {
    "question": "Educational benefits include?",
    "choices": [
      "Sight-word reading and matching",
      "Calculus",
      "Auction strategy",
      "Coding"
    ],
    "correct": 0
  },
  {
    "question": "Zingo! has won?",
    "choices": [
      "Multiple Toy of the Year-style awards",
      "An Oscar",
      "A Grammy",
      "A Tony"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ZingoBingoQuizSettings): ZingoBingoQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ZingoBingoQuizState, action: ZingoBingoQuizAction): ZingoBingoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ZingoBingoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
