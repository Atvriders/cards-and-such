import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Daytona500QuizSettings { questions: "10" | "20" | "30"; }
export interface Daytona500QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Daytona500QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Daytona 500 distance is?",
    "choices": [
      "400 miles",
      "500 miles",
      "600 miles",
      "250 miles"
    ],
    "correct": 1
  },
  {
    "question": "Most Daytona 500 wins by a driver?",
    "choices": [
      "Petty",
      "Earnhardt",
      "Yarborough",
      "Allison"
    ],
    "correct": 0
  },
  {
    "question": "How many Daytona 500 wins did Richard Petty have?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Dale Earnhardt finally won Daytona 500 in?",
    "choices": [
      "1995",
      "1998",
      "2000",
      "2001"
    ],
    "correct": 1
  },
  {
    "question": "Earnhardt died at Daytona in?",
    "choices": [
      "1999",
      "2000",
      "2001",
      "2002"
    ],
    "correct": 2
  },
  {
    "question": "Daytona 500 is held in?",
    "choices": [
      "January",
      "February",
      "March",
      "April"
    ],
    "correct": 1
  },
  {
    "question": "Daytona 500 is at Daytona ___ Speedway?",
    "choices": [
      "International",
      "Beach",
      "Florida",
      "Speed"
    ],
    "correct": 0
  },
  {
    "question": "First Daytona 500 was in?",
    "choices": [
      "1949",
      "1959",
      "1969",
      "1979"
    ],
    "correct": 1
  },
  {
    "question": "Jeff Gordon won Daytona 500 how many times?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "question": "NASCAR top series formerly Winston Cup, now?",
    "choices": [
      "Sprint",
      "Cup",
      "Series",
      "Tour"
    ],
    "correct": 1
  },
  {
    "question": "Daytona track length?",
    "choices": [
      "1.5",
      "2.0",
      "2.5",
      "3.0"
    ],
    "correct": 2
  },
  {
    "question": "Davy Allison won Daytona 500 in?",
    "choices": [
      "1990",
      "1992",
      "1993",
      "1994"
    ],
    "correct": 1
  },
  {
    "question": "Most popular father-son champions?",
    "choices": [
      "Pettys",
      "Earnhardts",
      "Allisons",
      "Waltrips"
    ],
    "correct": 1
  },
  {
    "question": "Restrictor plate racing pioneered at?",
    "choices": [
      "Talladega",
      "Daytona",
      "Both",
      "Charlotte"
    ],
    "correct": 2
  },
  {
    "question": "Trevor Bayne shocked field winning Daytona 500 in?",
    "choices": [
      "2009",
      "2011",
      "2013",
      "2015"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Daytona500QuizSettings): Daytona500QuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Daytona500QuizState, action: Daytona500QuizAction): Daytona500QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Daytona500QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
