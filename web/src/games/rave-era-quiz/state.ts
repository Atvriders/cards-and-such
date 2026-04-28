import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RaveEraQuizSettings { questions: "10" | "20" | "30"; }
export interface RaveEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RaveEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Rave culture originated in?",
    "choices": [
      "USA",
      "UK",
      "Germany",
      "France"
    ],
    "correct": 1
  },
  {
    "question": "Iconic rave drug?",
    "choices": [
      "Cocaine",
      "MDMA",
      "Heroin",
      "LSD"
    ],
    "correct": 1
  },
  {
    "question": "'Acid house' originated in?",
    "choices": [
      "Detroit",
      "Chicago",
      "Manchester",
      "Berlin"
    ],
    "correct": 1
  },
  {
    "question": "Famous rave duo Daft Punk are from?",
    "choices": [
      "UK",
      "France",
      "Germany",
      "Belgium"
    ],
    "correct": 1
  },
  {
    "question": "Common rave accessory?",
    "choices": [
      "Glow stick",
      "Lava lamp",
      "Disco ball",
      "Headlamp"
    ],
    "correct": 0
  },
  {
    "question": "'PLUR' stands for?",
    "choices": [
      "Peace Love Unity Respect",
      "Party Lights Use Right",
      "Pop Like Up Right",
      "Pulse Light Unity Rave"
    ],
    "correct": 0
  },
  {
    "question": "Detroit techno pioneer?",
    "choices": [
      "Juan Atkins",
      "David Guetta",
      "Skrillex",
      "Tiesto"
    ],
    "correct": 0
  },
  {
    "question": "UK 'Second Summer of Love'?",
    "choices": [
      "1985",
      "1988",
      "1992",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Goa is famous for which rave style?",
    "choices": [
      "Trance",
      "Garage",
      "Drum and bass",
      "Dubstep"
    ],
    "correct": 0
  },
  {
    "question": "Drum and bass BPM is roughly?",
    "choices": [
      "100",
      "130",
      "160",
      "200"
    ],
    "correct": 2
  },
  {
    "question": "Famous UK rave magazine?",
    "choices": [
      "Mixmag",
      "Rolling Stone",
      "NME",
      "SPIN"
    ],
    "correct": 0
  },
  {
    "question": "Aphex Twin is associated with?",
    "choices": [
      "IDM",
      "Hip hop",
      "Country",
      "Reggae"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RaveEraQuizSettings): RaveEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RaveEraQuizState, action: RaveEraQuizAction): RaveEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RaveEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
