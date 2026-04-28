import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GulfWarQuizSettings { questions: "10" | "20" | "30"; }
export interface GulfWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GulfWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Iraq invaded Kuwait in?",
    "choices": [
      "August 1989",
      "August 1990",
      "August 1991",
      "August 1992"
    ],
    "correct": 1
  },
  {
    "question": "US ground operation called?",
    "choices": [
      "Desert Shield",
      "Desert Storm",
      "Desert Sabre",
      "Desert Wind"
    ],
    "correct": 1
  },
  {
    "question": "Coalition commander was?",
    "choices": [
      "Powell",
      "Schwarzkopf",
      "McChrystal",
      "Petraeus"
    ],
    "correct": 1
  },
  {
    "question": "Saddam Hussein led?",
    "choices": [
      "Iran",
      "Iraq",
      "Syria",
      "Saudi Arabia"
    ],
    "correct": 1
  },
  {
    "question": "US president during war?",
    "choices": [
      "Reagan",
      "George H.W. Bush",
      "Clinton",
      "George W. Bush"
    ],
    "correct": 1
  },
  {
    "question": "Air war length?",
    "choices": [
      "1 week",
      "6 weeks",
      "3 months",
      "6 months"
    ],
    "correct": 1
  },
  {
    "question": "Ground war length?",
    "choices": [
      "100 days",
      "100 hours",
      "1 month",
      "6 months"
    ],
    "correct": 1
  },
  {
    "question": "Highway of Death was at?",
    "choices": [
      "Basra",
      "Kuwait City",
      "Baghdad",
      "Riyadh"
    ],
    "correct": 0
  },
  {
    "question": "UN resolution authorizing force?",
    "choices": [
      "660",
      "678",
      "687",
      "1441"
    ],
    "correct": 1
  },
  {
    "question": "US 'Patriot' was a?",
    "choices": [
      "Plane",
      "Missile defense",
      "Tank",
      "Helicopter"
    ],
    "correct": 1
  },
  {
    "question": "Iraq used what notable weapon?",
    "choices": [
      "Cruise missile",
      "SCUD missile",
      "Stealth bomb",
      "Hyperbomb"
    ],
    "correct": 1
  },
  {
    "question": "Stealth fighter used was?",
    "choices": [
      "F-15",
      "F-16",
      "F-117",
      "F-22"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GulfWarQuizSettings): GulfWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GulfWarQuizState, action: GulfWarQuizAction): GulfWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GulfWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
