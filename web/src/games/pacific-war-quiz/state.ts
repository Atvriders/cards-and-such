import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PacificWarQuizSettings { questions: "10" | "20" | "30"; }
export interface PacificWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PacificWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pearl Harbor attack year?",
    "choices": [
      "1939",
      "1940",
      "1941",
      "1942"
    ],
    "correct": 2
  },
  {
    "question": "Battle of Midway year?",
    "choices": [
      "1941",
      "1942",
      "1943",
      "1944"
    ],
    "correct": 1
  },
  {
    "question": "Atomic bomb dropped on Hiroshima?",
    "choices": [
      "1944",
      "1945",
      "1946",
      "1947"
    ],
    "correct": 1
  },
  {
    "question": "US Pacific commander?",
    "choices": [
      "Eisenhower",
      "Nimitz",
      "Patton",
      "Bradley"
    ],
    "correct": 1
  },
  {
    "question": "Japan surrendered aboard which ship?",
    "choices": [
      "USS Arizona",
      "USS Missouri",
      "USS Enterprise",
      "USS Iowa"
    ],
    "correct": 1
  },
  {
    "question": "Battle of Iwo Jima year?",
    "choices": [
      "1944",
      "1945",
      "1946",
      "1947"
    ],
    "correct": 1
  },
  {
    "question": "Doolittle Raid hit?",
    "choices": [
      "Berlin",
      "Tokyo",
      "Manila",
      "Hong Kong"
    ],
    "correct": 1
  },
  {
    "question": "Bataan Death March occurred in?",
    "choices": [
      "China",
      "Philippines",
      "Burma",
      "Indonesia"
    ],
    "correct": 1
  },
  {
    "question": "Battle of Coral Sea year?",
    "choices": [
      "1941",
      "1942",
      "1943",
      "1944"
    ],
    "correct": 1
  },
  {
    "question": "Kamikaze means?",
    "choices": [
      "Sun warrior",
      "Divine wind",
      "Rising sun",
      "Storm fist"
    ],
    "correct": 1
  },
  {
    "question": "MacArthur returned to which country?",
    "choices": [
      "Korea",
      "Japan",
      "Philippines",
      "China"
    ],
    "correct": 2
  },
  {
    "question": "Yamamoto died in?",
    "choices": [
      "Air ambush",
      "Sea battle",
      "Island assault",
      "Disease"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PacificWarQuizSettings): PacificWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PacificWarQuizState, action: PacificWarQuizAction): PacificWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PacificWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
