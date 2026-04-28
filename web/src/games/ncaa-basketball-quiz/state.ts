import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NcaaBasketballQuizSettings { questions: "10" | "20" | "30"; }
export interface NcaaBasketballQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NcaaBasketballQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Coach with most NCAA men's titles?",
    "choices": [
      "John Wooden",
      "Mike Krzyzewski",
      "Adolph Rupp",
      "Roy Williams"
    ],
    "correct": 0
  },
  {
    "question": "How many NCAA titles did UCLA win under Wooden?",
    "choices": [
      "8",
      "9",
      "10",
      "11"
    ],
    "correct": 2
  },
  {
    "question": "Christian Laettner played for?",
    "choices": [
      "UNC",
      "Duke",
      "Kentucky",
      "Kansas"
    ],
    "correct": 1
  },
  {
    "question": "Who won NCAA 2023 men's title?",
    "choices": [
      "UConn",
      "UNC",
      "Kansas",
      "Gonzaga"
    ],
    "correct": 0
  },
  {
    "question": "Steph Curry played college at?",
    "choices": [
      "Duke",
      "Davidson",
      "Carolina",
      "Kentucky"
    ],
    "correct": 1
  },
  {
    "question": "NCAA tournament expanded to 64 teams in?",
    "choices": [
      "1979",
      "1985",
      "1991",
      "1996"
    ],
    "correct": 1
  },
  {
    "question": "Who is the 'Round of 64' nickname?",
    "choices": [
      "First round",
      "Sweet Sixteen",
      "Elite Eight",
      "Final Four"
    ],
    "correct": 0
  },
  {
    "question": "NC State's 1983 title coach?",
    "choices": [
      "Jim Valvano",
      "Dean Smith",
      "Mike Krzyzewski",
      "Bobby Knight"
    ],
    "correct": 0
  },
  {
    "question": "Larry Bird played college at?",
    "choices": [
      "Indiana",
      "Indiana State",
      "Purdue",
      "Notre Dame"
    ],
    "correct": 1
  },
  {
    "question": "Magic Johnson played college at?",
    "choices": [
      "Michigan",
      "Michigan State",
      "Indiana",
      "UCLA"
    ],
    "correct": 1
  },
  {
    "question": "Villanova won 2018 title under coach?",
    "choices": [
      "Jay Wright",
      "Tom Izzo",
      "Bill Self",
      "John Calipari"
    ],
    "correct": 0
  },
  {
    "question": "Tournament's most upsets in a year is called?",
    "choices": [
      "Madness",
      "Mayhem",
      "Wild Card",
      "Bracket Bust"
    ],
    "correct": 0
  },
  {
    "question": "Most consecutive Final Fours by a coach?",
    "choices": [
      "Wooden",
      "Smith",
      "Krzyzewski",
      "Calipari"
    ],
    "correct": 0
  },
  {
    "question": "Kentucky's 2012 title coach?",
    "choices": [
      "Calipari",
      "Pitino",
      "Smith",
      "Self"
    ],
    "correct": 0
  },
  {
    "question": "Final Four 2024 was held in?",
    "choices": [
      "Phoenix",
      "Houston",
      "New Orleans",
      "Indianapolis"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NcaaBasketballQuizSettings): NcaaBasketballQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NcaaBasketballQuizState, action: NcaaBasketballQuizAction): NcaaBasketballQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NcaaBasketballQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
