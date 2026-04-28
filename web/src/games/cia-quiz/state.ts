import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CiaQuizSettings { questions: "10" | "20"; }
export interface CiaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CiaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In what year was the CIA founded?",
    "choices": [
      "1942",
      "1947",
      "1953",
      "1961"
    ],
    "correct": 1
  },
  {
    "question": "Where is CIA headquarters?",
    "choices": [
      "Quantico",
      "Langley, VA",
      "Fort Meade",
      "Bethesda"
    ],
    "correct": 1
  },
  {
    "question": "Which act created the CIA?",
    "choices": [
      "Espionage Act",
      "National Security Act",
      "Patriot Act",
      "Homeland Security Act"
    ],
    "correct": 1
  },
  {
    "question": "What WWII agency preceded the CIA?",
    "choices": [
      "FBI",
      "OSS",
      "G-2",
      "ONI"
    ],
    "correct": 1
  },
  {
    "question": "Who was the OSS director and a 'father' of U.S. intelligence?",
    "choices": [
      "William Donovan",
      "Allen Dulles",
      "Richard Helms",
      "Stansfield Turner"
    ],
    "correct": 0
  },
  {
    "question": "Which CIA-backed 1961 invasion failed in Cuba?",
    "choices": [
      "Bay of Pigs",
      "Mongoose",
      "JMWAVE",
      "Northwoods"
    ],
    "correct": 0
  },
  {
    "question": "Project ___ tested LSD and mind control in the 1950s-60s.",
    "choices": [
      "MK-ULTRA",
      "Bluebird",
      "PAPERCLIP",
      "GLADIO"
    ],
    "correct": 0
  },
  {
    "question": "Who directed the CIA from 1966 to 1973?",
    "choices": [
      "Allen Dulles",
      "Richard Helms",
      "William Casey",
      "George Tenet"
    ],
    "correct": 1
  },
  {
    "question": "Which DCI was wounded in Bay of Pigs aftermath investigations?",
    "choices": [
      "John McCone",
      "Richard Bissell",
      "John Deutch",
      "James Angleton"
    ],
    "correct": 0
  },
  {
    "question": "Counterintelligence chief obsessed with KGB moles?",
    "choices": [
      "James Jesus Angleton",
      "Cord Meyer",
      "Frank Wisner",
      "Tracy Barnes"
    ],
    "correct": 0
  },
  {
    "question": "Iran-Contra DCI?",
    "choices": [
      "William Casey",
      "Stansfield Turner",
      "Robert Gates",
      "James Woolsey"
    ],
    "correct": 0
  },
  {
    "question": "Which CIA officer betrayed agency for the KGB, exposed 1994?",
    "choices": [
      "Edward Howard",
      "Aldrich Ames",
      "Harold Nicholson",
      "Brian Kelley"
    ],
    "correct": 1
  },
  {
    "question": "First female CIA Director?",
    "choices": [
      "Gina Haspel",
      "Avril Haines",
      "Jami Miscik",
      "Tina Shaver"
    ],
    "correct": 0
  },
  {
    "question": "Which committee investigated CIA abuses in 1975?",
    "choices": [
      "Church Committee",
      "Pike Committee",
      "Rockefeller Commission",
      "All of these"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CiaQuizSettings): CiaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CiaQuizState, action: CiaQuizAction): CiaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CiaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
