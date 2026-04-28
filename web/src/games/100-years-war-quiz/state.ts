import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Q100YearsWarQuizSettings { questions: "10" | "20" | "30"; }
export interface Q100YearsWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Q100YearsWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Hundred Years' War lasted?",
    "choices": [
      "100 years",
      "101 years",
      "116 years",
      "150 years"
    ],
    "correct": 2
  },
  {
    "question": "It started in?",
    "choices": [
      "1337",
      "1346",
      "1415",
      "1453"
    ],
    "correct": 0
  },
  {
    "question": "Battle of Agincourt year?",
    "choices": [
      "1346",
      "1415",
      "1429",
      "1453"
    ],
    "correct": 1
  },
  {
    "question": "Joan of Arc was burned at the stake in?",
    "choices": [
      "1429",
      "1430",
      "1431",
      "1453"
    ],
    "correct": 2
  },
  {
    "question": "English king at Agincourt?",
    "choices": [
      "Edward III",
      "Henry IV",
      "Henry V",
      "Henry VI"
    ],
    "correct": 2
  },
  {
    "question": "Battle of Crecy year?",
    "choices": [
      "1337",
      "1346",
      "1356",
      "1415"
    ],
    "correct": 1
  },
  {
    "question": "English longbow was famous at?",
    "choices": [
      "Sluys",
      "Crecy",
      "Agincourt",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "Battle of Poitiers year?",
    "choices": [
      "1346",
      "1356",
      "1415",
      "1429"
    ],
    "correct": 1
  },
  {
    "question": "Joan of Arc lifted siege of?",
    "choices": [
      "Paris",
      "Orleans",
      "Calais",
      "Bordeaux"
    ],
    "correct": 1
  },
  {
    "question": "War ended in?",
    "choices": [
      "1415",
      "1429",
      "1453",
      "1485"
    ],
    "correct": 2
  },
  {
    "question": "French dauphin became which king?",
    "choices": [
      "Charles V",
      "Charles VI",
      "Charles VII",
      "Louis XI"
    ],
    "correct": 2
  },
  {
    "question": "Treaty ending the war was?",
    "choices": [
      "Troyes",
      "Bretigny",
      "Picquigny",
      "No formal treaty"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Q100YearsWarQuizSettings): Q100YearsWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Q100YearsWarQuizState, action: Q100YearsWarQuizAction): Q100YearsWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Q100YearsWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
