import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HappySalmonQuizSettings { questions: "10"; }
export interface HappySalmonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HappySalmonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Happy Salmon's four shouted actions are?",
    "choices": [
      "Happy Salmon, High Five, Pound It, Switcheroo",
      "Pass, Stop, Bid, Bow",
      "Up, Down, Left, Right",
      "Clap, Sing, Skip, Spin"
    ],
    "correct": 0
  },
  {
    "question": "Players win by?",
    "choices": [
      "Discarding all cards in their hand first",
      "Most cards collected",
      "Highest score",
      "Last sitting"
    ],
    "correct": 0
  },
  {
    "question": "Happy Salmon was originally designed by?",
    "choices": [
      "Ken Gruhl & Quentin Weir",
      "Reiner Knizia",
      "Alan R. Moon",
      "Friedemann Friese"
    ],
    "correct": 0
  },
  {
    "question": "Happy Salmon is published by?",
    "choices": [
      "North Star Games / Exploding Kittens edition",
      "Hasbro",
      "WizKids",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Typical play time is?",
    "choices": [
      "About 90 seconds to 2 minutes",
      "An hour",
      "30 minutes",
      "10 hours"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "3 to 6 (or more in expansion)",
      "Solo only",
      "Exactly 2",
      "10 minimum"
    ],
    "correct": 0
  },
  {
    "question": "Cards are housed in a?",
    "choices": [
      "Soft fabric pouch",
      "Hard plastic case",
      "Cardboard tube only",
      "Leather wallet"
    ],
    "correct": 0
  },
  {
    "question": "When you 'fish' for a Happy Salmon you?",
    "choices": [
      "Hook elbows and shake forearms",
      "Bow deeply",
      "Sing a song",
      "Sit down"
    ],
    "correct": 0
  },
  {
    "question": "The game's tone is?",
    "choices": [
      "Loud, frantic, joyful",
      "Quiet strategy",
      "Slow puzzle",
      "Solo meditation"
    ],
    "correct": 0
  },
  {
    "question": "Recommended age is roughly?",
    "choices": [
      "6 and up",
      "21 and up only",
      "12 and up only",
      "30 and up"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HappySalmonQuizSettings): HappySalmonQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HappySalmonQuizState, action: HappySalmonQuizAction): HappySalmonQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HappySalmonQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
