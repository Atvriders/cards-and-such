import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DiscoEraQuizSettings { questions: "10" | "20" | "30"; }
export interface DiscoEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DiscoEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'Saturday Night Fever' starred?",
    "choices": [
      "Sylvester Stallone",
      "John Travolta",
      "Tom Cruise",
      "Burt Reynolds"
    ],
    "correct": 1
  },
  {
    "question": "Studio 54 was located in?",
    "choices": [
      "Los Angeles",
      "Las Vegas",
      "New York",
      "Chicago"
    ],
    "correct": 2
  },
  {
    "question": "'Stayin' Alive' was by?",
    "choices": [
      "Bee Gees",
      "Donna Summer",
      "ABBA",
      "KC and the Sunshine Band"
    ],
    "correct": 0
  },
  {
    "question": "Disco's biggest year was?",
    "choices": [
      "1975",
      "1977",
      "1979",
      "1981"
    ],
    "correct": 2
  },
  {
    "question": "'Disco Demolition Night' occurred in?",
    "choices": [
      "1976",
      "1979",
      "1981",
      "1983"
    ],
    "correct": 1
  },
  {
    "question": "Donna Summer's nickname?",
    "choices": [
      "Disco Diva",
      "Queen of Disco",
      "Disco Lady",
      "Glitter Queen"
    ],
    "correct": 1
  },
  {
    "question": "'Le Freak' was by?",
    "choices": [
      "Chic",
      "Earth Wind Fire",
      "Sister Sledge",
      "KC"
    ],
    "correct": 0
  },
  {
    "question": "Boogie Wonderland was by?",
    "choices": [
      "Bee Gees",
      "Earth Wind & Fire",
      "Chic",
      "ABBA"
    ],
    "correct": 1
  },
  {
    "question": "'YMCA' was by?",
    "choices": [
      "Bee Gees",
      "Village People",
      "ABBA",
      "Chic"
    ],
    "correct": 1
  },
  {
    "question": "Glitter ball is also called?",
    "choices": [
      "Mirror ball",
      "Strobe",
      "Lava lamp",
      "Sphere"
    ],
    "correct": 0
  },
  {
    "question": "ABBA originated in?",
    "choices": [
      "Norway",
      "Sweden",
      "Finland",
      "Denmark"
    ],
    "correct": 1
  },
  {
    "question": "Disco fashion icon: ____ pants",
    "choices": [
      "Bell-bottom",
      "Skinny",
      "Capri",
      "Cargo"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DiscoEraQuizSettings): DiscoEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DiscoEraQuizState, action: DiscoEraQuizAction): DiscoEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DiscoEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
