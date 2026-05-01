import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BirdCareQuizSettings { questions: "10" | "20" | "30"; }
export interface BirdCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BirdCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Most parrots are dietarily classified as?", choices: ["Carnivores", "Granivores/florivores", "Insectivores", "Piscivores"], correct: 1 },
  { question: "Macaws can live up to approximately?", choices: ["10 years", "30 years", "60+ years", "120 years"], correct: 2 },
  { question: "African grey parrots are renowned for?", choices: ["Bright red coloring", "Speech and cognitive ability", "Song-only vocalization", "Silent companionship"], correct: 1 },
  { question: "Avocado is to parrots?", choices: ["Safe", "Toxic", "A staple", "A protein source"], correct: 1 },
  { question: "Most pet parrot diets should be based on?", choices: ["Seeds only", "Pellets with fresh vegetables and some fruit", "Bread", "Crackers"], correct: 1 },
  { question: "Cage bar spacing for cockatiels should be approximately?", choices: ["Under 1/4 inch", "1/2 to 5/8 inch", "Over 1 inch", "Unlimited"], correct: 1 },
  { question: "Wing clipping is?", choices: ["Permanent", "Temporary; feathers regrow with molts", "Required by law", "Surgical"], correct: 1 },
  { question: "Birds use UVB light primarily to?", choices: ["See better", "Synthesize vitamin D3", "Stay warm", "Sleep"], correct: 1 },
  { question: "Heated PTFE (Teflon) cookware fumes are?", choices: ["Safe for birds", "Rapidly lethal to birds", "Mildly irritating only", "Beneficial"], correct: 1 },
  { question: "Aerosols and scented candles around birds should be?", choices: ["Used freely", "Avoided", "Required", "Mandatory"], correct: 1 },
  { question: "Most companion parrots need daily out-of-cage time of?", choices: ["None", "1–4+ hours", "Weekly only", "24 hours"], correct: 1 },
  { question: "Foraging toys provide?", choices: ["Optional clutter", "Critical mental enrichment", "Cage decor only", "Nothing"], correct: 1 },
  { question: "An adult female budgie's cere is typically?", choices: ["Bright blue", "Brown or tan", "Yellow", "Green"], correct: 1 },
  { question: "Healthy companion birds should see an avian vet?", choices: ["Never", "Annually", "Only if obviously sick", "Monthly"], correct: 1 },
  { question: "Cuttlebone in a bird's cage provides supplemental?", choices: ["Iron", "Calcium", "Iodine", "Sodium"], correct: 1 },
  { question: "Birds breathe using lungs plus?", choices: ["Skin", "Air sacs", "Gills", "Spiracles"], correct: 1 },
  { question: "Cockatiels are native to?", choices: ["Africa", "Australia", "South America", "India"], correct: 1 },
  { question: "Quaker (monk) parrots are?", choices: ["Legal everywhere", "Restricted in some U.S. states", "Banned globally", "Extinct"], correct: 1 },
  { question: "Lovebirds typically?", choices: ["Avoid bonding", "Form strong pair bonds", "Live solitary", "Mute"], correct: 1 },
  { question: "Eclectus parrots show pronounced?", choices: ["Identical sexes", "Sexual dimorphism", "Camouflage", "Albinism"], correct: 1 },
  { question: "Bumblefoot is a foot condition often caused by?", choices: ["Cold", "Poor perch variety and obesity", "Sun", "Loud noise"], correct: 1 },
  { question: "Healthy beaks are kept worn down by?", choices: ["Frequent filing", "Varied diet and chew toys", "Bathing", "Surgery"], correct: 1 },
  { question: "Showering or misting most parrots is?", choices: ["Harmful", "Healthy and encouraged", "Forbidden", "Optional only for chicks"], correct: 1 },
  { question: "Egg-laying without a male is?", choices: ["Impossible", "Possible and can become a health concern", "Always healthy", "Sterile only"], correct: 1 },
  { question: "Companion parrots typically need sleep of about?", choices: ["4 hours", "10–12 hours of dark, quiet rest", "24/7", "Never sleep"], correct: 1 },
  { question: "The budgerigar is also known as the?", choices: ["Cockatiel", "Budgie or parakeet", "Conure", "Lorikeet"], correct: 1 },
  { question: "Feather plucking is most often caused by?", choices: ["Boredom or stress", "Overfeeding", "Bright color", "Heat"], correct: 0 },
  { question: "Psittacosis is a zoonotic disease caused by?", choices: ["Chlamydia psittaci", "Salmonella", "E. coli", "Norovirus"], correct: 0 },
  { question: "A loud, large parrot best suited to experienced keepers is the?", choices: ["Finch", "Macaw", "Canary", "Budgie"], correct: 1 },
  { question: "Most healthy parrots have a body temperature around?", choices: ["98°F", "104–107°F", "85°F", "115°F"], correct: 1 },
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
