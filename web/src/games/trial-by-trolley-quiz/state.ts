import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrialByTrolleyQuizSettings { questions: "10"; }
export interface TrialByTrolleyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrialByTrolleyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Trial by Trolley is published by?",
    "choices": [
      "Cyanide & Happiness / Skybound",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "The judge in Trial by Trolley is called the?",
    "choices": [
      "Conductor",
      "Captain",
      "Director",
      "Engineer"
    ],
    "correct": 0
  },
  {
    "question": "Two teams plead to save?",
    "choices": [
      "Their track of innocents from the trolley",
      "A briefcase",
      "A horse",
      "A flag"
    ],
    "correct": 0
  },
  {
    "question": "Card types include?",
    "choices": [
      "Innocent, Guilty, and Modifier cards",
      "Spell, Action, and Land",
      "Suit cards only",
      "Number cards only"
    ],
    "correct": 0
  },
  {
    "question": "Modifier cards typically?",
    "choices": [
      "Twist a victim's qualities for argument",
      "Add coins",
      "Speed up trolley",
      "Skip turn"
    ],
    "correct": 0
  },
  {
    "question": "The Conductor role?",
    "choices": [
      "Rotates each round",
      "Is permanent",
      "Chosen by die roll only",
      "Auctioned"
    ],
    "correct": 0
  },
  {
    "question": "Trial by Trolley adapts which thought experiment?",
    "choices": [
      "The Trolley Problem",
      "Schrödinger's cat",
      "Pascal's wager",
      "Plato's cave"
    ],
    "correct": 0
  },
  {
    "question": "Players win by?",
    "choices": [
      "Convincing the Conductor to spare their track",
      "Highest score by points",
      "First to empty hand",
      "Memorising track"
    ],
    "correct": 0
  },
  {
    "question": "The game's tone is?",
    "choices": [
      "Dark comedy and adult humour",
      "Gentle children's",
      "Pure strategy",
      "Educational only"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "About 3 to 13",
      "Solo only",
      "Exactly 2",
      "10 minimum"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrialByTrolleyQuizSettings): TrialByTrolleyQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrialByTrolleyQuizState, action: TrialByTrolleyQuizAction): TrialByTrolleyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrialByTrolleyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
