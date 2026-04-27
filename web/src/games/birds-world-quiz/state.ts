import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BirdsWorldQuizSettings { questions: "10" | "20"; }
export interface BirdsWorldQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BirdsWorldQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The world's fastest bird in dive is?",
    "choices": [
      "Peregrine falcon",
      "Golden eagle",
      "Albatross",
      "Hummingbird"
    ],
    "correct": 0
  },
  {
    "question": "The largest bird is?",
    "choices": [
      "Ostrich",
      "Emu",
      "Albatross",
      "Cassowary"
    ],
    "correct": 0
  },
  {
    "question": "The smallest bird is?",
    "choices": [
      "Bee hummingbird",
      "Goldcrest",
      "Wren",
      "Sparrow"
    ],
    "correct": 0
  },
  {
    "question": "Penguins are native to?",
    "choices": [
      "Southern hemisphere",
      "Northern hemisphere only",
      "Both equally",
      "Arctic only"
    ],
    "correct": 0
  },
  {
    "question": "The kiwi is from?",
    "choices": [
      "New Zealand",
      "Australia",
      "Madagascar",
      "Tasmania"
    ],
    "correct": 0
  },
  {
    "question": "The cassowary lives in?",
    "choices": [
      "New Guinea/Australia",
      "South America",
      "Africa",
      "Asia mainland"
    ],
    "correct": 0
  },
  {
    "question": "The bald eagle is the national bird of?",
    "choices": [
      "United States",
      "Canada",
      "Mexico",
      "Brazil"
    ],
    "correct": 0
  },
  {
    "question": "Hummingbirds are native only to?",
    "choices": [
      "Americas",
      "Africa",
      "Asia",
      "Europe"
    ],
    "correct": 0
  },
  {
    "question": "Toucans are famous for their?",
    "choices": [
      "Large bill",
      "Long legs",
      "Flightlessness",
      "Bright eyes"
    ],
    "correct": 0
  },
  {
    "question": "Macaws are native to?",
    "choices": [
      "Central/South America",
      "Africa",
      "Asia",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "Albatrosses are famous for?",
    "choices": [
      "Long wingspan",
      "Speed",
      "Diving",
      "Flightlessness"
    ],
    "correct": 0
  },
  {
    "question": "The wandering albatross has a wingspan of about?",
    "choices": [
      "10-11 ft",
      "4-5 ft",
      "20-25 ft",
      "1-2 ft"
    ],
    "correct": 0
  },
  {
    "question": "The harpy eagle lives in?",
    "choices": [
      "Tropical rainforest (Americas)",
      "Arctic",
      "Sahara",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "The shoebill stork lives in?",
    "choices": [
      "African swamps",
      "Antarctic",
      "Asian forests",
      "Australian deserts"
    ],
    "correct": 0
  },
  {
    "question": "Flamingos get their pink color from?",
    "choices": [
      "Crustaceans/algae diet",
      "Sun exposure",
      "Air pollution",
      "Mineral water"
    ],
    "correct": 0
  },
  {
    "question": "The peacock's spectacular tail belongs to which sex?",
    "choices": [
      "Male",
      "Female",
      "Juvenile",
      "Both"
    ],
    "correct": 0
  },
  {
    "question": "Owls are mostly?",
    "choices": [
      "Nocturnal raptors",
      "Diurnal songbirds",
      "Aquatic divers",
      "Flightless"
    ],
    "correct": 0
  },
  {
    "question": "The snowy owl lives in?",
    "choices": [
      "Arctic tundra",
      "Sahara",
      "Amazon",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "The dodo was native to?",
    "choices": [
      "Mauritius",
      "Madagascar",
      "Indonesia",
      "New Zealand"
    ],
    "correct": 0
  },
  {
    "question": "The dodo was a flightless?",
    "choices": [
      "Pigeon relative",
      "Duck",
      "Falcon",
      "Penguin"
    ],
    "correct": 0
  },
  {
    "question": "Robins (American) are most closely related to?",
    "choices": [
      "Thrushes",
      "Sparrows",
      "Finches",
      "Wrens"
    ],
    "correct": 0
  },
  {
    "question": "The American bald eagle's diet is mostly?",
    "choices": [
      "Fish",
      "Small mammals",
      "Snakes",
      "Insects"
    ],
    "correct": 0
  },
  {
    "question": "The Arctic tern migrates between?",
    "choices": [
      "Arctic and Antarctic",
      "Asia and Africa",
      "NA and SA",
      "Europe and Asia"
    ],
    "correct": 0
  },
  {
    "question": "Most parrots are native to?",
    "choices": [
      "Southern hemisphere",
      "Northern hemisphere",
      "Both equally",
      "Arctic"
    ],
    "correct": 0
  },
  {
    "question": "Penguins use wings to?",
    "choices": [
      "Swim",
      "Fly",
      "Burrow",
      "Climb"
    ],
    "correct": 0
  },
  {
    "question": "Crows belong to which clever family?",
    "choices": [
      "Corvidae",
      "Picidae",
      "Tyrannidae",
      "Anatidae"
    ],
    "correct": 0
  },
  {
    "question": "Woodpeckers belong to which family?",
    "choices": [
      "Picidae",
      "Corvidae",
      "Strigidae",
      "Turdidae"
    ],
    "correct": 0
  },
  {
    "question": "Pelicans are famous for?",
    "choices": [
      "Large throat pouch",
      "Long legs",
      "Flightlessness",
      "Bright tails"
    ],
    "correct": 0
  },
  {
    "question": "The kakapo is a flightless?",
    "choices": [
      "Parrot",
      "Pigeon",
      "Eagle",
      "Penguin"
    ],
    "correct": 0
  },
  {
    "question": "Birds evolved from which dinosaur lineage?",
    "choices": [
      "Theropods",
      "Sauropods",
      "Ceratopsians",
      "Stegosaurids"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BirdsWorldQuizSettings): BirdsWorldQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BirdsWorldQuizState, action: BirdsWorldQuizAction): BirdsWorldQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BirdsWorldQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
