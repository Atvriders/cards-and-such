import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TitanicQuizSettings { questions: "10" | "20" | "30"; }
export interface TitanicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TitanicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In what year did the Titanic sink?",
    "choices": [
      "1910",
      "1911",
      "1912",
      "1913"
    ],
    "correct": 2
  },
  {
    "question": "What was the name of the iceberg's location ocean?",
    "choices": [
      "Pacific",
      "Atlantic",
      "Arctic",
      "Indian"
    ],
    "correct": 1
  },
  {
    "question": "Who was the captain of the Titanic?",
    "choices": [
      "Edward Smith",
      "Charles Lightoller",
      "William Murdoch",
      "Henry Wilde"
    ],
    "correct": 0
  },
  {
    "question": "Where was Titanic built?",
    "choices": [
      "Liverpool",
      "Belfast",
      "Glasgow",
      "Southampton"
    ],
    "correct": 1
  },
  {
    "question": "What was Titanic's destination?",
    "choices": [
      "Boston",
      "New York",
      "Philadelphia",
      "Halifax"
    ],
    "correct": 1
  },
  {
    "question": "Where did Titanic depart from?",
    "choices": [
      "Liverpool",
      "Cherbourg",
      "Southampton",
      "Queenstown"
    ],
    "correct": 2
  },
  {
    "question": "On what date did Titanic strike the iceberg?",
    "choices": [
      "April 12, 1912",
      "April 14, 1912",
      "April 15, 1912",
      "April 16, 1912"
    ],
    "correct": 1
  },
  {
    "question": "What ship rescued the survivors?",
    "choices": [
      "Olympic",
      "Britannic",
      "Carpathia",
      "Californian"
    ],
    "correct": 2
  },
  {
    "question": "How many people died in the disaster (approx.)?",
    "choices": [
      "~500",
      "~1500",
      "~2500",
      "~3500"
    ],
    "correct": 1
  },
  {
    "question": "Titanic was operated by which line?",
    "choices": [
      "Cunard",
      "White Star Line",
      "Red Star Line",
      "P&O"
    ],
    "correct": 1
  },
  {
    "question": "Who designed Titanic?",
    "choices": [
      "Thomas Andrews",
      "Bruce Ismay",
      "Pirrie Andrews",
      "Edward Wilding"
    ],
    "correct": 0
  },
  {
    "question": "Titanic's wreck was discovered in?",
    "choices": [
      "1975",
      "1985",
      "1995",
      "2005"
    ],
    "correct": 1
  },
  {
    "question": "Who discovered the wreck?",
    "choices": [
      "James Cameron",
      "Robert Ballard",
      "Jacques Cousteau",
      "Bob Kraft"
    ],
    "correct": 1
  },
  {
    "question": "How many lifeboats did Titanic carry?",
    "choices": [
      "12",
      "16",
      "20",
      "24"
    ],
    "correct": 2
  },
  {
    "question": "Titanic was a sister ship of?",
    "choices": [
      "Lusitania",
      "Olympic",
      "Mauretania",
      "Aquitania"
    ],
    "correct": 1
  },
  {
    "question": "Roughly how long did Titanic take to sink?",
    "choices": [
      "1 hour",
      "2.5 hours",
      "4 hours",
      "6 hours"
    ],
    "correct": 1
  },
  {
    "question": "Titanic struck the iceberg at what time?",
    "choices": [
      "10:40 PM",
      "11:40 PM",
      "12:40 AM",
      "1:40 AM"
    ],
    "correct": 1
  },
  {
    "question": "How many funnels did Titanic have?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 2
  },
  {
    "question": "What class of ship was Titanic?",
    "choices": [
      "Olympic class",
      "Atlantic class",
      "Royal class",
      "Liner class"
    ],
    "correct": 0
  },
  {
    "question": "Sister ship Britannic sank during?",
    "choices": [
      "WWI",
      "WWII",
      "Spanish flu",
      "Storm of 1925"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TitanicQuizSettings): TitanicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TitanicQuizState, action: TitanicQuizAction): TitanicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TitanicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
