import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReptileCareQuizSettings { questions: "10" | "20" | "30"; }
export interface ReptileCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReptileCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Reptiles regulate body temperature as?", choices: ["Endotherms", "Ectotherms", "Homeotherms", "Mesotherms"], correct: 1 },
  { question: "Bearded dragons need daily exposure to?", choices: ["UVA only", "UVB", "Infrared only", "Visible only"], correct: 1 },
  { question: "Most UVB bulbs need replacement every?", choices: ["Never", "6–12 months", "5 years", "Daily"], correct: 1 },
  { question: "A leopard gecko's hot-spot temperature should be about?", choices: ["70°F", "78°F", "88–92°F", "110°F"], correct: 2 },
  { question: "Ball pythons can live about?", choices: ["5 years", "15 years", "30+ years", "60 years"], correct: 2 },
  { question: "Adult bearded dragon diets should shift toward?", choices: ["More greens", "More insects", "Pure fruit", "Fish"], correct: 0 },
  { question: "Calcium dusting on feeder insects is generally given?", choices: ["Never", "Daily", "Per a species-specific schedule", "Yearly"], correct: 2 },
  { question: "Brumation refers to?", choices: ["Aggression", "A reptile's winter dormancy", "A color phase", "A skin disease"], correct: 1 },
  { question: "Crested geckos prefer enclosures that are?", choices: ["Hot and dry", "Cool and humid", "Desert", "Aquatic"], correct: 1 },
  { question: "Adult corn snakes typically reach?", choices: ["1 foot", "3–6 feet", "15 feet", "25 feet"], correct: 1 },
  { question: "A key difference between many boas and pythons is?", choices: ["Boas are live-bearing; pythons lay eggs", "Color only", "Size only", "Sound"], correct: 0 },
  { question: "Green iguanas, when adult, need?", choices: ["Tiny terrariums", "Very large custom enclosures", "Aquariums only", "Cardboard boxes"], correct: 1 },
  { question: "Tortoise diets should consist mostly of?", choices: ["Meat", "Grasses and leafy greens", "Fish", "Seeds only"], correct: 1 },
  { question: "Aquatic turtles require UVB?", choices: ["No", "Yes", "Only weekly", "Optional"], correct: 1 },
  { question: "Salmonella exposure from reptiles is?", choices: ["Not a concern", "A real risk; wash hands after handling", "Only from snakes", "Only from turtles"], correct: 1 },
  { question: "MBD in reptiles stands for?", choices: ["Metabolic Bone Disease", "Mid-Body Disorder", "Major Beak Disease", "Multi-Bacterial Disease"], correct: 0 },
  { question: "Heat lamp wattage should be matched to?", choices: ["Bulb cost", "Enclosure size and target gradient", "Brand color", "Country of origin"], correct: 1 },
  { question: "A substrate to avoid for many hatchlings is?", choices: ["Paper towel", "Loose sand", "Tile", "Reptile carpet (correctly maintained)"], correct: 1 },
  { question: "A bioactive enclosure includes?", choices: ["Live plants and a cleanup crew", "Plastic only", "Concrete", "Foil lining"], correct: 0 },
  { question: "Adult ball pythons are typically fed?", choices: ["Daily", "Every 1–2 weeks", "Once a year", "Hourly"], correct: 1 },
  { question: "Frozen-thawed feeders are generally preferred over live because?", choices: ["They are cheaper only", "They are safer for the snake", "They taste better", "They are colorful"], correct: 1 },
  { question: "Ball python ambient humidity is best around?", choices: ["10%", "50–60%", "100%", "0%"], correct: 1 },
  { question: "Veiled chameleons drink water best from?", choices: ["A standing bowl", "Drips and misting", "A pool", "Their food only"], correct: 1 },
  { question: "Tegus are large?", choices: ["Snakes", "Lizards", "Turtles", "Frogs"], correct: 1 },
  { question: "Sex determination in many turtles depends on?", choices: ["Genetics only", "Incubation temperature", "Egg size", "Shell color"], correct: 1 },
  { question: "A vivarium differs from an aquarium primarily in being?", choices: ["Saltwater", "Land-based or semi-aquatic", "Filled with rocks only", "Cold only"], correct: 1 },
  { question: "Snake shedding (ecdysis) occurs?", choices: ["Daily", "Periodically as the snake grows", "Only once", "Never"], correct: 1 },
  { question: "A common annual reptile health screen includes?", choices: ["A fecal parasite check", "Hair analysis", "Bone X-ray", "DNA test"], correct: 0 },
  { question: "Adequate humidity is most critical during?", choices: ["Brumation", "Shedding", "Feeding only", "Sleep only"], correct: 1 },
  { question: "A reptile's basking spot should be?", choices: ["Anywhere in the cage", "On one end to create a thermal gradient", "In the middle only", "Outside the cage"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ReptileCareQuizSettings): ReptileCareQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReptileCareQuizState, action: ReptileCareQuizAction): ReptileCareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReptileCareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
