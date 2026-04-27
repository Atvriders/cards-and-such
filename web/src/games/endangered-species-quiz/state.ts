import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EndangeredSpeciesQuizSettings { questions: "10" | "20"; }
export interface EndangeredSpeciesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EndangeredSpeciesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The IUCN Red List's most severe category is?",
    "choices": [
      "Critically Endangered",
      "Endangered",
      "Vulnerable",
      "Least Concern"
    ],
    "correct": 0
  },
  {
    "question": "Giant pandas live primarily in?",
    "choices": [
      "China",
      "Japan",
      "Vietnam",
      "India"
    ],
    "correct": 0
  },
  {
    "question": "Mountain gorillas live in?",
    "choices": [
      "Africa (Virunga/Bwindi)",
      "Indonesia",
      "Borneo",
      "Madagascar"
    ],
    "correct": 0
  },
  {
    "question": "Mountain gorillas are currently classified as?",
    "choices": [
      "Endangered",
      "Critically endangered",
      "Vulnerable",
      "Least concern"
    ],
    "correct": 0
  },
  {
    "question": "The vaquita lives only in?",
    "choices": [
      "Gulf of California",
      "Caribbean",
      "Mediterranean",
      "Indian Ocean"
    ],
    "correct": 0
  },
  {
    "question": "The vaquita is the world's smallest?",
    "choices": [
      "Cetacean (porpoise)",
      "Whale",
      "Shark",
      "Seal"
    ],
    "correct": 0
  },
  {
    "question": "Sumatran orangutans live in?",
    "choices": [
      "Indonesia",
      "Malaysia only",
      "Vietnam",
      "Philippines"
    ],
    "correct": 0
  },
  {
    "question": "Bornean orangutans live in?",
    "choices": [
      "Borneo (Indonesia/Malaysia)",
      "Sumatra only",
      "Philippines",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "Tigers are native to?",
    "choices": [
      "Asia",
      "Africa",
      "South America",
      "North America"
    ],
    "correct": 0
  },
  {
    "question": "How many tiger subspecies survive?",
    "choices": [
      "6",
      "10",
      "2",
      "50"
    ],
    "correct": 0
  },
  {
    "question": "The Bengal tiger lives in?",
    "choices": [
      "India/Bangladesh/Nepal",
      "Russia",
      "China",
      "Sumatra"
    ],
    "correct": 0
  },
  {
    "question": "The Amur tiger is also called?",
    "choices": [
      "Siberian tiger",
      "Bengal tiger",
      "Sumatran tiger",
      "White tiger"
    ],
    "correct": 0
  },
  {
    "question": "The most threatened rhino species is?",
    "choices": [
      "Javan rhino",
      "White rhino",
      "Black rhino",
      "Indian rhino"
    ],
    "correct": 0
  },
  {
    "question": "Rhino poaching is driven primarily by?",
    "choices": [
      "Horn for traditional medicine",
      "Meat",
      "Hide",
      "Captivity trade"
    ],
    "correct": 0
  },
  {
    "question": "Snow leopards live in?",
    "choices": [
      "High Asian mountains",
      "Sahara",
      "Amazon",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "Polar bears are threatened by?",
    "choices": [
      "Sea ice loss",
      "Hunting only",
      "Habitat fragmentation",
      "Disease"
    ],
    "correct": 0
  },
  {
    "question": "The blue whale is the largest?",
    "choices": [
      "Animal ever",
      "Mammal",
      "Fish",
      "Reptile"
    ],
    "correct": 0
  },
  {
    "question": "Sea turtles face threats from?",
    "choices": [
      "Plastic/bycatch/beach loss",
      "Tornadoes",
      "Volcanoes",
      "Cold snaps"
    ],
    "correct": 0
  },
  {
    "question": "Hawksbill turtles are hunted for?",
    "choices": [
      "Tortoiseshell",
      "Meat",
      "Eggs only",
      "Fishing bait"
    ],
    "correct": 0
  },
  {
    "question": "Kakapo (flightless parrot) lives only in?",
    "choices": [
      "New Zealand",
      "Australia",
      "Madagascar",
      "Hawaii"
    ],
    "correct": 0
  },
  {
    "question": "The California condor near-extinction was reversed via?",
    "choices": [
      "Captive breeding",
      "Hunting bans only",
      "Habitat protection only",
      "No action"
    ],
    "correct": 0
  },
  {
    "question": "The bald eagle was delisted in the US in?",
    "choices": [
      "2007",
      "1980",
      "2020",
      "1995"
    ],
    "correct": 0
  },
  {
    "question": "DDT was banned in the US largely to save?",
    "choices": [
      "Bald eagles, peregrines",
      "Polar bears",
      "Whales",
      "Pandas"
    ],
    "correct": 0
  },
  {
    "question": "Humpback whale populations have?",
    "choices": [
      "Recovered well",
      "Continued declining",
      "Stayed flat",
      "Gone extinct"
    ],
    "correct": 0
  },
  {
    "question": "The pangolin is the world's most?",
    "choices": [
      "Trafficked mammal",
      "Hunted bird",
      "Trafficked reptile",
      "Trafficked fish"
    ],
    "correct": 0
  },
  {
    "question": "The Sumatran rhinoceros is critically threatened due to?",
    "choices": [
      "Tiny remaining population",
      "Climate",
      "Disease only",
      "Predation"
    ],
    "correct": 0
  },
  {
    "question": "The amphibian crisis is driven by?",
    "choices": [
      "Chytrid fungus + habitat loss",
      "Drought",
      "Predation",
      "Invasive birds"
    ],
    "correct": 0
  },
  {
    "question": "Cheetahs face primary threat from?",
    "choices": [
      "Habitat loss/conflict",
      "Poaching for fur only",
      "Disease",
      "Climate ice loss"
    ],
    "correct": 0
  },
  {
    "question": "Atlantic bluefin tuna are threatened by?",
    "choices": [
      "Overfishing",
      "Pollution only",
      "Predators",
      "Algal blooms"
    ],
    "correct": 0
  },
  {
    "question": "The Iberian lynx population recovery is a result of?",
    "choices": [
      "Targeted conservation",
      "Climate",
      "Invasive species",
      "Disease"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EndangeredSpeciesQuizSettings): EndangeredSpeciesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EndangeredSpeciesQuizState, action: EndangeredSpeciesQuizAction): EndangeredSpeciesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EndangeredSpeciesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
