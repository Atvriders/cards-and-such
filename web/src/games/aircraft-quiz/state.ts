import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AircraftQuizSettings { questions: "10" | "20" | "30"; }
export interface AircraftQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AircraftQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First powered flight by?",
    "choices": [
      "Lindbergh",
      "Wright Brothers",
      "Curtiss",
      "Bleriot"
    ],
    "correct": 1
  },
  {
    "question": "Year of Wright Bros first flight?",
    "choices": [
      "1898",
      "1903",
      "1908",
      "1914"
    ],
    "correct": 1
  },
  {
    "question": "Wright Bros flew at?",
    "choices": [
      "Kill Devil Hills",
      "Dayton",
      "Kitty Hawk",
      "All near these"
    ],
    "correct": 3
  },
  {
    "question": "Boeing founded in?",
    "choices": [
      "1916",
      "1925",
      "1935",
      "1945"
    ],
    "correct": 0
  },
  {
    "question": "Boeing 747 nicknamed?",
    "choices": [
      "Jumbo Jet",
      "Dreamliner",
      "Stratocruiser",
      "Triple Seven"
    ],
    "correct": 0
  },
  {
    "question": "747 entered service?",
    "choices": [
      "1965",
      "1970",
      "1975",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "Concorde max speed?",
    "choices": [
      "Mach 1.5",
      "Mach 2",
      "Mach 2.04",
      "Mach 3"
    ],
    "correct": 2
  },
  {
    "question": "Concorde retired?",
    "choices": [
      "2000",
      "2003",
      "2006",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Lindbergh crossed Atlantic in?",
    "choices": [
      "1927",
      "1932",
      "1939",
      "1945"
    ],
    "correct": 0
  },
  {
    "question": "Spirit of St. Louis pilot?",
    "choices": [
      "Earhart",
      "Lindbergh",
      "Curtiss",
      "Doolittle"
    ],
    "correct": 1
  },
  {
    "question": "Amelia Earhart was first woman to?",
    "choices": [
      "Cross Atlantic solo",
      "Walk on Moon",
      "Pilot a 747",
      "Reach Pacific"
    ],
    "correct": 0
  },
  {
    "question": "Bleriot crossed which channel in 1909?",
    "choices": [
      "English",
      "Suez",
      "Panama",
      "Bering"
    ],
    "correct": 0
  },
  {
    "question": "Sound barrier first broken by?",
    "choices": [
      "Yeager",
      "Lindbergh",
      "Doolittle",
      "Mitchell"
    ],
    "correct": 0
  },
  {
    "question": "Year sound barrier broken?",
    "choices": [
      "1947",
      "1950",
      "1953",
      "1957"
    ],
    "correct": 0
  },
  {
    "question": "U-2 spy plane operated by?",
    "choices": [
      "NASA",
      "CIA",
      "Both",
      "Air Force only"
    ],
    "correct": 2
  },
  {
    "question": "Helicopter pioneer?",
    "choices": [
      "Sikorsky",
      "Boeing",
      "Bell",
      "Curtiss"
    ],
    "correct": 0
  },
  {
    "question": "First commercial jet airliner?",
    "choices": [
      "707",
      "Comet",
      "DC-8",
      "Caravelle"
    ],
    "correct": 1
  },
  {
    "question": "DC-3 entered service?",
    "choices": [
      "1928",
      "1936",
      "1942",
      "1950"
    ],
    "correct": 1
  },
  {
    "question": "Spitfire was used by?",
    "choices": [
      "Germany",
      "Britain",
      "USA",
      "USSR"
    ],
    "correct": 1
  },
  {
    "question": "P-51 Mustang served in?",
    "choices": [
      "WWI",
      "WWII",
      "Korea",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "F-22 Raptor manufacturer?",
    "choices": [
      "Boeing",
      "Lockheed Martin",
      "Northrop",
      "McDonnell"
    ],
    "correct": 1
  },
  {
    "question": "Airbus headquarters?",
    "choices": [
      "Toulouse",
      "Paris",
      "Munich",
      "London"
    ],
    "correct": 0
  },
  {
    "question": "A380 capacity (typical)?",
    "choices": [
      "~300",
      "~400",
      "~500",
      "~850 max"
    ],
    "correct": 3
  },
  {
    "question": "Stealth tech first deployed?",
    "choices": [
      "F-117",
      "B-2",
      "F-22",
      "F-35"
    ],
    "correct": 0
  },
  {
    "question": "Hindenburg disaster year?",
    "choices": [
      "1929",
      "1933",
      "1937",
      "1941"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AircraftQuizSettings): AircraftQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AircraftQuizState, action: AircraftQuizAction): AircraftQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AircraftQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
