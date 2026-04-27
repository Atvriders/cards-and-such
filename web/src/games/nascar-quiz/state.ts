import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NASCARQuizSettings { questions: "10" | "20" | "30"; }
export interface NASCARQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NASCARQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "NASCAR founded in?",
    "choices": [
      "1948",
      "1955",
      "1962",
      "1970"
    ],
    "correct": 0
  },
  {
    "question": "NASCAR founder?",
    "choices": [
      "Bill France Sr",
      "Richard Petty",
      "Junior Johnson",
      "Lee Petty"
    ],
    "correct": 0
  },
  {
    "question": "Daytona 500 first held?",
    "choices": [
      "1948",
      "1959",
      "1965",
      "1970"
    ],
    "correct": 1
  },
  {
    "question": "Most career Cup wins?",
    "choices": [
      "Petty",
      "Earnhardt",
      "Pearson",
      "Gordon"
    ],
    "correct": 0
  },
  {
    "question": "Petty's Cup wins?",
    "choices": [
      "100",
      "150",
      "200",
      "250"
    ],
    "correct": 2
  },
  {
    "question": "Earnhardt 'The Intimidator' #?",
    "choices": [
      "3",
      "8",
      "24",
      "43"
    ],
    "correct": 0
  },
  {
    "question": "Earnhardt Sr. died at?",
    "choices": [
      "Daytona 2001",
      "Talladega 2000",
      "Bristol 2002",
      "Charlotte 2001"
    ],
    "correct": 0
  },
  {
    "question": "Jeff Gordon's #?",
    "choices": [
      "3",
      "24",
      "48",
      "88"
    ],
    "correct": 1
  },
  {
    "question": "Jimmie Johnson titles?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Cale Yarborough won how many titles in a row?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "question": "Talladega is in?",
    "choices": [
      "Alabama",
      "Florida",
      "Georgia",
      "Tennessee"
    ],
    "correct": 0
  },
  {
    "question": "Bristol is famous for?",
    "choices": [
      "Short track",
      "Superspeedway",
      "Road course",
      "Dirt"
    ],
    "correct": 0
  },
  {
    "question": "NASCAR top series is now (sponsor)?",
    "choices": [
      "Sprint",
      "Monster",
      "NASCAR Cup",
      "Winston"
    ],
    "correct": 2
  },
  {
    "question": "Daytona track length?",
    "choices": [
      "1.5",
      "2.0",
      "2.5",
      "3.0 mi"
    ],
    "correct": 2
  },
  {
    "question": "Indianapolis Motor Speedway hosts?",
    "choices": [
      "Brickyard 400",
      "Daytona 500",
      "Coca-Cola 600",
      "Southern 500"
    ],
    "correct": 0
  },
  {
    "question": "Rookie of the Year started in?",
    "choices": [
      "1948",
      "1954",
      "1958",
      "1965"
    ],
    "correct": 2
  },
  {
    "question": "Talladega track length?",
    "choices": [
      "2.0",
      "2.5",
      "2.66",
      "3.0 mi"
    ],
    "correct": 2
  },
  {
    "question": "Pole sitter starts from?",
    "choices": [
      "1st",
      "2nd",
      "Last",
      "Pit"
    ],
    "correct": 0
  },
  {
    "question": "Most-watched NASCAR race usually?",
    "choices": [
      "Daytona 500",
      "Coca-Cola 600",
      "Southern 500",
      "Brickyard"
    ],
    "correct": 0
  },
  {
    "question": "Restrictor plates used at?",
    "choices": [
      "Daytona/Talladega",
      "Bristol",
      "Martinsville",
      "Watkins Glen"
    ],
    "correct": 0
  },
  {
    "question": "NASCAR Hall of Fame is in?",
    "choices": [
      "Daytona",
      "Charlotte",
      "Atlanta",
      "Talladega"
    ],
    "correct": 1
  },
  {
    "question": "Watkins Glen is a?",
    "choices": [
      "Short track",
      "Superspeedway",
      "Road course",
      "Dirt"
    ],
    "correct": 2
  },
  {
    "question": "Kyle Busch's brother?",
    "choices": [
      "Kurt",
      "Kelvin",
      "Ken",
      "Kasey"
    ],
    "correct": 0
  },
  {
    "question": "Chase format introduced?",
    "choices": [
      "1998",
      "2004",
      "2010",
      "2014"
    ],
    "correct": 1
  },
  {
    "question": "Toyota joined Cup series in?",
    "choices": [
      "2005",
      "2007",
      "2010",
      "2012"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NASCARQuizSettings): NASCARQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NASCARQuizState, action: NASCARQuizAction): NASCARQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NASCARQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
