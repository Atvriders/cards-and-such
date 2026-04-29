import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FibbageXlQuizSettings { questions: "10"; }
export interface FibbageXlQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FibbageXlQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Fibbage XL adds what to original Fibbage?",
    "choices": [
      "~500 more questions",
      "Solo mode",
      "Drawing module",
      "Trick taking"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage XL appeared with which Jackbox pack?",
    "choices": [
      "Pack 1 update / Pack 1",
      "Pack 5",
      "Pack 8",
      "Pack 10"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage XL supports up to?",
    "choices": [
      "3",
      "8",
      "12",
      "20"
    ],
    "correct": 1
  },
  {
    "question": "In Fibbage XL the 'final' round multiplier is?",
    "choices": [
      "x2 points",
      "x3 points",
      "x10",
      "x100"
    ],
    "correct": 0
  },
  {
    "question": "XL stands for?",
    "choices": [
      "Extra Large",
      "X-Loaded",
      "Xtra Lies",
      "X-Late"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage XL prompts include obscure?",
    "choices": [
      "Real-world facts",
      "Math",
      "Map quizzes only",
      "Recipes only"
    ],
    "correct": 0
  },
  {
    "question": "To play, audience joins via?",
    "choices": [
      "Jackbox.tv",
      "App store install",
      "Console only",
      "TV remote"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage encourages writing answers that are?",
    "choices": [
      "Plausible-sounding",
      "Obviously wrong",
      "Random characters",
      "Numbers only"
    ],
    "correct": 0
  },
  {
    "question": "Successful lies score how vs correct?",
    "choices": [
      "Equal/comparable points per duped player",
      "Always less",
      "Ten times more",
      "Zero"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage games are described as which genre?",
    "choices": [
      "Bluffing trivia party",
      "Strategic card",
      "Worker placement",
      "Wargame"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FibbageXlQuizSettings): FibbageXlQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FibbageXlQuizState, action: FibbageXlQuizAction): FibbageXlQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FibbageXlQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
