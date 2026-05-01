import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CatCareQuizSettings { questions: "10" | "20" | "30"; }
export interface CatCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CatCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "FVRCP vaccine protects against rhinotracheitis, calicivirus, and?", choices: ["Rabies", "Panleukopenia", "FeLV", "FIV"], correct: 1 },
  { question: "The recommended litter-box rule for multi-cat homes is?", choices: ["1 box total", "One per cat plus one extra", "Two boxes total", "No boxes"], correct: 1 },
  { question: "Compared with outdoor cats, indoor cats typically?", choices: ["Live shorter lives", "Live longer lives", "Live the same", "Are unstudied"], correct: 1 },
  { question: "Cats are classified dietarily as?", choices: ["Herbivores", "Omnivores", "Obligate carnivores", "Insectivores"], correct: 2 },
  { question: "True or pet lilies are dangerous to cats because they cause?", choices: ["Liver tumors", "Acute kidney failure", "Blindness", "Asthma"], correct: 1 },
  { question: "Hairballs in long-haired cats are best reduced by?", choices: ["Surgery", "Regular brushing", "Bathing daily", "Free-feeding"], correct: 1 },
  { question: "Wet food benefits most cats by improving?", choices: ["Hydration", "Hearing", "Coat color", "Eyesight"], correct: 0 },
  { question: "FeLV stands for?", choices: ["Feline Leukemia Virus", "Feline Eye Virus", "Feline Liver Virus", "Feline Lung Virus"], correct: 0 },
  { question: "The most common feline cancer is?", choices: ["Lymphoma", "Osteosarcoma", "Melanoma", "Mast cell"], correct: 0 },
  { question: "Spaying a cat before her first heat reduces risk of?", choices: ["Diabetes", "Mammary cancer", "Cataracts", "Asthma"], correct: 1 },
  { question: "Kittens typically start vaccinations at?", choices: ["2 weeks", "6–8 weeks", "4 months", "1 year"], correct: 1 },
  { question: "Scratching is best redirected by providing?", choices: ["A spray bottle", "Sturdy scratching posts", "Soft pillows", "Bare walls"], correct: 1 },
  { question: "Roughly what percentage of cats respond to catnip?", choices: ["Around 10%", "Around 30%", "About 50–75%", "100%"], correct: 2 },
  { question: "Vertical territory for cats means?", choices: ["Stairs", "Climbing surfaces and perches", "Closed rooms", "Tunnels"], correct: 1 },
  { question: "Feline diabetes is most strongly linked to?", choices: ["Cold weather", "Obesity", "Dental disease", "Allergies"], correct: 1 },
  { question: "Hyperthyroidism is most common in?", choices: ["Kittens", "Senior cats", "Pregnant cats", "Outdoor only"], correct: 1 },
  { question: "Early signs of chronic kidney disease in cats include?", choices: ["Increased thirst and urination", "Reduced thirst", "Aggression", "Sneezing"], correct: 0 },
  { question: "Most cats prefer which litter type?", choices: ["Pine pellets", "Fine-grain unscented clumping", "Crystals", "Newspaper"], correct: 1 },
  { question: "The kitten socialization window is approximately?", choices: ["2–7 weeks", "8–12 weeks", "3–6 months", "1 year+"], correct: 0 },
  { question: "Common signs of feline lower urinary tract disease include?", choices: ["Frequent painful urination", "Excess sleeping", "Increased appetite", "Coat changes"], correct: 0 },
  { question: "Cats often hide pain because they are?", choices: ["Healthy", "Both prey and predator", "Bored", "Cold"], correct: 1 },
  { question: "Feliway is a synthetic version of which feline pheromone?", choices: ["Alarm", "Facial bunting", "Territorial", "Mating"], correct: 1 },
  { question: "Healthy adult cats should see a vet at least?", choices: ["Every 5 years", "Annually", "Only when sick", "Monthly"], correct: 1 },
  { question: "Which essential oils are particularly toxic to cats?", choices: ["All EOs are safe", "Tea tree, citrus, pine, eucalyptus", "Only mint", "Only rose"], correct: 1 },
  { question: "A normal cat resting heart rate is about?", choices: ["20–40 bpm", "140–220 bpm", "300+ bpm", "60 bpm"], correct: 1 },
  { question: "Cats are most active at?", choices: ["Midday", "Dawn and dusk (crepuscular)", "Midnight only", "Always sleeping"], correct: 1 },
  { question: "Tylenol (acetaminophen) in cats causes?", choices: ["Helpful pain relief", "Fatal red-blood-cell damage", "Mild upset", "Allergy"], correct: 1 },
  { question: "Average lifespan of an indoor cat is about?", choices: ["3–5 years", "12–18 years", "25–30 years", "40+ years"], correct: 1 },
  { question: "Cats knead their paws because?", choices: ["They are angry", "It is a contented kitten behavior", "They are sick", "They want food only"], correct: 1 },
  { question: "Declawing is generally considered?", choices: ["Routine grooming", "An amputation procedure now restricted in many places", "Necessary for indoor cats", "Painless"], correct: 1 },
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
