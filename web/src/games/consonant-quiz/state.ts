import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ConsonantQuizSettings { questions: "8" | "10" | "12"; }
export interface ConsonantQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ConsonantQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "A_PLE — fill consonant.",
    "choices": [
      "P",
      "B",
      "D",
      "T"
    ],
    "correct": 0
  },
  {
    "question": "BAT_LE — fill consonant.",
    "choices": [
      "P",
      "T",
      "D",
      "L"
    ],
    "correct": 1
  },
  {
    "question": "RA__IT — fill consonants.",
    "choices": [
      "BB",
      "DD",
      "TT",
      "SS"
    ],
    "correct": 0
  },
  {
    "question": "WI_DOW — fill consonant.",
    "choices": [
      "N",
      "D",
      "T",
      "M"
    ],
    "correct": 0
  },
  {
    "question": "BOO_ — most natural?",
    "choices": [
      "K",
      "G",
      "D",
      "T"
    ],
    "correct": 0
  },
  {
    "question": "SO_ER — fill consonant.",
    "choices": [
      "B",
      "C",
      "P",
      "T"
    ],
    "correct": 0
  },
  {
    "question": "SI_TER — fill consonant.",
    "choices": [
      "S",
      "C",
      "X",
      "Z"
    ],
    "correct": 0
  },
  {
    "question": "DO_TOR — fill consonant.",
    "choices": [
      "C",
      "K",
      "G",
      "T"
    ],
    "correct": 0
  },
  {
    "question": "WI__ER — fill consonants.",
    "choices": [
      "NN",
      "NT",
      "MM",
      "ND"
    ],
    "correct": 1
  },
  {
    "question": "MOO__I_ — single consonant.",
    "choices": [
      "P",
      "D",
      "M",
      "Z"
    ],
    "correct": 2
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ConsonantQuizSettings): ConsonantQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ConsonantQuizState, action: ConsonantQuizAction): ConsonantQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ConsonantQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
