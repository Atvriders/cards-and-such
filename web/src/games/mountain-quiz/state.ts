import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MountainQuizSettings { questions: "10" | "20"; }
export interface MountainQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MountainQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tallest mountain on Earth (above sea level)?",
    "choices": [
      "K2",
      "Mount Everest",
      "Mount Kilimanjaro",
      "Denali"
    ],
    "correct": 1
  },
  {
    "question": "Mount Everest is in which range?",
    "choices": [
      "Andes",
      "Himalayas",
      "Alps",
      "Rockies"
    ],
    "correct": 1
  },
  {
    "question": "Tallest mountain in Africa?",
    "choices": [
      "Mount Kenya",
      "Mount Kilimanjaro",
      "Atlas Mountains",
      "Drakensberg"
    ],
    "correct": 1
  },
  {
    "question": "Mount Fuji is in which country?",
    "choices": [
      "China",
      "Japan",
      "Korea",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in North America?",
    "choices": [
      "Mount Whitney",
      "Denali",
      "Mount Logan",
      "Mount Rainier"
    ],
    "correct": 1
  },
  {
    "question": "K2 is on the border of which countries?",
    "choices": [
      "India and Nepal",
      "Pakistan and China",
      "Afghanistan and Tajikistan",
      "India and Bhutan"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in South America?",
    "choices": [
      "Aconcagua",
      "Cotopaxi",
      "Huascar\u00e1n",
      "Chimborazo"
    ],
    "correct": 0
  },
  {
    "question": "Matterhorn is in which range?",
    "choices": [
      "Pyrenees",
      "Carpathians",
      "Alps",
      "Apennines"
    ],
    "correct": 2
  },
  {
    "question": "Mount Olympus is in which country?",
    "choices": [
      "Italy",
      "Greece",
      "Turkey",
      "Cyprus"
    ],
    "correct": 1
  },
  {
    "question": "Highest mountain in the British Isles?",
    "choices": [
      "Scafell Pike",
      "Snowdon",
      "Ben Nevis",
      "Carrauntoohil"
    ],
    "correct": 2
  },
  {
    "question": "Highest mountain in Antarctica?",
    "choices": [
      "Vinson Massif",
      "Mount Sidley",
      "Mount Erebus",
      "Mount Tyree"
    ],
    "correct": 0
  },
  {
    "question": "Mount Rushmore is in which US state?",
    "choices": [
      "Montana",
      "Wyoming",
      "South Dakota",
      "Colorado"
    ],
    "correct": 2
  },
  {
    "question": "Highest peak in Europe (counting Caucasus)?",
    "choices": [
      "Mont Blanc",
      "Mount Elbrus",
      "Matterhorn",
      "Mount Etna"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak entirely within the Alps?",
    "choices": [
      "Matterhorn",
      "Mont Blanc",
      "Eiger",
      "Jungfrau"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in Australia (mainland)?",
    "choices": [
      "Mount Kosciuszko",
      "Mount Bogong",
      "Mount Townsend",
      "Mount Ossa"
    ],
    "correct": 0
  },
  {
    "question": "What range divides Europe and Asia?",
    "choices": [
      "Caucasus",
      "Urals",
      "Carpathians",
      "Balkans"
    ],
    "correct": 1
  },
  {
    "question": "Mount Vesuvius is near which city?",
    "choices": [
      "Rome",
      "Naples",
      "Milan",
      "Athens"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in the Rocky Mountains?",
    "choices": [
      "Mount Whitney",
      "Mount Elbert",
      "Pikes Peak",
      "Mount Massive"
    ],
    "correct": 1
  },
  {
    "question": "Annapurna is located in which country?",
    "choices": [
      "India",
      "Nepal",
      "Bhutan",
      "Tibet"
    ],
    "correct": 1
  },
  {
    "question": "What does 'sierra' mean in Spanish (mountain term)?",
    "choices": [
      "Snow",
      "Saw (range)",
      "Stone",
      "Summit"
    ],
    "correct": 1
  },
  {
    "question": "Highest peak in the Andes?",
    "choices": [
      "Aconcagua",
      "Cerro Torre",
      "Huascar\u00e1n",
      "Ojos del Salado"
    ],
    "correct": 0
  },
  {
    "question": "Mont Blanc is on the border of which countries?",
    "choices": [
      "France and Italy",
      "France and Switzerland",
      "Italy and Switzerland",
      "Austria and Italy"
    ],
    "correct": 0
  },
  {
    "question": "Which range is in Tanzania?",
    "choices": [
      "Atlas",
      "Drakensberg",
      "Kilimanjaro range",
      "Ahaggar"
    ],
    "correct": 2
  },
  {
    "question": "Mount St. Helens is in which US state?",
    "choices": [
      "Oregon",
      "Washington",
      "California",
      "Idaho"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MountainQuizSettings): MountainQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MountainQuizState, action: MountainQuizAction): MountainQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MountainQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
