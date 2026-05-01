import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Apollo1QuizSettings { questions: "10" | "20" | "30"; }
export interface Apollo1QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Apollo1QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Year of the Apollo 1 fire?",
    "choices": [
      "1965",
      "1966",
      "1967",
      "1968"
    ],
    "correct": 2
  },
  {
    "question": "Date?",
    "choices": [
      "January 27",
      "February 14",
      "March 1",
      "July 4"
    ],
    "correct": 0
  },
  {
    "question": "Event during which the fire occurred?",
    "choices": [
      "Launch",
      "Plugs-out test",
      "Splashdown",
      "Reentry"
    ],
    "correct": 1
  },
  {
    "question": "Three astronauts who died — first?",
    "choices": [
      "Gus Grissom",
      "John Glenn",
      "Wally Schirra",
      "Buzz Aldrin"
    ],
    "correct": 0
  },
  {
    "question": "Second astronaut?",
    "choices": [
      "Ed White",
      "Pete Conrad",
      "Jim Lovell",
      "Tom Stafford"
    ],
    "correct": 0
  },
  {
    "question": "Third astronaut?",
    "choices": [
      "Roger Chaffee",
      "Harrison Schmitt",
      "Jack Swigert",
      "Don Eisele"
    ],
    "correct": 0
  },
  {
    "question": "Spacecraft cabin atmosphere?",
    "choices": [
      "Air",
      "Pure oxygen",
      "Helium",
      "Nitrogen"
    ],
    "correct": 1
  },
  {
    "question": "Hatch design problem?",
    "choices": [
      "Opened outward",
      "Opened inward",
      "No hatch",
      "Was electric"
    ],
    "correct": 1
  },
  {
    "question": "Launch site for the test?",
    "choices": [
      "LC-34 Cape Kennedy",
      "LC-39A",
      "Wallops",
      "Vandenberg"
    ],
    "correct": 0
  },
  {
    "question": "Command module manufacturer?",
    "choices": [
      "North American",
      "Boeing",
      "Lockheed",
      "Grumman"
    ],
    "correct": 0
  },
  {
    "question": "Original mission designation?",
    "choices": [
      "AS-204",
      "AS-201",
      "AS-206",
      "AS-207"
    ],
    "correct": 0
  },
  {
    "question": "Apollo 1 was renamed posthumously?",
    "choices": [
      "Yes",
      "No",
      "Renamed Apollo 0",
      "Just AS-204"
    ],
    "correct": 0
  },
  {
    "question": "Time spent fighting the fire?",
    "choices": [
      "~17 sec",
      "~5 min",
      "~30 min",
      "~1 hour"
    ],
    "correct": 0
  },
  {
    "question": "NASA Administrator?",
    "choices": [
      "James Webb",
      "Tom Paine",
      "Kraft",
      "Low"
    ],
    "correct": 0
  },
  {
    "question": "Apollo program halted for?",
    "choices": [
      "20 months",
      "6 months",
      "2 years",
      "3 years"
    ],
    "correct": 0
  },
  {
    "question": "First crewed mission after?",
    "choices": [
      "Apollo 7",
      "Apollo 8",
      "Apollo 11",
      "Apollo 4"
    ],
    "correct": 0
  },
  {
    "question": "Apollo 7 commander?",
    "choices": [
      "Schirra",
      "Aldrin",
      "Collins",
      "Anders"
    ],
    "correct": 0
  },
  {
    "question": "Block redesigned to?",
    "choices": [
      "Block II",
      "Block III",
      "Block IV",
      "Block V"
    ],
    "correct": 0
  },
  {
    "question": "Eventual program goal?",
    "choices": [
      "Mars",
      "Moon landing",
      "Skylab",
      "Space station"
    ],
    "correct": 1
  },
  {
    "question": "Apollo 11 landed in?",
    "choices": [
      "1968",
      "1969",
      "1970",
      "1971"
    ],
    "correct": 1
  },
  {
    "question": "In what year did the Apollo 1 fire occur?",
    "choices": [
      "1965",
      "1966",
      "1967",
      "1968"
    ],
    "correct": 2
  },
  {
    "question": "On what date did the fatal fire occur?",
    "choices": [
      "January 27",
      "February 14",
      "March 1",
      "April 12"
    ],
    "correct": 0
  },
  {
    "question": "Where did the fire occur?",
    "choices": [
      "Cape Kennedy",
      "Houston",
      "Edwards AFB",
      "White Sands"
    ],
    "correct": 0
  },
  {
    "question": "Apollo 1 was originally designated?",
    "choices": [
      "AS-201",
      "AS-204",
      "AS-207",
      "AS-501"
    ],
    "correct": 1
  },
  {
    "question": "Which astronaut commanded Apollo 1?",
    "choices": [
      "Gus Grissom",
      "Ed White",
      "Roger Chaffee",
      "Wally Schirra"
    ],
    "correct": 0
  },
  {
    "question": "Which astronaut was the senior pilot?",
    "choices": [
      "Gus Grissom",
      "Ed White",
      "Roger Chaffee",
      "Buzz Aldrin"
    ],
    "correct": 1
  },
  {
    "question": "Which astronaut was the pilot?",
    "choices": [
      "Gus Grissom",
      "Ed White",
      "Roger Chaffee",
      "Donn Eisele"
    ],
    "correct": 2
  },
  {
    "question": "What atmosphere was inside the cabin during the test?",
    "choices": [
      "Air",
      "Pure O2 high pressure",
      "Nitrogen",
      "Argon"
    ],
    "correct": 1
  },
  {
    "question": "The launch vehicle was?",
    "choices": [
      "Saturn IB",
      "Saturn V",
      "Titan II",
      "Atlas"
    ],
    "correct": 0
  },
  {
    "question": "First crewed Apollo flight after the fire was?",
    "choices": [
      "Apollo 4",
      "Apollo 7",
      "Apollo 8",
      "Apollo 11"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Apollo1QuizSettings): Apollo1QuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Apollo1QuizState, action: Apollo1QuizAction): Apollo1QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Apollo1QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
