import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DogCareQuizSettings { questions: "10" | "20" | "30"; }
export interface DogCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DogCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Core canine vaccines include?", choices: ["Rabies, distemper, parvo, adeno", "Only rabies", "Only DHPP", "Lepto"], correct: 0 },
  { question: "Average puppy vaccine age starts at?", choices: ["2 weeks", "6–8 weeks", "12 weeks", "6 months"], correct: 1 },
  { question: "Heartworms are spread by?", choices: ["Ticks", "Mosquitoes", "Fleas", "Fly"], correct: 1 },
  { question: "Chocolate is toxic due to?", choices: ["Caffeine", "Theobromine", "Sugar", "Milk"], correct: 1 },
  { question: "Grapes/raisins are toxic?", choices: ["No", "Yes — kidney", "Yes — liver", "Maybe"], correct: 1 },
  { question: "Average adult dog rib check method?", choices: ["Squeeze hard", "Feel ribs easily without pressing", "Look only", "Weigh"], correct: 1 },
  { question: "Dogs require how many meals?", choices: ["1", "2 (typical)", "5", "Free-fed only"], correct: 1 },
  { question: "Dental disease prevalence by age 3 (estimate)?", choices: ["10%", "30%", "60%+", "90%+"], correct: 2 },
  { question: "Brushing teeth ideal frequency?", choices: ["Monthly", "Weekly", "Daily", "Yearly"], correct: 2 },
  { question: "Crate training works because dogs are?", choices: ["Solitary", "Den animals", "Pack only", "Wild"], correct: 1 },
  { question: "Best socialization window?", choices: ["8–12 weeks", "3–5 months", "6 months+", "Adult only"], correct: 0 },
  { question: "Spay/neuter typical age?", choices: ["8 weeks", "6 months (varies)", "3 years", "Never"], correct: 1 },
  { question: "Microchipping is to?", choices: ["Track GPS", "Identify pet", "Vaccinate", "Train"], correct: 1 },
  { question: "Tick removal best with?", choices: ["Match", "Tweezers/tool", "Oil", "Squeeze"], correct: 1 },
  { question: "Flea treatment frequency?", choices: ["Yearly", "Monthly (typical)", "Weekly", "Never"], correct: 1 },
  { question: "Dog years in human terms — simple rule?", choices: ["Each = 7 (rough)", "Each = 1", "Each = 3", "Each = 12"], correct: 0 },
  { question: "Senior age varies; small dogs become senior at?", choices: ["5", "7–10", "12", "15+"], correct: 1 },
  { question: "Bloat is most dangerous in?", choices: ["Toy breeds", "Large deep-chested", "Brachy", "Mixed"], correct: 1 },
  { question: "Brachycephalic breeds include?", choices: ["Beagles", "Bulldogs", "Goldens", "Labs"], correct: 1 },
  { question: "Recommended exercise: average dog?", choices: ["<10 min", "30–60 min", "3 hours", "None"], correct: 1 },
  { question: "Recall command is?", choices: ["Stay", "Come", "Sit", "Down"], correct: 1 },
  { question: "Positive reinforcement uses?", choices: ["Punishment", "Rewards", "Yelling", "Choke"], correct: 1 },
  { question: "Resource guarding addressed via?", choices: ["Force", "Trade-up training", "Ignore", "Punish"], correct: 1 },
  { question: "Heatstroke first sign?", choices: ["Excess panting", "Drooling stops", "Sleeping", "Eating"], correct: 0 },
  { question: "Antifreeze toxicity acts on?", choices: ["Lungs", "Kidneys", "Heart", "Eyes"], correct: 1 },
  { question: "Xylitol (sugar substitute) causes?", choices: ["Constipation", "Hypoglycemia/liver", "Diarrhea", "Itching"], correct: 1 },
  { question: "Onions/garlic toxic via?", choices: ["Lungs", "RBC damage", "Kidneys", "Bones"], correct: 1 },
  { question: "Annual exam includes?", choices: ["Vaccines", "Heart/teeth/weight", "Bath", "Trim"], correct: 1 },
  { question: "Dog food AAFCO statement means?", choices: ["Style", "Nutritionally complete claim", "Brand", "Recipe"], correct: 1 },
  { question: "Puppy biting addressed via?", choices: ["Hit", "Yelp/redirect", "Ignore", "Cage"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DogCareQuizSettings): DogCareQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DogCareQuizState, action: DogCareQuizAction): DogCareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DogCareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
