import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VietnamWarQuizSettings { questions: "10" | "20" | "30"; }
export interface VietnamWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VietnamWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tet Offensive year?",
    "choices": [
      "1965",
      "1967",
      "1968",
      "1971"
    ],
    "correct": 2
  },
  {
    "question": "Saigon fell in?",
    "choices": [
      "1973",
      "1974",
      "1975",
      "1976"
    ],
    "correct": 2
  },
  {
    "question": "Who was North Vietnam's leader during the early war?",
    "choices": [
      "Ngo Dinh Diem",
      "Ho Chi Minh",
      "Vo Nguyen Giap",
      "Le Duan"
    ],
    "correct": 1
  },
  {
    "question": "Gulf of Tonkin Resolution was passed in?",
    "choices": [
      "1962",
      "1964",
      "1966",
      "1968"
    ],
    "correct": 1
  },
  {
    "question": "Which president withdrew US troops?",
    "choices": [
      "Johnson",
      "Nixon",
      "Ford",
      "Carter"
    ],
    "correct": 1
  },
  {
    "question": "Khe Sanh was a famous?",
    "choices": [
      "River",
      "US base/siege",
      "Treaty",
      "Air strike"
    ],
    "correct": 1
  },
  {
    "question": "Operation Rolling Thunder was a?",
    "choices": [
      "Ground assault",
      "Bombing campaign",
      "Naval blockade",
      "Diplomatic plan"
    ],
    "correct": 1
  },
  {
    "question": "My Lai is associated with?",
    "choices": [
      "Battle",
      "Massacre",
      "Ceasefire",
      "Treaty"
    ],
    "correct": 1
  },
  {
    "question": "Paris Peace Accords signed in?",
    "choices": [
      "1969",
      "1971",
      "1973",
      "1975"
    ],
    "correct": 2
  },
  {
    "question": "North Vietnam was supported chiefly by?",
    "choices": [
      "USA",
      "Soviet Union and China",
      "France",
      "UK"
    ],
    "correct": 1
  },
  {
    "question": "Saigon was renamed?",
    "choices": [
      "Hanoi",
      "Hai Phong",
      "Ho Chi Minh City",
      "Da Nang"
    ],
    "correct": 2
  },
  {
    "question": "South Vietnam's first president was?",
    "choices": [
      "Diem",
      "Thieu",
      "Ky",
      "Minh"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VietnamWarQuizSettings): VietnamWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VietnamWarQuizState, action: VietnamWarQuizAction): VietnamWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VietnamWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
