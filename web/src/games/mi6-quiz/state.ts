import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Mi6QuizSettings { questions: "10" | "20"; }
export interface Mi6QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Mi6QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What is MI6 officially called today?",
    "choices": [
      "MI6",
      "SIS",
      "GCHQ",
      "DSD"
    ],
    "correct": 1
  },
  {
    "question": "Where is MI6 headquarters?",
    "choices": [
      "Vauxhall Cross",
      "Whitehall",
      "Thames House",
      "GCHQ Cheltenham"
    ],
    "correct": 0
  },
  {
    "question": "Year of founding (Foreign Section)?",
    "choices": [
      "1899",
      "1909",
      "1919",
      "1939"
    ],
    "correct": 1
  },
  {
    "question": "First chief Mansfield Smith-Cumming was known as?",
    "choices": [
      "M",
      "C",
      "Q",
      "K"
    ],
    "correct": 1
  },
  {
    "question": "MI6 chief during WWII?",
    "choices": [
      "Stewart Menzies",
      "Maurice Oldfield",
      "Stella Rimington",
      "John Scarlett"
    ],
    "correct": 0
  },
  {
    "question": "Who notoriously betrayed MI6 secrets to the Soviets?",
    "choices": [
      "John le Carré",
      "Kim Philby",
      "Daphne Park",
      "Ian Fleming"
    ],
    "correct": 1
  },
  {
    "question": "Domestic counterpart of MI6?",
    "choices": [
      "MI4",
      "MI5",
      "GCHQ",
      "SAS"
    ],
    "correct": 1
  },
  {
    "question": "Author Ian Fleming created 'James Bond' while serving in?",
    "choices": [
      "MI6",
      "Naval Intelligence Division",
      "MI5",
      "GCHQ"
    ],
    "correct": 1
  },
  {
    "question": "Which MI6 officer wrote 'Spycatcher' that the UK tried to ban?",
    "choices": [
      "Peter Wright (MI5)",
      "Anthony Cavendish",
      "George Blake",
      "Maurice Oldfield"
    ],
    "correct": 0
  },
  {
    "question": "Russian-born MI6 traitor who escaped from prison in 1966?",
    "choices": [
      "George Blake",
      "Alistair Horne",
      "Alfred Burke",
      "John Vassall"
    ],
    "correct": 0
  },
  {
    "question": "Modern MI6 chief is referred to as?",
    "choices": [
      "M",
      "C",
      "Director",
      "Chief"
    ],
    "correct": 1
  },
  {
    "question": "Which act first publicly avowed MI6's existence (1994)?",
    "choices": [
      "Intelligence Services Act",
      "Official Secrets Act",
      "RIPA",
      "Justice and Security Act"
    ],
    "correct": 0
  },
  {
    "question": "MI6 produced disinformation in WWII via what scheme?",
    "choices": [
      "XX (Double Cross)",
      "Magic",
      "Ultra",
      "Bodyguard"
    ],
    "correct": 0
  },
  {
    "question": "First female head of MI6?",
    "choices": [
      "Stella Rimington",
      "Eliza Manningham-Buller",
      "There hasn't been one yet",
      "Alex Younger's deputy"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Mi6QuizSettings): Mi6QuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Mi6QuizState, action: Mi6QuizAction): Mi6QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Mi6QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
