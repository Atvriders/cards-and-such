import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FarmAnimalQuizSettings { questions: "10" | "20" | "30"; }
export interface FarmAnimalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FarmAnimalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Cattle have how many functional stomach compartments?", choices: ["1", "2", "4", "7"], correct: 2 },
  { question: "A heifer is a?", choices: ["Young female cow that has not calved", "Bull", "Mature cow with many calves", "Steer"], correct: 0 },
  { question: "A steer is a?", choices: ["Female cow", "Castrated male bovine", "Young bull", "Old bull"], correct: 1 },
  { question: "Holsteins are bred primarily for?", choices: ["Beef", "Milk", "Wool", "Draft"], correct: 1 },
  { question: "Angus cattle are best known for?", choices: ["Milk", "Beef and a black coat", "Wool", "Draft work"], correct: 1 },
  { question: "A productive laying hen produces about how many eggs per year?", choices: ["100", "200", "250–300", "500"], correct: 2 },
  { question: "Roosters are needed for hens to lay?", choices: ["Any eggs", "Fertilized eggs only", "More eggs", "Larger eggs"], correct: 1 },
  { question: "A common high-production laying breed is?", choices: ["Leghorn", "Cornish Cross", "Bantam Silkie", "Cochin"], correct: 0 },
  { question: "Cornish Cross chickens are bred for?", choices: ["Eggs", "Meat", "Showmanship", "Pets"], correct: 1 },
  { question: "Pigs are dietarily?", choices: ["Carnivores", "Omnivores", "Strict herbivores", "Insectivores"], correct: 1 },
  { question: "\"Farrowing\" in pigs refers to?", choices: ["Birth", "Feeding", "Tail-docking", "Wallowing"], correct: 0 },
  { question: "Pig gestation is famously approximated as?", choices: ["3 months, 3 weeks, 3 days", "6 months", "1 year", "21 days"], correct: 0 },
  { question: "Sheep gestation is approximately?", choices: ["100 days", "150 days", "210 days", "300 days"], correct: 1 },
  { question: "Sheep are typically sheared?", choices: ["Monthly", "Once or twice a year", "Never", "Daily"], correct: 1 },
  { question: "Goats require fencing that is?", choices: ["Minimal", "Tall and very secure", "Optional", "Tape only"], correct: 1 },
  { question: "A common dairy goat breed is the?", choices: ["Boer", "Nubian", "Spanish", "Kiko"], correct: 1 },
  { question: "Boer goats are primarily raised for?", choices: ["Milk", "Meat", "Wool", "Show only"], correct: 1 },
  { question: "Foot rot is most common in?", choices: ["Sheep and cattle", "Chickens", "Horses", "Geese"], correct: 0 },
  { question: "Mastitis is inflammation of the?", choices: ["Lungs", "Mammary gland (udder)", "Hoof", "Eye"], correct: 1 },
  { question: "Ruminants ferment feed primarily in the?", choices: ["Crop", "Rumen", "Cecum", "Gizzard"], correct: 1 },
  { question: "In poultry, the crop functions to?", choices: ["Lay eggs", "Store and soften food", "Filter water", "Pump blood"], correct: 1 },
  { question: "Coccidiosis in poultry is treated or prevented with?", choices: ["Antibiotics", "Coccidiostats", "Salt", "Vinegar"], correct: 1 },
  { question: "Pasture-raised and grass-fed are?", choices: ["Identical", "Different but related labels", "Banned", "Synthetic"], correct: 1 },
  { question: "Castration in livestock is typically performed?", choices: ["At adulthood", "When animals are young", "At birth only", "Never"], correct: 1 },
  { question: "The first of the Five Freedoms of animal welfare is freedom from?", choices: ["Hunger and thirst", "Movement", "Sound", "Color"], correct: 0 },
  { question: "Sheep are particularly sensitive to which mineral?", choices: ["Iron", "Copper", "Sodium", "Zinc"], correct: 1 },
  { question: "Composting manure reduces?", choices: ["Pasture nutrients", "Pathogens and odor", "Forage growth", "Water quality"], correct: 1 },
  { question: "Avian influenza biosecurity focuses on?", choices: ["Cattle", "Limiting wild bird contact and visitor traffic", "Goats", "Sheep"], correct: 1 },
  { question: "Lambing usually occurs in?", choices: ["Late summer", "Late winter or spring", "Mid-autumn", "Midsummer"], correct: 1 },
  { question: "Cattle ear-tagging is used for?", choices: ["Decoration", "Individual identification", "Feeding", "Cooling"], correct: 1 },
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
