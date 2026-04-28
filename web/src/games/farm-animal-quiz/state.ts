import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FarmAnimalQuizSettings { questions: "10" | "20" | "30"; }
export interface FarmAnimalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FarmAnimalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Cattle have how many stomach chambers?", choices: ["1", "2", "4", "7"], correct: 2 },
  { question: "Heifer is?", choices: ["Young female cow", "Bull", "Calf only", "Steer"], correct: 0 },
  { question: "Steer is?", choices: ["Female", "Castrated male", "Young bull", "Old bull"], correct: 1 },
  { question: "Holsteins are bred for?", choices: ["Beef", "Milk", "Wool", "Meat"], correct: 1 },
  { question: "Beef Angus color is?", choices: ["Black", "Red", "White", "Brown"], correct: 0 },
  { question: "Hen lays roughly how many eggs/year?", choices: ["100", "200", "250–300", "500"], correct: 2 },
  { question: "Roosters are needed for?", choices: ["Egg laying", "Fertile eggs only", "Predator control", "Sleep"], correct: 1 },
  { question: "Common laying breed?", choices: ["Leghorn", "Cornish", "Bantam", "Broiler"], correct: 0 },
  { question: "Broilers are bred for?", choices: ["Eggs", "Meat", "Showmanship", "Pets"], correct: 1 },
  { question: "Pigs are?", choices: ["Carnivores", "Omnivores", "Herbivores", "Insectivores"], correct: 1 },
  { question: "Pig farrowing is?", choices: ["Birth", "Feeding", "Tail-curl", "Wallowing"], correct: 0 },
  { question: "Average pig gestation (days)?", choices: ["3-3-3 (114)", "60", "180", "21"], correct: 0 },
  { question: "Sheep gestation about?", choices: ["100", "150", "210", "300"], correct: 1 },
  { question: "Sheep are sheared usually?", choices: ["Every month", "Annually", "Never", "Twice yearly"], correct: 1 },
  { question: "Goats need fences that are?", choices: ["Poor", "Strong", "None", "Tape"], correct: 1 },
  { question: "Dairy goats include?", choices: ["Boer", "Nubian", "Spanish", "Kiko"], correct: 1 },
  { question: "Boer goats are bred for?", choices: ["Milk", "Meat", "Wool", "Show"], correct: 1 },
  { question: "Foot rot common in?", choices: ["Sheep/cattle", "Chickens", "Pigs only", "Geese"], correct: 0 },
  { question: "Mastitis affects?", choices: ["Lungs", "Udder", "Hoof", "Eyes"], correct: 1 },
  { question: "Ruminants ferment in?", choices: ["Stomach", "Rumen", "Cecum", "Crop"], correct: 1 },
  { question: "Crop in poultry stores?", choices: ["Eggs", "Food", "Water", "Air"], correct: 1 },
  { question: "Coccidiosis treated with?", choices: ["Antibiotic", "Coccidiostat", "Vaccine only", "Salt"], correct: 1 },
  { question: "Chicken biosecurity to prevent?", choices: ["Avian flu", "Tuberculosis", "Cattle BVD", "Goat orf"], correct: 0 },
  { question: "Pasture-raised vs grass-fed?", choices: ["Same", "Different terms", "Synonyms", "Banned"], correct: 1 },
  { question: "Horns dehorned to?", choices: ["Cosmetic", "Safety", "Speed", "Eat"], correct: 1 },
  { question: "Castration timing typically?", choices: ["Adult", "Young", "Birth", "Never"], correct: 1 },
  { question: "Animal welfare 5 freedoms — first is?", choices: ["Hunger/thirst", "Movement", "Speed", "Color"], correct: 0 },
  { question: "Goats and sheep should not eat?", choices: ["Hay", "Copper-toxic mineral mixes (sheep)", "Grain", "Salt"], correct: 1 },
  { question: "Common cattle parasite?", choices: ["Liver fluke", "Hookworm", "Tapeworm", "Pinworm"], correct: 0 },
  { question: "Composting manure benefits?", choices: ["Pathogens", "Pasture", "Both", "None"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FarmAnimalQuizSettings): FarmAnimalQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FarmAnimalQuizState, action: FarmAnimalQuizAction): FarmAnimalQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FarmAnimalQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
