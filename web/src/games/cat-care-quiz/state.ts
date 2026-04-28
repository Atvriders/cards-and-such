import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CatCareQuizSettings { questions: "10" | "20" | "30"; }
export interface CatCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CatCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Core feline vaccines include?", choices: ["FVRCP, rabies", "Only rabies", "FeLV only", "FIV only"], correct: 0 },
  { question: "Litter box rule: number of boxes per cat?", choices: ["1", "n+1", "2 always", "None"], correct: 1 },
  { question: "Indoor cats live, on average?", choices: ["Less", "Longer", "Same", "Not studied"], correct: 1 },
  { question: "Cats are obligate?", choices: ["Herbivores", "Omnivores", "Carnivores", "Insectivores"], correct: 2 },
  { question: "Lily plants are?", choices: ["Safe", "Toxic — kidneys", "Calming", "Tonic"], correct: 1 },
  { question: "Hairballs help via?", choices: ["Brushing", "Surgery", "Bath", "Free-feeding"], correct: 0 },
  { question: "Adult cat meals/day?", choices: ["1", "2 (typical)", "6", "Free-feed only"], correct: 1 },
  { question: "Wet food helps with?", choices: ["Hydration", "Dental", "Weight gain", "Coat"], correct: 0 },
  { question: "FeLV stands for?", choices: ["Feline Eyelash Virus", "Feline Leukemia Virus", "Feline ELP", "Feline EuLV"], correct: 1 },
  { question: "Most common feline cancer?", choices: ["Lymphoma", "Hemangiosarcoma", "Mast cell", "Osteo"], correct: 0 },
  { question: "Dental disease in cats by age 3?", choices: ["<10%", ">50%", "100%", "<5%"], correct: 1 },
  { question: "Spaying reduces risk of?", choices: ["Diabetes", "Mammary cancer", "Asthma", "Cataracts"], correct: 1 },
  { question: "Kitten core vaccinations begin at?", choices: ["2 weeks", "6–8 weeks", "12 weeks", "6 months"], correct: 1 },
  { question: "Microchipping helps?", choices: ["Track GPS", "Identify lost cat", "Vaccinate", "Train"], correct: 1 },
  { question: "Scratching is?", choices: ["Bad", "Normal/marking", "Aggression", "Hunger"], correct: 1 },
  { question: "Best alternative to declawing?", choices: ["Surgery", "Scratch posts/trimming", "Glue", "Cone"], correct: 1 },
  { question: "Catnip affects what % of cats?", choices: ["10%", "30%", "50–75%", "100%"], correct: 2 },
  { question: "Cats purr when?", choices: ["Only happy", "Various states", "Sleeping", "Hunting"], correct: 1 },
  { question: "Vertical territory means?", choices: ["Stairs", "Cat trees", "Counters", "Windows only"], correct: 1 },
  { question: "Diabetes in cats often associated with?", choices: ["Obesity", "Travel", "Cold", "Bath"], correct: 0 },
  { question: "Hyperthyroidism common in?", choices: ["Kittens", "Senior cats", "Adolescent", "Adult only"], correct: 1 },
  { question: "CKD (kidney disease) signs include?", choices: ["Drinking more", "Less drinking", "Vomiting only", "None"], correct: 0 },
  { question: "Best brushing for long-haired cat?", choices: ["Monthly", "Weekly+", "Yearly", "Never"], correct: 1 },
  { question: "Litter texture cats prefer?", choices: ["Pellets", "Fine clumping (mostly)", "Sand", "Crystal only"], correct: 1 },
  { question: "Kitten socialization window?", choices: ["2–7 weeks", "8–12 weeks", "3–6 mo", "1 year"], correct: 0 },
  { question: "UTI signs in cats?", choices: ["Frequent litter visits", "Blood/strain", "Vocalization", "All listed"], correct: 3 },
  { question: "Cats hide pain because?", choices: ["Healthy", "Prey instinct", "Bored", "Cold"], correct: 1 },
  { question: "Feliway is a?", choices: ["Toy", "Pheromone product", "Vaccine", "Treat"], correct: 1 },
  { question: "Recommended veterinary visit?", choices: ["Bi-annual", "Annual", "Every 5 years", "Only if sick"], correct: 1 },
  { question: "Toxic dietary supplement to cats?", choices: ["Fish oil", "Some essential oils", "Vitamin B", "Glucosamine"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CatCareQuizSettings): CatCareQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CatCareQuizState, action: CatCareQuizAction): CatCareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CatCareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
