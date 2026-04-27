import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface InsectsWorldQuizSettings { questions: "10" | "20"; }
export interface InsectsWorldQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type InsectsWorldQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Insects have how many body segments?",
    "choices": [
      "3 (head/thorax/abdomen)",
      "2",
      "4",
      "6"
    ],
    "correct": 0
  },
  {
    "question": "Insects have how many legs?",
    "choices": [
      "6",
      "4",
      "8",
      "10"
    ],
    "correct": 0
  },
  {
    "question": "Spiders are NOT insects because they have?",
    "choices": [
      "8 legs",
      "6 legs",
      "Wings",
      "Antennae"
    ],
    "correct": 0
  },
  {
    "question": "The most numerous insect order is?",
    "choices": [
      "Coleoptera (beetles)",
      "Diptera",
      "Lepidoptera",
      "Hymenoptera"
    ],
    "correct": 0
  },
  {
    "question": "Butterflies and moths belong to?",
    "choices": [
      "Lepidoptera",
      "Coleoptera",
      "Diptera",
      "Hymenoptera"
    ],
    "correct": 0
  },
  {
    "question": "Bees, wasps, and ants belong to?",
    "choices": [
      "Hymenoptera",
      "Coleoptera",
      "Diptera",
      "Lepidoptera"
    ],
    "correct": 0
  },
  {
    "question": "Flies belong to?",
    "choices": [
      "Diptera",
      "Coleoptera",
      "Lepidoptera",
      "Hymenoptera"
    ],
    "correct": 0
  },
  {
    "question": "Mosquitoes belong to?",
    "choices": [
      "Diptera",
      "Hemiptera",
      "Coleoptera",
      "Hymenoptera"
    ],
    "correct": 0
  },
  {
    "question": "Dragonflies belong to?",
    "choices": [
      "Odonata",
      "Diptera",
      "Hemiptera",
      "Orthoptera"
    ],
    "correct": 0
  },
  {
    "question": "Grasshoppers belong to?",
    "choices": [
      "Orthoptera",
      "Hemiptera",
      "Diptera",
      "Coleoptera"
    ],
    "correct": 0
  },
  {
    "question": "Honey bees live in?",
    "choices": [
      "Highly organized colonies",
      "Solitary nests",
      "Underground only",
      "Pairs"
    ],
    "correct": 0
  },
  {
    "question": "Most worker honey bees are?",
    "choices": [
      "Females",
      "Males",
      "Either",
      "Sterile drones"
    ],
    "correct": 0
  },
  {
    "question": "Drone bees are?",
    "choices": [
      "Males",
      "Females",
      "Workers",
      "Larvae"
    ],
    "correct": 0
  },
  {
    "question": "Monarch butterflies migrate to?",
    "choices": [
      "Mexico",
      "Brazil",
      "Florida",
      "Cuba"
    ],
    "correct": 0
  },
  {
    "question": "Caterpillars become butterflies via?",
    "choices": [
      "Complete metamorphosis",
      "Incomplete metamorphosis",
      "Asexual reproduction",
      "Direct development"
    ],
    "correct": 0
  },
  {
    "question": "Grasshoppers undergo?",
    "choices": [
      "Incomplete metamorphosis",
      "Complete metamorphosis",
      "No metamorphosis",
      "Asexual development"
    ],
    "correct": 0
  },
  {
    "question": "Termites are most closely related to?",
    "choices": [
      "Cockroaches",
      "Ants",
      "Bees",
      "Wasps"
    ],
    "correct": 0
  },
  {
    "question": "Fireflies produce light via?",
    "choices": [
      "Bioluminescence",
      "Heat",
      "Sun reflection",
      "Electricity"
    ],
    "correct": 0
  },
  {
    "question": "Cicadas can live underground for up to?",
    "choices": [
      "17 years",
      "2 years",
      "3 months",
      "50 years"
    ],
    "correct": 0
  },
  {
    "question": "Praying mantises ambush prey using?",
    "choices": [
      "Forelimbs",
      "Long legs",
      "Wings",
      "Stingers"
    ],
    "correct": 0
  },
  {
    "question": "Ants communicate primarily via?",
    "choices": [
      "Pheromones",
      "Sounds",
      "Sight",
      "Touch only"
    ],
    "correct": 0
  },
  {
    "question": "Leafcutter ants farm?",
    "choices": [
      "Fungus",
      "Bacteria",
      "Algae",
      "Mushrooms"
    ],
    "correct": 0
  },
  {
    "question": "Bees pollinate by?",
    "choices": [
      "Carrying pollen on bodies",
      "Eating then dispersing",
      "Cutting flowers",
      "Spraying water"
    ],
    "correct": 0
  },
  {
    "question": "Beetles can be identified by their?",
    "choices": [
      "Hardened forewings",
      "Furry abdomen",
      "Long antennae",
      "Reflective eyes"
    ],
    "correct": 0
  },
  {
    "question": "The hardened forewings of beetles are called?",
    "choices": [
      "Elytra",
      "Tegmina",
      "Halteres",
      "Setae"
    ],
    "correct": 0
  },
  {
    "question": "True bugs have?",
    "choices": [
      "Piercing-sucking mouthparts",
      "Chewing mouthparts",
      "Filtering",
      "Lapping"
    ],
    "correct": 0
  },
  {
    "question": "Insects breathe through?",
    "choices": [
      "Spiracles/tracheae",
      "Lungs",
      "Gills",
      "Skin only"
    ],
    "correct": 0
  },
  {
    "question": "Largest insect by wingspan is?",
    "choices": [
      "Atlas moth",
      "Monarch",
      "Hornet",
      "Dragonfly"
    ],
    "correct": 0
  },
  {
    "question": "Insect biomass on Earth exceeds?",
    "choices": [
      "All wild mammals",
      "All birds",
      "Plants",
      "Bacteria"
    ],
    "correct": 0
  },
  {
    "question": "Cockroaches are remarkable for their?",
    "choices": [
      "Survival ability",
      "Flight speed",
      "Pollination",
      "Silk-making"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: InsectsWorldQuizSettings): InsectsWorldQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: InsectsWorldQuizState, action: InsectsWorldQuizAction): InsectsWorldQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: InsectsWorldQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
