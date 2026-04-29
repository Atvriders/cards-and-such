import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AntonymPickSettings { questions: "8" | "10" | "12"; }
export interface AntonymPickState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AntonymPickAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Antonym of HOT?",
    "choices": [
      "warm",
      "scalding",
      "cold",
      "mild"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of UP?",
    "choices": [
      "high",
      "raised",
      "down",
      "over"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of LIGHT (weight)?",
    "choices": [
      "airy",
      "feather",
      "heavy",
      "loose"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of DAY?",
    "choices": [
      "dawn",
      "dusk",
      "night",
      "morning"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of OLD?",
    "choices": [
      "aged",
      "wise",
      "young",
      "ancient"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of TRUE?",
    "choices": [
      "correct",
      "fact",
      "false",
      "real"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of BUY?",
    "choices": [
      "purchase",
      "trade",
      "sell",
      "keep"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of FAST?",
    "choices": [
      "quick",
      "rapid",
      "slow",
      "speedy"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of OPEN?",
    "choices": [
      "ajar",
      "wide",
      "closed",
      "loose"
    ],
    "correct": 2
  },
  {
    "question": "Antonym of FULL?",
    "choices": [
      "packed",
      "loaded",
      "empty",
      "heavy"
    ],
    "correct": 2
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AntonymPickSettings): AntonymPickState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AntonymPickState, action: AntonymPickAction): AntonymPickState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AntonymPickState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
