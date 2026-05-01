import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MtStHelensQuizSettings { questions: "10" | "20" | "30"; }
export interface MtStHelensQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MtStHelensQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In what year did Mt. St. Helens erupt?",
    "choices": [
      "1978",
      "1980",
      "1982",
      "1984"
    ],
    "correct": 1
  },
  {
    "question": "Date of the major eruption?",
    "choices": [
      "May 18",
      "June 18",
      "July 18",
      "April 18"
    ],
    "correct": 0
  },
  {
    "question": "State where Mt. St. Helens is located?",
    "choices": [
      "Oregon",
      "Washington",
      "Montana",
      "California"
    ],
    "correct": 1
  },
  {
    "question": "Mountain range?",
    "choices": [
      "Rockies",
      "Sierra Nevada",
      "Cascade",
      "Olympic"
    ],
    "correct": 2
  },
  {
    "question": "Famous volcanologist killed?",
    "choices": [
      "David Johnston",
      "Tina Neal",
      "Robert Smith",
      "Stephen Self"
    ],
    "correct": 0
  },
  {
    "question": "His final radio words?",
    "choices": [
      "This is it!",
      "Vancouver, this is it!",
      "She's blowing!",
      "Run!"
    ],
    "correct": 1
  },
  {
    "question": "Famous resident who refused to leave (and died)?",
    "choices": [
      "Harry Truman (the lodge owner)",
      "Smokey Bear",
      "Earl Smith",
      "Larry Brown"
    ],
    "correct": 0
  },
  {
    "question": "Number of human fatalities?",
    "choices": [
      "7",
      "27",
      "57",
      "100"
    ],
    "correct": 2
  },
  {
    "question": "Eruption type?",
    "choices": [
      "Hawaiian",
      "Plinian",
      "Lateral blast",
      "Strombolian"
    ],
    "correct": 2
  },
  {
    "question": "VEI rating of the 1980 eruption?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Lake near the volcano?",
    "choices": [
      "Crater Lake",
      "Spirit Lake",
      "Klamath Lake",
      "Lake Mead"
    ],
    "correct": 1
  },
  {
    "question": "Mountain lost how much elevation?",
    "choices": [
      "100 ft",
      "500 ft",
      "~1,300 ft",
      "~5,000 ft"
    ],
    "correct": 2
  },
  {
    "question": "Largest landslide in recorded history?",
    "choices": [
      "Yes",
      "No",
      "Tied",
      "Unclear"
    ],
    "correct": 0
  },
  {
    "question": "Triggering event?",
    "choices": [
      "Magnitude 5.1 earthquake",
      "Lightning",
      "Bomb test",
      "Nothing"
    ],
    "correct": 0
  },
  {
    "question": "Ash from eruption circled?",
    "choices": [
      "Earth",
      "Pacific only",
      "North America only",
      "Local only"
    ],
    "correct": 0
  },
  {
    "question": "Volcano is part of what?",
    "choices": [
      "Pacific Ring of Fire",
      "Mid-Atlantic Ridge",
      "Hot spot",
      "Rift zone"
    ],
    "correct": 0
  },
  {
    "question": "President at the time?",
    "choices": [
      "Carter",
      "Reagan",
      "Ford",
      "Nixon"
    ],
    "correct": 0
  },
  {
    "question": "Lateral blast traveled at?",
    "choices": [
      "100 mph",
      "300 mph",
      "670 mph",
      "1000 mph"
    ],
    "correct": 2
  },
  {
    "question": "Crater shape after?",
    "choices": [
      "Round",
      "Horseshoe-shaped",
      "Square",
      "Dome"
    ],
    "correct": 1
  },
  {
    "question": "Volcano is a national what?",
    "choices": [
      "Park",
      "Forest",
      "Volcanic Monument",
      "Wilderness"
    ],
    "correct": 2
  },
  {
    "question": "In what year did Mt. St. Helens erupt?",
    "choices": [
      "1978",
      "1980",
      "1982",
      "1984"
    ],
    "correct": 1
  },
  {
    "question": "On what date was the major eruption?",
    "choices": [
      "March 18",
      "April 18",
      "May 18",
      "June 18"
    ],
    "correct": 2
  },
  {
    "question": "In which US state is Mt. St. Helens?",
    "choices": [
      "Oregon",
      "Washington",
      "California",
      "Idaho"
    ],
    "correct": 1
  },
  {
    "question": "How many people were killed?",
    "choices": [
      "17",
      "37",
      "57",
      "97"
    ],
    "correct": 2
  },
  {
    "question": "What triggered the lateral blast?",
    "choices": [
      "Earthquake",
      "Glacier collapse",
      "Lightning",
      "Bomb"
    ],
    "correct": 0
  },
  {
    "question": "How much did the elevation drop?",
    "choices": [
      "~500 ft",
      "~900 ft",
      "~1,300 ft",
      "~2,000 ft"
    ],
    "correct": 2
  },
  {
    "question": "Famous lodge owner who refused to leave?",
    "choices": [
      "Harry Truman",
      "John Muir",
      "Tom Vail",
      "David Johnston"
    ],
    "correct": 0
  },
  {
    "question": "USGS volcanologist killed in the blast?",
    "choices": [
      "David Johnston",
      "Robert Christiansen",
      "Don Swanson",
      "Harry Glicken"
    ],
    "correct": 0
  },
  {
    "question": "VEI (Volcanic Explosivity Index) of the eruption?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "The eruption is part of which mountain range?",
    "choices": [
      "Rockies",
      "Cascades",
      "Sierra Nevada",
      "Olympics"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MtStHelensQuizSettings): MtStHelensQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MtStHelensQuizState, action: MtStHelensQuizAction): MtStHelensQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MtStHelensQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
