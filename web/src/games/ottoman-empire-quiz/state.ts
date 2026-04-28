import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OttomanEmpireQuizSettings { questions: "10" | "20" | "30"; }
export interface OttomanEmpireQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OttomanEmpireQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Founder of the Ottoman dynasty was?",
    "choices": [
      "Mehmed II",
      "Osman I",
      "Suleiman",
      "Selim"
    ],
    "correct": 1
  },
  {
    "question": "Constantinople fell to Ottomans in?",
    "choices": [
      "1389",
      "1453",
      "1492",
      "1517"
    ],
    "correct": 1
  },
  {
    "question": "Sultan who conquered Constantinople?",
    "choices": [
      "Suleiman the Magnificent",
      "Mehmed II",
      "Selim I",
      "Bayezid"
    ],
    "correct": 1
  },
  {
    "question": "Suleiman the Magnificent ruled in the?",
    "choices": [
      "14th century",
      "16th century",
      "18th century",
      "19th century"
    ],
    "correct": 1
  },
  {
    "question": "Ottoman capital after 1453?",
    "choices": [
      "Bursa",
      "Istanbul",
      "Edirne",
      "Cairo"
    ],
    "correct": 1
  },
  {
    "question": "Janissaries were?",
    "choices": [
      "Merchants",
      "Elite infantry",
      "Court poets",
      "Sailors"
    ],
    "correct": 1
  },
  {
    "question": "Devshirme was a system of?",
    "choices": [
      "Tax collection",
      "Conscription of Christian boys",
      "Land grants",
      "Religion"
    ],
    "correct": 1
  },
  {
    "question": "Battle of Lepanto (1571) was?",
    "choices": [
      "Land battle",
      "Naval defeat for Ottomans",
      "Naval victory",
      "Civil war"
    ],
    "correct": 1
  },
  {
    "question": "Tanzimat reforms began in?",
    "choices": [
      "1700s",
      "1839",
      "1900",
      "1923"
    ],
    "correct": 1
  },
  {
    "question": "Last Ottoman Sultan was?",
    "choices": [
      "Mehmed VI",
      "Suleiman III",
      "Abdulhamid II",
      "Selim III"
    ],
    "correct": 0
  },
  {
    "question": "Empire ended officially in?",
    "choices": [
      "1900",
      "1923",
      "1945",
      "1830"
    ],
    "correct": 1
  },
  {
    "question": "Topkapi Palace is in?",
    "choices": [
      "Cairo",
      "Istanbul",
      "Damascus",
      "Baghdad"
    ],
    "correct": 1
  },
  {
    "question": "Hagia Sophia was converted from church to?",
    "choices": [
      "Palace",
      "Mosque",
      "Library",
      "Hospital"
    ],
    "correct": 1
  },
  {
    "question": "Treaty ending the Ottoman Empire?",
    "choices": [
      "Versailles",
      "Lausanne",
      "Sevres-Lausanne",
      "Trianon"
    ],
    "correct": 2
  },
  {
    "question": "Sultan was both political and?",
    "choices": [
      "Religious leader (Caliph)",
      "Pope",
      "Emperor of Rome",
      "Patriarch"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OttomanEmpireQuizSettings): OttomanEmpireQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OttomanEmpireQuizState, action: OttomanEmpireQuizAction): OttomanEmpireQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OttomanEmpireQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
