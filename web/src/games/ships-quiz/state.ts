import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShipsQuizSettings { questions: "10" | "20" | "30"; }
export interface ShipsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShipsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Titanic sank in?",
    "choices": [
      "1910",
      "1912",
      "1914",
      "1916"
    ],
    "correct": 1
  },
  {
    "question": "Titanic was built in?",
    "choices": [
      "Liverpool",
      "Belfast",
      "Glasgow",
      "Southampton"
    ],
    "correct": 1
  },
  {
    "question": "Titanic struck a?",
    "choices": [
      "Reef",
      "Iceberg",
      "Submarine",
      "Mine"
    ],
    "correct": 1
  },
  {
    "question": "Mayflower year?",
    "choices": [
      "1605",
      "1620",
      "1635",
      "1650"
    ],
    "correct": 1
  },
  {
    "question": "Columbus's flagship was?",
    "choices": [
      "Pinta",
      "Nina",
      "Santa Maria",
      "Trinidad"
    ],
    "correct": 2
  },
  {
    "question": "HMS Victory was Nelson's flagship at?",
    "choices": [
      "Nile",
      "Trafalgar",
      "Copenhagen",
      "Cape St Vincent"
    ],
    "correct": 1
  },
  {
    "question": "Bismarck was a?",
    "choices": [
      "Cruiser",
      "Battleship",
      "Destroyer",
      "Carrier"
    ],
    "correct": 1
  },
  {
    "question": "USS Constitution nickname?",
    "choices": [
      "Old Ironsides",
      "Old Glory",
      "Old Salt",
      "Old Defender"
    ],
    "correct": 0
  },
  {
    "question": "First ironclad battle (1862)?",
    "choices": [
      "Monitor v Merrimack",
      "Hampton Roads",
      "Both",
      "Mobile"
    ],
    "correct": 2
  },
  {
    "question": "Suez Canal opened?",
    "choices": [
      "1859",
      "1869",
      "1880",
      "1900"
    ],
    "correct": 1
  },
  {
    "question": "Panama Canal opened?",
    "choices": [
      "1904",
      "1914",
      "1924",
      "1934"
    ],
    "correct": 1
  },
  {
    "question": "Magellan's expedition was first to?",
    "choices": [
      "Discover Brazil",
      "Circumnavigate",
      "Reach India",
      "Reach Japan"
    ],
    "correct": 1
  },
  {
    "question": "Captain Cook explored?",
    "choices": [
      "Pacific",
      "Atlantic",
      "Indian",
      "Arctic"
    ],
    "correct": 0
  },
  {
    "question": "USS Enterprise (CVN-65) was first nuclear?",
    "choices": [
      "Sub",
      "Carrier",
      "Destroyer",
      "Cruiser"
    ],
    "correct": 1
  },
  {
    "question": "Queen Mary 2 launched?",
    "choices": [
      "2000",
      "2003",
      "2004",
      "2010"
    ],
    "correct": 2
  },
  {
    "question": "Largest cruise ship class as of 2024?",
    "choices": [
      "Quantum",
      "Oasis",
      "Icon",
      "Sphere"
    ],
    "correct": 2
  },
  {
    "question": "Lusitania sunk by?",
    "choices": [
      "U-boat",
      "Mine",
      "Storm",
      "Iceberg"
    ],
    "correct": 0
  },
  {
    "question": "USS Missouri famous for?",
    "choices": [
      "Pearl Harbor",
      "Japan surrender",
      "D-Day",
      "Midway"
    ],
    "correct": 1
  },
  {
    "question": "Cutty Sark was a?",
    "choices": [
      "Steamer",
      "Tea clipper",
      "Frigate",
      "Battleship"
    ],
    "correct": 1
  },
  {
    "question": "First ship to circumnavigate solo (1898)?",
    "choices": [
      "Slocum's Spray",
      "Chichester",
      "Knox-Johnston",
      "Moitessier"
    ],
    "correct": 0
  },
  {
    "question": "USS Arizona sunk during?",
    "choices": [
      "Pearl Harbor",
      "Midway",
      "Coral Sea",
      "Iwo Jima"
    ],
    "correct": 0
  },
  {
    "question": "Pirate ship 'Queen Anne's Revenge' belonged to?",
    "choices": [
      "Blackbeard",
      "Kidd",
      "Morgan",
      "Drake"
    ],
    "correct": 0
  },
  {
    "question": "Trireme was a?",
    "choices": [
      "Roman lawyer",
      "Greek warship",
      "Egyptian boat",
      "Viking longship"
    ],
    "correct": 1
  },
  {
    "question": "Viking ships are called?",
    "choices": [
      "Knarrs",
      "Longships",
      "Both",
      "Cogs"
    ],
    "correct": 2
  },
  {
    "question": "Battle of Trafalgar year?",
    "choices": [
      "1798",
      "1805",
      "1815",
      "1820"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ShipsQuizSettings): ShipsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShipsQuizState, action: ShipsQuizAction): ShipsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShipsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
