import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReptilesWorldQuizSettings { questions: "10" | "20"; }
export interface ReptilesWorldQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReptilesWorldQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Komodo dragon is from?",
    "choices": [
      "Indonesia",
      "India",
      "Australia",
      "Madagascar"
    ],
    "correct": 0
  },
  {
    "question": "The Komodo dragon is the world's largest?",
    "choices": [
      "Lizard",
      "Snake",
      "Turtle",
      "Crocodilian"
    ],
    "correct": 0
  },
  {
    "question": "Saltwater crocodiles are the largest living?",
    "choices": [
      "Reptile",
      "Mammal",
      "Amphibian",
      "Fish"
    ],
    "correct": 0
  },
  {
    "question": "Alligators differ from crocodiles by their?",
    "choices": [
      "Snout shape",
      "Color",
      "Diet",
      "Eye color"
    ],
    "correct": 0
  },
  {
    "question": "American alligators live primarily in?",
    "choices": [
      "Southeast US",
      "Northwest US",
      "Canada",
      "Mexico"
    ],
    "correct": 0
  },
  {
    "question": "Gharials have very?",
    "choices": [
      "Narrow snouts",
      "Wide snouts",
      "Short tails",
      "Long legs"
    ],
    "correct": 0
  },
  {
    "question": "The reticulated python is from?",
    "choices": [
      "Southeast Asia",
      "South America",
      "Africa",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "The green anaconda is from?",
    "choices": [
      "South America",
      "Africa",
      "Asia",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "King cobras are the world's longest?",
    "choices": [
      "Venomous snake",
      "Constricting snake",
      "Sea snake",
      "Boa"
    ],
    "correct": 0
  },
  {
    "question": "Black mambas live in?",
    "choices": [
      "Sub-Saharan Africa",
      "South America",
      "Asia",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "Inland taipan is the world's most?",
    "choices": [
      "Venomous land snake",
      "Aggressive land snake",
      "Common Australian snake",
      "Rare snake"
    ],
    "correct": 0
  },
  {
    "question": "Galápagos tortoises can live over?",
    "choices": [
      "100 years",
      "30 years",
      "50 years",
      "20 years"
    ],
    "correct": 0
  },
  {
    "question": "Aldabra giant tortoises live near?",
    "choices": [
      "Indian Ocean",
      "Atlantic Ocean",
      "Pacific Ocean",
      "Arctic"
    ],
    "correct": 0
  },
  {
    "question": "Leatherback sea turtles are the largest?",
    "choices": [
      "Sea turtles",
      "Tortoises",
      "Terrapins",
      "Crocodilians"
    ],
    "correct": 0
  },
  {
    "question": "Sea turtles return to which beach to nest?",
    "choices": [
      "The one they hatched on",
      "Closest beach",
      "Random",
      "Tropical beach"
    ],
    "correct": 0
  },
  {
    "question": "The tuatara is from?",
    "choices": [
      "New Zealand",
      "Australia",
      "Galapagos",
      "Madagascar"
    ],
    "correct": 0
  },
  {
    "question": "The tuatara is the only living member of?",
    "choices": [
      "Sphenodontia",
      "Squamata",
      "Testudines",
      "Crocodilia"
    ],
    "correct": 0
  },
  {
    "question": "Geckos have what unique foot adaptation?",
    "choices": [
      "Setae for sticking",
      "Webbed toes",
      "Claws only",
      "Suction cups"
    ],
    "correct": 0
  },
  {
    "question": "Chameleons can change color due to?",
    "choices": [
      "Specialized skin cells",
      "Pigment glands",
      "Sun exposure",
      "Reflection"
    ],
    "correct": 0
  },
  {
    "question": "Chameleons mostly live in?",
    "choices": [
      "Africa/Madagascar",
      "Australia",
      "South America",
      "Asia mainland"
    ],
    "correct": 0
  },
  {
    "question": "Iguanas are mostly native to?",
    "choices": [
      "Americas",
      "Africa",
      "Asia",
      "Europe"
    ],
    "correct": 0
  },
  {
    "question": "The marine iguana lives only on?",
    "choices": [
      "Galapagos",
      "Madagascar",
      "New Zealand",
      "Hawaii"
    ],
    "correct": 0
  },
  {
    "question": "Sea turtles are which?",
    "choices": [
      "Reptiles",
      "Amphibians",
      "Fish",
      "Mammals"
    ],
    "correct": 0
  },
  {
    "question": "Reptile eggs typically have?",
    "choices": [
      "Leathery shells",
      "Hard mineral shells",
      "No shell",
      "Gelatinous coating"
    ],
    "correct": 0
  },
  {
    "question": "Snakes lack which body part?",
    "choices": [
      "External ears",
      "Internal ears",
      "Spine",
      "Heart"
    ],
    "correct": 0
  },
  {
    "question": "Reptiles regulate body temperature by?",
    "choices": [
      "Behavior (basking)",
      "Internal heat",
      "Sweating",
      "Panting"
    ],
    "correct": 0
  },
  {
    "question": "Pit vipers detect prey via?",
    "choices": [
      "Heat-sensitive pits",
      "Echolocation",
      "Sonar",
      "Magnetism"
    ],
    "correct": 0
  },
  {
    "question": "Rattlesnakes are native to?",
    "choices": [
      "Americas",
      "Africa",
      "Asia",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "Boa constrictors kill by?",
    "choices": [
      "Suffocation",
      "Venom",
      "Crushing bones",
      "Drowning"
    ],
    "correct": 0
  },
  {
    "question": "Most reptiles reproduce by?",
    "choices": [
      "Laying eggs",
      "Live birth",
      "Both equally",
      "Asexual cloning"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ReptilesWorldQuizSettings): ReptilesWorldQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReptilesWorldQuizState, action: ReptilesWorldQuizAction): ReptilesWorldQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReptilesWorldQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
