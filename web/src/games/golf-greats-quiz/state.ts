import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GolfGreatsQuizSettings { questions: "10" | "20" | "30"; }
export interface GolfGreatsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GolfGreatsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Jack Nicklaus has how many major titles?",
    "choices": [
      "18",
      "17",
      "19",
      "16"
    ],
    "correct": 0
  },
  {
    "question": "Tiger Woods has how many majors (as of 2024)?",
    "choices": [
      "14",
      "15",
      "16",
      "13"
    ],
    "correct": 1
  },
  {
    "question": "Where is the Masters played?",
    "choices": [
      "Augusta National",
      "Pebble Beach",
      "St Andrews",
      "Pinehurst"
    ],
    "correct": 0
  },
  {
    "question": "Where is The Open Championship usually held?",
    "choices": [
      "Various UK links",
      "Augusta",
      "Pinehurst",
      "TPC Sawgrass"
    ],
    "correct": 0
  },
  {
    "question": "What is the lowest score on a hole called when 1 under par?",
    "choices": [
      "Birdie",
      "Eagle",
      "Bogey",
      "Par"
    ],
    "correct": 0
  },
  {
    "question": "Two under par is called?",
    "choices": [
      "Eagle",
      "Birdie",
      "Albatross",
      "Condor"
    ],
    "correct": 0
  },
  {
    "question": "Three under par on a hole is called?",
    "choices": [
      "Albatross",
      "Eagle",
      "Condor",
      "Birdie"
    ],
    "correct": 0
  },
  {
    "question": "One over par is called?",
    "choices": [
      "Bogey",
      "Par",
      "Birdie",
      "Eagle"
    ],
    "correct": 0
  },
  {
    "question": "Annika Sorenstam is from?",
    "choices": [
      "Sweden",
      "Norway",
      "Finland",
      "Denmark"
    ],
    "correct": 0
  },
  {
    "question": "How many career LPGA wins did Annika Sorenstam have?",
    "choices": [
      "72",
      "60",
      "85",
      "50"
    ],
    "correct": 0
  },
  {
    "question": "Ben Hogan is famous for?",
    "choices": [
      "Iconic swing",
      "Putter only",
      "Driver only",
      "Tour comedy"
    ],
    "correct": 0
  },
  {
    "question": "Sam Snead won how many PGA Tour titles?",
    "choices": [
      "82 (record-tied)",
      "60",
      "70",
      "90"
    ],
    "correct": 0
  },
  {
    "question": "Tiger Woods turned pro in?",
    "choices": [
      "1996",
      "1998",
      "2000",
      "1995"
    ],
    "correct": 0
  },
  {
    "question": "Tiger Woods's first major win?",
    "choices": [
      "1997 Masters",
      "2000 US Open",
      "1999 PGA",
      "2001 Masters"
    ],
    "correct": 0
  },
  {
    "question": "Phil Mickelson is left-handed but actually?",
    "choices": [
      "Right-handed naturally",
      "Left-handed naturally",
      "Ambidextrous",
      "No preference"
    ],
    "correct": 0
  },
  {
    "question": "How many major titles does Phil Mickelson have?",
    "choices": [
      "6",
      "5",
      "7",
      "4"
    ],
    "correct": 0
  },
  {
    "question": "Bobby Jones won the Grand Slam in?",
    "choices": [
      "1930",
      "1925",
      "1935",
      "1940"
    ],
    "correct": 0
  },
  {
    "question": "Walter Hagen was a star of which era?",
    "choices": [
      "1920s-30s",
      "1950s",
      "1970s",
      "1900s"
    ],
    "correct": 0
  },
  {
    "question": "Arnold Palmer's 'Army'?",
    "choices": [
      "Devoted fan following",
      "Caddie crew",
      "Coaching team",
      "Sponsor group"
    ],
    "correct": 0
  },
  {
    "question": "Lee Trevino's Texan nickname?",
    "choices": [
      "Supermex",
      "El Capitan",
      "The Tex",
      "Lefty Lee"
    ],
    "correct": 0
  },
  {
    "question": "Gary Player is from?",
    "choices": [
      "South Africa",
      "Australia",
      "England",
      "New Zealand"
    ],
    "correct": 0
  },
  {
    "question": "Seve Ballesteros is from?",
    "choices": [
      "Spain",
      "Portugal",
      "Italy",
      "Argentina"
    ],
    "correct": 0
  },
  {
    "question": "Greg Norman's nickname?",
    "choices": [
      "Great White Shark",
      "Black Knight",
      "Golden Bear",
      "King"
    ],
    "correct": 0
  },
  {
    "question": "Nick Faldo is from?",
    "choices": [
      "England",
      "Scotland",
      "Ireland",
      "Wales"
    ],
    "correct": 0
  },
  {
    "question": "Rory McIlroy is from?",
    "choices": [
      "Northern Ireland",
      "Republic of Ireland",
      "Scotland",
      "Wales"
    ],
    "correct": 0
  },
  {
    "question": "Jordan Spieth's biggest year?",
    "choices": [
      "2015",
      "2017",
      "2014",
      "2019"
    ],
    "correct": 0
  },
  {
    "question": "Inbee Park is from?",
    "choices": [
      "South Korea",
      "Japan",
      "China",
      "Taiwan"
    ],
    "correct": 0
  },
  {
    "question": "Lorena Ochoa is from?",
    "choices": [
      "Mexico",
      "Spain",
      "Argentina",
      "Brazil"
    ],
    "correct": 0
  },
  {
    "question": "Babe Zaharias was a multi-sport icon best known in golf for?",
    "choices": [
      "Founding the LPGA",
      "Winning the Masters",
      "Setting Olympic golf records",
      "Coaching"
    ],
    "correct": 0
  },
  {
    "question": "What is a 'mulligan'?",
    "choices": [
      "Free do-over",
      "Lost ball penalty",
      "Drop fee",
      "Rangefinder"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GolfGreatsQuizSettings): GolfGreatsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GolfGreatsQuizState, action: GolfGreatsQuizAction): GolfGreatsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GolfGreatsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
