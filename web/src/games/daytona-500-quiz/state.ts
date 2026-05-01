import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Daytona500QuizSettings { questions: "10" | "20" | "30"; }
export interface Daytona500QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Daytona500QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "How long is the Daytona 500 race?",
    "choices": [
      "400 miles",
      "500 miles",
      "600 miles",
      "300 miles"
    ],
    "correct": 1
  },
  {
    "question": "In which state is the Daytona 500 held?",
    "choices": [
      "Florida",
      "Georgia",
      "Alabama",
      "Tennessee"
    ],
    "correct": 0
  },
  {
    "question": "Who has the most Daytona 500 wins?",
    "choices": [
      "Richard Petty",
      "Cale Yarborough",
      "Dale Earnhardt",
      "Jimmie Johnson"
    ],
    "correct": 0
  },
  {
    "question": "How many Daytona 500 wins does Richard Petty have?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "In which year was the first Daytona 500?",
    "choices": [
      "1957",
      "1958",
      "1959",
      "1960"
    ],
    "correct": 2
  },
  {
    "question": "Which driver finally won Daytona in 1998 after 19 tries?",
    "choices": [
      "Dale Earnhardt",
      "Jeff Gordon",
      "Rusty Wallace",
      "Mark Martin"
    ],
    "correct": 0
  },
  {
    "question": "Who won the 2024 Daytona 500?",
    "choices": [
      "William Byron",
      "Tyler Reddick",
      "Christopher Bell",
      "Alex Bowman"
    ],
    "correct": 0
  },
  {
    "question": "The Daytona 500 is the season opener for which series?",
    "choices": [
      "NASCAR Cup",
      "IndyCar",
      "Formula 1",
      "IMSA"
    ],
    "correct": 0
  },
  {
    "question": "How many laps is the Daytona 500?",
    "choices": [
      "100",
      "150",
      "200",
      "250"
    ],
    "correct": 2
  },
  {
    "question": "What is the shape of Daytona International Speedway?",
    "choices": [
      "Tri-oval",
      "Oval",
      "Road course",
      "Street circuit"
    ],
    "correct": 0
  },
  {
    "question": "Who tragically died on the last lap of the 2001 Daytona 500?",
    "choices": [
      "Dale Earnhardt",
      "Adam Petty",
      "Tony Stewart",
      "Kenny Irwin"
    ],
    "correct": 0
  },
  {
    "question": "Which driver won the 2023 Daytona 500?",
    "choices": [
      "Ricky Stenhouse Jr.",
      "Joey Logano",
      "Kyle Larson",
      "Chase Elliott"
    ],
    "correct": 0
  },
  {
    "question": "How banked are Daytona's turns?",
    "choices": [
      "18 degrees",
      "24 degrees",
      "31 degrees",
      "36 degrees"
    ],
    "correct": 2
  },
  {
    "question": "Which device historically reduced engine power at Daytona?",
    "choices": [
      "Restrictor plate",
      "Wing",
      "Spoiler limit",
      "Tire change"
    ],
    "correct": 0
  },
  {
    "question": "How many Cup titles did Dale Earnhardt win?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Which driver swept the Daytona 500 in 2014?",
    "choices": [
      "Dale Earnhardt Jr.",
      "Kevin Harvick",
      "Brad Keselowski",
      "Joey Logano"
    ],
    "correct": 0
  },
  {
    "question": "How many drivers race in the Daytona 500?",
    "choices": [
      "40",
      "42",
      "44",
      "46"
    ],
    "correct": 0
  },
  {
    "question": "Which automaker won the first Daytona 500?",
    "choices": [
      "Plymouth",
      "Oldsmobile",
      "Chevy",
      "Dodge"
    ],
    "correct": 1
  },
  {
    "question": "What is 'The Big One' at Daytona?",
    "choices": [
      "Multi-car wreck",
      "Final lap",
      "Pit stop",
      "Fueling"
    ],
    "correct": 0
  },
  {
    "question": "What event is used to set the Daytona 500 grid?",
    "choices": [
      "Duels",
      "Practice times",
      "Free passes",
      "Fan vote"
    ],
    "correct": 0
  },
  {
    "question": "Who finished 1-2 with Pearson in the iconic 1976 Daytona 500 finish?",
    "choices": [
      "Richard Petty",
      "David Pearson",
      "Both crashed",
      "Bobby Allison"
    ],
    "correct": 2
  },
  {
    "question": "Which year did Trevor Bayne win Daytona 500 as a rookie?",
    "choices": [
      "2009",
      "2010",
      "2011",
      "2012"
    ],
    "correct": 2
  },
  {
    "question": "Who won the Daytona 500 in 2022?",
    "choices": [
      "Austin Cindric",
      "Bubba Wallace",
      "Kyle Larson",
      "Kurt Busch"
    ],
    "correct": 0
  },
  {
    "question": "Who won the Daytona 500 in 2021?",
    "choices": [
      "Michael McDowell",
      "Brad Keselowski",
      "Joey Logano",
      "Denny Hamlin"
    ],
    "correct": 0
  },
  {
    "question": "Which Hendrick Motorsports driver won the 2024 Daytona 500?",
    "choices": [
      "William Byron",
      "Kyle Larson",
      "Chase Elliott",
      "Alex Bowman"
    ],
    "correct": 0
  },
  {
    "question": "How long is Daytona International Speedway?",
    "choices": [
      "2.5 miles",
      "2.0 miles",
      "3.0 miles",
      "1.5 miles"
    ],
    "correct": 0
  },
  {
    "question": "Which sanctioning body runs the Daytona 500?",
    "choices": [
      "NASCAR",
      "USAC",
      "ARCA",
      "IMSA"
    ],
    "correct": 0
  },
  {
    "question": "Who founded NASCAR?",
    "choices": [
      "Bill France Sr.",
      "Richard Petty",
      "Junior Johnson",
      "Bill France Jr."
    ],
    "correct": 0
  },
  {
    "question": "Which car number is iconic for Dale Earnhardt?",
    "choices": [
      "3",
      "8",
      "24",
      "43"
    ],
    "correct": 0
  },
  {
    "question": "Which trophy is awarded for the Daytona 500?",
    "choices": [
      "Harley J. Earl Trophy",
      "Petty Cup",
      "France Cup",
      "Speed Trophy"
    ],
    "correct": 0
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
