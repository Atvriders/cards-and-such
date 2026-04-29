import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NationalFlagsMemQuizSettings { questions: "10"; }
export interface NationalFlagsMemQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NationalFlagsMemQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "National Flags Memory uses tiles depicting?",
    "choices": [
      "Country flags from around the world",
      "Animals",
      "Numbers",
      "Letters"
    ],
    "correct": 0
  },
  {
    "question": "The base mechanic is?",
    "choices": [
      "Flip two tiles, keep if matching pair",
      "Trick-taking",
      "Bidding",
      "Drafting"
    ],
    "correct": 0
  },
  {
    "question": "Typical player count is?",
    "choices": [
      "2 to 4",
      "Solo only",
      "12 minimum",
      "Always 6"
    ],
    "correct": 0
  },
  {
    "question": "A typical deck size is?",
    "choices": [
      "About 30–60 tiles (15–30 pairs)",
      "10 tiles",
      "200 tiles",
      "5 tiles"
    ],
    "correct": 0
  },
  {
    "question": "Players win by?",
    "choices": [
      "Collecting the most matched pairs",
      "Highest die roll",
      "Bidding most",
      "Reaching center"
    ],
    "correct": 0
  },
  {
    "question": "An incorrect flip means?",
    "choices": [
      "Tiles flipped face-down again",
      "Lose all pairs",
      "Skip 3 turns",
      "Steal opponent pair"
    ],
    "correct": 0
  },
  {
    "question": "The game doubles as?",
    "choices": [
      "A geography learning tool",
      "A math drill",
      "A cooking lesson",
      "A music exercise"
    ],
    "correct": 0
  },
  {
    "question": "Concentration is also called?",
    "choices": [
      "Memory or Match-Up",
      "Whist",
      "Skat",
      "Tarock"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages typically?",
    "choices": [
      "4 and up",
      "21 and up",
      "16 and up",
      "Adults only"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Calm, focused, family-friendly",
      "Tense competitive",
      "Long-form strategy",
      "Adult horror"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: NationalFlagsMemQuizSettings): NationalFlagsMemQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NationalFlagsMemQuizState, action: NationalFlagsMemQuizAction): NationalFlagsMemQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NationalFlagsMemQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
