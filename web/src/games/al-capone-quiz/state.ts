import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AlCaponeQuizSettings { questions: "10" | "20"; }
export interface AlCaponeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AlCaponeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Al Capone was based in which city?",
    "choices": [
      "New York",
      "Chicago",
      "Detroit",
      "Boston"
    ],
    "correct": 1
  },
  {
    "question": "Capone's nickname?",
    "choices": [
      "Bugsy",
      "Lucky",
      "Scarface",
      "Pretty Boy"
    ],
    "correct": 2
  },
  {
    "question": "What crime ultimately put him in prison?",
    "choices": [
      "Murder",
      "Tax evasion",
      "Bootlegging",
      "Bribery"
    ],
    "correct": 1
  },
  {
    "question": "Year of the St. Valentine's Day Massacre?",
    "choices": [
      "1925",
      "1929",
      "1931",
      "1933"
    ],
    "correct": 1
  },
  {
    "question": "Federal agent famed for opposing Capone?",
    "choices": [
      "J. Edgar Hoover",
      "Eliot Ness",
      "Melvin Purvis",
      "Pat Garrett"
    ],
    "correct": 1
  },
  {
    "question": "Eliot Ness's team was called?",
    "choices": [
      "The G-Men",
      "The Untouchables",
      "The Pinkertons",
      "The Squad"
    ],
    "correct": 1
  },
  {
    "question": "Capone served time at?",
    "choices": [
      "San Quentin",
      "Alcatraz",
      "Sing Sing",
      "Leavenworth only"
    ],
    "correct": 1
  },
  {
    "question": "Era of his rise?",
    "choices": [
      "Roaring '20s/Prohibition",
      "Civil War",
      "Great Depression peak",
      "Postwar"
    ],
    "correct": 0
  },
  {
    "question": "Capone's mentor?",
    "choices": [
      "Johnny Torrio",
      "Lucky Luciano",
      "Meyer Lansky",
      "Frank Costello"
    ],
    "correct": 0
  },
  {
    "question": "Robert De Niro played Capone in which film?",
    "choices": [
      "Goodfellas",
      "The Untouchables",
      "The Godfather",
      "Casino"
    ],
    "correct": 1
  },
  {
    "question": "Capone died of complications from?",
    "choices": [
      "Tuberculosis",
      "Syphilis",
      "Pneumonia",
      "Heart attack only"
    ],
    "correct": 1
  },
  {
    "question": "Capone was born in which borough?",
    "choices": [
      "Manhattan",
      "Brooklyn",
      "The Bronx",
      "Queens"
    ],
    "correct": 1
  },
  {
    "question": "Year Capone was sentenced for tax evasion?",
    "choices": [
      "1929",
      "1931",
      "1933",
      "1934"
    ],
    "correct": 1
  },
  {
    "question": "His Florida retirement home was on?",
    "choices": [
      "Star Island",
      "Palm Island",
      "Fisher Island",
      "Indian Creek Island"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AlCaponeQuizSettings): AlCaponeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AlCaponeQuizState, action: AlCaponeQuizAction): AlCaponeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AlCaponeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
