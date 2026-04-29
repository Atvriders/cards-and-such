import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TautologyQuizSettings { questions: "8" | "10" | "12"; }
export interface TautologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TautologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tautology?",
    "choices": [
      "free gift",
      "red ball",
      "hot soup",
      "cold day"
    ],
    "correct": 0
  },
  {
    "question": "Tautology?",
    "choices": [
      "green grass",
      "cold day",
      "new innovation",
      "tall tree"
    ],
    "correct": 2
  },
  {
    "question": "Tautology?",
    "choices": [
      "ATM machine",
      "big book",
      "loud noise",
      "hot coffee"
    ],
    "correct": 0
  },
  {
    "question": "Tautology?",
    "choices": [
      "close proximity",
      "sharp knife",
      "red apple",
      "blue car"
    ],
    "correct": 0
  },
  {
    "question": "Tautology?",
    "choices": [
      "PIN number",
      "green tree",
      "round ball",
      "cold ice"
    ],
    "correct": 0
  },
  {
    "question": "Tautology?",
    "choices": [
      "nice day",
      "past history",
      "blue sky",
      "open door"
    ],
    "correct": 1
  },
  {
    "question": "Tautology?",
    "choices": [
      "future plans",
      "large house",
      "quick run",
      "sad book"
    ],
    "correct": 0
  },
  {
    "question": "Tautology?",
    "choices": [
      "unexpected surprise",
      "green leaf",
      "wet pool",
      "sharp pencil"
    ],
    "correct": 0
  },
  {
    "question": "Tautology?",
    "choices": [
      "repeat again",
      "old song",
      "bright sun",
      "quiet room"
    ],
    "correct": 0
  },
  {
    "question": "Tautology?",
    "choices": [
      "frozen ice",
      "new song",
      "old book",
      "bright moon"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TautologyQuizSettings): TautologyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TautologyQuizState, action: TautologyQuizAction): TautologyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TautologyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
