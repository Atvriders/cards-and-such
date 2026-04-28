import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KgbQuizSettings { questions: "10" | "20"; }
export interface KgbQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KgbQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What does KGB stand for (in English translation)?",
    "choices": [
      "Committee for State Security",
      "Council of Ministers",
      "Central Government Bureau",
      "Communist Government Brigade"
    ],
    "correct": 0
  },
  {
    "question": "When was the KGB formally established?",
    "choices": [
      "1917",
      "1934",
      "1954",
      "1961"
    ],
    "correct": 2
  },
  {
    "question": "What WAS the KGB's iconic Moscow headquarters?",
    "choices": [
      "The Lubyanka",
      "The Kremlin",
      "Red Square",
      "Bolshoi"
    ],
    "correct": 0
  },
  {
    "question": "Which KGB chief later became Soviet leader?",
    "choices": [
      "Lavrentiy Beria",
      "Yuri Andropov",
      "Vladimir Kryuchkov",
      "Viktor Chebrikov"
    ],
    "correct": 1
  },
  {
    "question": "What 1991 event led to the KGB's dissolution?",
    "choices": [
      "August coup",
      "Berlin Wall fall",
      "Chernobyl",
      "Glasnost"
    ],
    "correct": 0
  },
  {
    "question": "Modern Russian agency descended from KGB foreign branch?",
    "choices": [
      "FSB",
      "GRU",
      "SVR",
      "FAPSI"
    ],
    "correct": 2
  },
  {
    "question": "KGB First Chief Directorate handled what?",
    "choices": [
      "Foreign intel",
      "Internal security",
      "Border guards",
      "Communications"
    ],
    "correct": 0
  },
  {
    "question": "Soviet defector and KGB archivist who took thousands of files?",
    "choices": [
      "Vasili Mitrokhin",
      "Oleg Gordievsky",
      "Stanislav Lunev",
      "Igor Gouzenko"
    ],
    "correct": 0
  },
  {
    "question": "Vladimir Putin served in which KGB department?",
    "choices": [
      "First Directorate (foreign)",
      "Second Directorate",
      "Border Guards",
      "Ninth Directorate"
    ],
    "correct": 0
  },
  {
    "question": "Which KGB predecessor existed from 1917 to 1922?",
    "choices": [
      "NKVD",
      "MGB",
      "Cheka",
      "GPU"
    ],
    "correct": 2
  },
  {
    "question": "Bulgarian dissident killed in London with poisoned umbrella (1978)?",
    "choices": [
      "Vladimir Bukovsky",
      "Georgi Markov",
      "Anatoly Marchenko",
      "Ihor Bondarenko"
    ],
    "correct": 1
  },
  {
    "question": "Which KGB defector worked for MI6 and was rescued in 1985?",
    "choices": [
      "Oleg Penkovsky",
      "Oleg Gordievsky",
      "Anatoly Golitsyn",
      "Yuri Nosenko"
    ],
    "correct": 1
  },
  {
    "question": "Border guards of USSR were under which KGB directorate?",
    "choices": [
      "First",
      "Eighth",
      "Ninth",
      "GUPV"
    ],
    "correct": 3
  },
  {
    "question": "What Russian word means 'wet work' for assassinations?",
    "choices": [
      "mokroye delo",
      "delo dnya",
      "kolkhoz",
      "mokraya rabota"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KgbQuizSettings): KgbQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KgbQuizState, action: KgbQuizAction): KgbQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KgbQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
