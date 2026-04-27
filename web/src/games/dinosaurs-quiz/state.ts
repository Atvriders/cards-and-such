import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DinosaursQuizSettings { questions: "10" | "20"; }
export interface DinosaursQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DinosaursQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Mesozoic Era lasted roughly?",
    "choices": [
      "252-66 mya",
      "500-300 mya",
      "100-1 mya",
      "1000-500 mya"
    ],
    "correct": 0
  },
  {
    "question": "The three Mesozoic periods are?",
    "choices": [
      "Triassic, Jurassic, Cretaceous",
      "Cambrian, Ordovician, Silurian",
      "Devonian, Carb, Permian",
      "Pliocene, Miocene, Eocene"
    ],
    "correct": 0
  },
  {
    "question": "T. rex lived during the?",
    "choices": [
      "Late Cretaceous",
      "Early Triassic",
      "Middle Jurassic",
      "Eocene"
    ],
    "correct": 0
  },
  {
    "question": "T. rex's name means?",
    "choices": [
      "Tyrant lizard king",
      "Storm hunter",
      "Jaw of doom",
      "Sharp claw"
    ],
    "correct": 0
  },
  {
    "question": "Triceratops had how many horns?",
    "choices": [
      "3",
      "2",
      "1",
      "4"
    ],
    "correct": 0
  },
  {
    "question": "Stegosaurus had what along its back?",
    "choices": [
      "Plates",
      "Horns",
      "Sail",
      "Spines only"
    ],
    "correct": 0
  },
  {
    "question": "Stegosaurus had spikes on its?",
    "choices": [
      "Tail",
      "Head",
      "Belly",
      "Feet"
    ],
    "correct": 0
  },
  {
    "question": "Velociraptor was actually about the size of?",
    "choices": [
      "A turkey",
      "A horse",
      "A dog",
      "A lion"
    ],
    "correct": 0
  },
  {
    "question": "Brachiosaurus had longer?",
    "choices": [
      "Front legs",
      "Back legs",
      "Equal legs",
      "No legs"
    ],
    "correct": 0
  },
  {
    "question": "The longest dinosaurs (sauropods) include?",
    "choices": [
      "Diplodocus, Argentinosaurus",
      "Triceratops",
      "T. rex",
      "Stegosaurus"
    ],
    "correct": 0
  },
  {
    "question": "Spinosaurus likely was?",
    "choices": [
      "Semi-aquatic",
      "Tree-climber",
      "Burrower",
      "Glider"
    ],
    "correct": 0
  },
  {
    "question": "Spinosaurus is famous for its?",
    "choices": [
      "Sail back",
      "Plate back",
      "Spike tail",
      "Horned face"
    ],
    "correct": 0
  },
  {
    "question": "Allosaurus lived during?",
    "choices": [
      "Late Jurassic",
      "Early Cretaceous",
      "Late Cretaceous",
      "Triassic"
    ],
    "correct": 0
  },
  {
    "question": "Pterosaurs were?",
    "choices": [
      "Flying reptiles, not dinosaurs",
      "Flying dinosaurs",
      "Aquatic dinosaurs",
      "Mammals"
    ],
    "correct": 0
  },
  {
    "question": "Plesiosaurs were?",
    "choices": [
      "Marine reptiles",
      "Dinosaurs",
      "Sharks",
      "Whales"
    ],
    "correct": 0
  },
  {
    "question": "The mass extinction at the end of Cretaceous is called?",
    "choices": [
      "K-Pg extinction",
      "Permian extinction",
      "Devonian extinction",
      "Ordovician extinction"
    ],
    "correct": 0
  },
  {
    "question": "What likely caused the K-Pg extinction?",
    "choices": [
      "Asteroid impact",
      "Volcanism only",
      "Disease",
      "Glacial age"
    ],
    "correct": 0
  },
  {
    "question": "The Chicxulub crater is on?",
    "choices": [
      "Yucatan peninsula",
      "Siberia",
      "Greenland",
      "Madagascar"
    ],
    "correct": 0
  },
  {
    "question": "Modern birds are descended from?",
    "choices": [
      "Theropod dinosaurs",
      "Sauropods",
      "Stegosaurs",
      "Pterosaurs"
    ],
    "correct": 0
  },
  {
    "question": "Iguanodon is famous for its?",
    "choices": [
      "Thumb spike",
      "Long neck",
      "Horns",
      "Sail back"
    ],
    "correct": 0
  },
  {
    "question": "Hadrosaurs are also known as?",
    "choices": [
      "Duck-billed dinosaurs",
      "Horned dinosaurs",
      "Plate-backed",
      "Long-necked"
    ],
    "correct": 0
  },
  {
    "question": "Parasaurolophus is famous for its?",
    "choices": [
      "Crested head",
      "Plates",
      "Horns",
      "Sail"
    ],
    "correct": 0
  },
  {
    "question": "Ankylosaurs were heavily?",
    "choices": [
      "Armored",
      "Long-necked",
      "Horned only",
      "Sailed"
    ],
    "correct": 0
  },
  {
    "question": "Ankylosaurus had a?",
    "choices": [
      "Tail club",
      "Long neck",
      "Sail",
      "Horn"
    ],
    "correct": 0
  },
  {
    "question": "Pachycephalosaurus had a thick?",
    "choices": [
      "Skull dome",
      "Tail",
      "Foot",
      "Beak"
    ],
    "correct": 0
  },
  {
    "question": "Argentinosaurus is one of the largest known?",
    "choices": [
      "Sauropods",
      "Theropods",
      "Ceratopsians",
      "Stegosaurids"
    ],
    "correct": 0
  },
  {
    "question": "Therizinosaurs are notable for?",
    "choices": [
      "Long claws",
      "Long horns",
      "Sail backs",
      "Long necks"
    ],
    "correct": 0
  },
  {
    "question": "The first named dinosaur was?",
    "choices": [
      "Megalosaurus",
      "T. rex",
      "Iguanodon",
      "Brontosaurus"
    ],
    "correct": 0
  },
  {
    "question": "Microraptor is famous for having?",
    "choices": [
      "Four feathered wings",
      "Long horns",
      "Plates",
      "Spike tail"
    ],
    "correct": 0
  },
  {
    "question": "Most paleontologists agree some theropods had?",
    "choices": [
      "Feathers",
      "Scales only",
      "Fur",
      "Naked skin only"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DinosaursQuizSettings): DinosaursQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DinosaursQuizState, action: DinosaursQuizAction): DinosaursQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DinosaursQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
