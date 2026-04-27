import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StateCapitalsMiniSettings { questions: "10" | "20"; }
export interface StateCapitalsMiniState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StateCapitalsMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Capital of California?",
    "choices": [
      "Los Angeles",
      "Sacramento",
      "San Francisco",
      "San Diego"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Texas?",
    "choices": [
      "Houston",
      "Dallas",
      "Austin",
      "San Antonio"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Florida?",
    "choices": [
      "Miami",
      "Orlando",
      "Tallahassee",
      "Tampa"
    ],
    "correct": 2
  },
  {
    "question": "Capital of New York?",
    "choices": [
      "New York City",
      "Albany",
      "Buffalo",
      "Rochester"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Illinois?",
    "choices": [
      "Chicago",
      "Peoria",
      "Springfield",
      "Rockford"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Arizona?",
    "choices": [
      "Phoenix",
      "Tucson",
      "Mesa",
      "Flagstaff"
    ],
    "correct": 0
  },
  {
    "question": "Capital of Washington?",
    "choices": [
      "Seattle",
      "Spokane",
      "Tacoma",
      "Olympia"
    ],
    "correct": 3
  },
  {
    "question": "Capital of Massachusetts?",
    "choices": [
      "Worcester",
      "Boston",
      "Cambridge",
      "Springfield"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Pennsylvania?",
    "choices": [
      "Philadelphia",
      "Pittsburgh",
      "Harrisburg",
      "Erie"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Ohio?",
    "choices": [
      "Cleveland",
      "Cincinnati",
      "Columbus",
      "Toledo"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Georgia?",
    "choices": [
      "Savannah",
      "Atlanta",
      "Augusta",
      "Macon"
    ],
    "correct": 1
  },
  {
    "question": "Capital of North Carolina?",
    "choices": [
      "Charlotte",
      "Raleigh",
      "Durham",
      "Greensboro"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Michigan?",
    "choices": [
      "Detroit",
      "Lansing",
      "Grand Rapids",
      "Ann Arbor"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Virginia?",
    "choices": [
      "Richmond",
      "Norfolk",
      "Virginia Beach",
      "Arlington"
    ],
    "correct": 0
  },
  {
    "question": "Capital of New Jersey?",
    "choices": [
      "Newark",
      "Trenton",
      "Jersey City",
      "Atlantic City"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Colorado?",
    "choices": [
      "Aurora",
      "Denver",
      "Boulder",
      "Colorado Springs"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Oregon?",
    "choices": [
      "Portland",
      "Eugene",
      "Salem",
      "Bend"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Tennessee?",
    "choices": [
      "Memphis",
      "Knoxville",
      "Nashville",
      "Chattanooga"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Wisconsin?",
    "choices": [
      "Milwaukee",
      "Madison",
      "Green Bay",
      "Kenosha"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Minnesota?",
    "choices": [
      "Minneapolis",
      "Duluth",
      "Saint Paul",
      "Rochester"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Hawaii?",
    "choices": [
      "Hilo",
      "Honolulu",
      "Kailua",
      "Kahului"
    ],
    "correct": 1
  },
  {
    "question": "Capital of Alaska?",
    "choices": [
      "Anchorage",
      "Fairbanks",
      "Juneau",
      "Sitka"
    ],
    "correct": 2
  },
  {
    "question": "Capital of Nevada?",
    "choices": [
      "Las Vegas",
      "Reno",
      "Henderson",
      "Carson City"
    ],
    "correct": 3
  },
  {
    "question": "Capital of Kentucky?",
    "choices": [
      "Louisville",
      "Lexington",
      "Frankfort",
      "Bowling Green"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StateCapitalsMiniSettings): StateCapitalsMiniState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StateCapitalsMiniState, action: StateCapitalsMiniAction): StateCapitalsMiniState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StateCapitalsMiniState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
