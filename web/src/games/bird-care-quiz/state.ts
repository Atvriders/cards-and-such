import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BirdCareQuizSettings { questions: "10" | "20" | "30"; }
export interface BirdCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BirdCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Parrots are obligate?", choices: ["Carnivores", "Herbivores", "Granivores/florivores", "Insectivores"], correct: 2 },
  { question: "Macaw lifespan up to?", choices: ["10", "30", "60+", "100"], correct: 2 },
  { question: "African grey is famous for?", choices: ["Color", "Speech/intelligence", "Size", "Speed"], correct: 1 },
  { question: "Avocado is to birds?", choices: ["Safe", "Toxic", "Treat", "Diet staple"], correct: 1 },
  { question: "Best diet for most parrots?", choices: ["Seed only", "Pellets + veg/fruit", "Bread", "Crackers"], correct: 1 },
  { question: "Cage bar spacing for cockatiels?", choices: ["<1/2\"", "1/2–5/8\"", "1\"+", "None"], correct: 1 },
  { question: "Wing clipping is?", choices: ["Permanent", "Temporary, regrows", "Mandatory", "Banned"], correct: 1 },
  { question: "Birds need UV light because?", choices: ["Heat", "Vit D synthesis", "Color", "Vision"], correct: 1 },
  { question: "Teflon (PTFE) fumes are?", choices: ["Safe", "Lethal to birds", "Mild", "Edible"], correct: 1 },
  { question: "Aerosols around birds?", choices: ["Safe", "Avoid", "Required", "Healthy"], correct: 1 },
  { question: "Out-of-cage time daily?", choices: ["None", "1–4+ hrs", "Once a week", "24/7"], correct: 1 },
  { question: "Foraging toys are?", choices: ["Optional", "Important enrichment", "Bad", "Cage clutter"], correct: 1 },
  { question: "Female budgie cere is?", choices: ["Blue", "Brown/white", "Yellow", "Green"], correct: 1 },
  { question: "Avian vet visits?", choices: ["Never", "Annual exam", "Only if sick", "Monthly"], correct: 1 },
  { question: "Cuttlebone provides?", choices: ["Iron", "Calcium", "Iodine", "Sodium"], correct: 1 },
  { question: "Birds breathe via?", choices: ["Lungs only", "Lungs + air sacs", "Skin", "Gills"], correct: 1 },
  { question: "Cockatiel native to?", choices: ["Africa", "Australia", "S. America", "Asia"], correct: 1 },
  { question: "Conures vary widely; sun conure is loud?", choices: ["No", "Yes", "Quiet", "Mute"], correct: 1 },
  { question: "Canaries are best kept?", choices: ["Solo (males)", "Mixed", "Pairs always", "Mute"], correct: 0 },
  { question: "Quaker parrots are?", choices: ["Legal everywhere", "Restricted in some states", "Banned global", "Wild"], correct: 1 },
  { question: "Lovebirds bond?", choices: ["Weakly", "Strongly to one", "Pack", "None"], correct: 1 },
  { question: "Eclectus parrots show?", choices: ["Same colors", "Sexual dimorphism", "Mute", "Camo"], correct: 1 },
  { question: "Bumblefoot is a?", choices: ["Toe issue", "Foot infection", "Beak", "Wing"], correct: 1 },
  { question: "Ground-foraging birds appreciate?", choices: ["Plain bowls", "Foraging mats", "Dishes", "Walls"], correct: 1 },
  { question: "Bird beaks need?", choices: ["Filing", "Wear toys/diet", "Trim", "None"], correct: 1 },
  { question: "Showers/misting?", choices: ["Bad", "Healthy", "Optional only", "Forbidden"], correct: 1 },
  { question: "Egg-laying without male is?", choices: ["Impossible", "Possible", "Always healthy", "Never"], correct: 1 },
  { question: "Sleep needs for parrots?", choices: ["4 hrs", "10–12 hrs (dark/quiet)", "24/7", "None"], correct: 1 },
  { question: "Budgerigar real name?", choices: ["Cockatiel", "Budgie/parakeet", "Lorikeet", "Conure"], correct: 1 },
  { question: "Feather plucking causes?", choices: ["Boredom/stress", "Color", "Hunger", "Heat"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BirdCareQuizSettings): BirdCareQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BirdCareQuizState, action: BirdCareQuizAction): BirdCareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BirdCareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
