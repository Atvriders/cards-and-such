import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DogCareQuizSettings { questions: "10" | "20" | "30"; }
export interface DogCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DogCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which core canine vaccine protects against a fatal viral disease causing GI hemorrhage?", choices: ["Bordetella", "Parvovirus", "Leptospirosis", "Lyme"], correct: 1 },
  { question: "Puppies typically begin their core vaccine series at what age?", choices: ["2 weeks", "6–8 weeks", "4 months", "1 year"], correct: 1 },
  { question: "Heartworm disease in dogs is transmitted by which vector?", choices: ["Ticks", "Mosquitoes", "Fleas", "Sand flies"], correct: 1 },
  { question: "Chocolate is toxic to dogs primarily because it contains?", choices: ["Caffeine alone", "Theobromine", "Lactose", "Tannins"], correct: 1 },
  { question: "Grapes and raisins can cause which problem in dogs?", choices: ["Acute kidney failure", "Liver fibrosis", "Anemia", "Diabetes"], correct: 0 },
  { question: "A healthy body condition lets you?", choices: ["Squeeze ribs hard", "Feel ribs without pressing firmly", "See ribs clearly", "Not feel ribs at all"], correct: 1 },
  { question: "Most adult dogs do best on how many meals per day?", choices: ["1", "2", "5", "Free-fed only"], correct: 1 },
  { question: "By age 3, what percentage of dogs show signs of dental disease?", choices: ["Around 10%", "Around 30%", "Over 60%", "Less than 5%"], correct: 2 },
  { question: "How often is daily teeth brushing ideally recommended?", choices: ["Yearly", "Monthly", "Weekly", "Daily"], correct: 3 },
  { question: "Crate training works because dogs are naturally?", choices: ["Solitary", "Den animals", "Nocturnal", "Aquatic"], correct: 1 },
  { question: "The prime puppy socialization window is approximately?", choices: ["3–14 weeks", "4–6 months", "8–12 months", "After 1 year"], correct: 0 },
  { question: "A microchip is used primarily to?", choices: ["GPS-track a dog", "Provide permanent ID", "Vaccinate", "Train"], correct: 1 },
  { question: "The safest tool to remove an attached tick is?", choices: ["A lit match", "Fine-tipped tweezers", "Petroleum jelly", "Bare fingers"], correct: 1 },
  { question: "Most modern flea/tick preventatives are given?", choices: ["Yearly", "Monthly", "Weekly", "Once for life"], correct: 1 },
  { question: "Bloat (GDV) is most dangerous in which body type?", choices: ["Toy breeds", "Large, deep-chested breeds", "Brachycephalic", "Dachshunds"], correct: 1 },
  { question: "Which is a brachycephalic breed?", choices: ["Beagle", "Bulldog", "Greyhound", "Collie"], correct: 1 },
  { question: "Average daily exercise for a typical adult dog?", choices: ["Under 10 minutes", "30–60+ minutes", "6 hours", "None"], correct: 1 },
  { question: "Positive reinforcement training relies on?", choices: ["Punishment", "Rewarding desired behavior", "Choke collars", "Yelling"], correct: 1 },
  { question: "First sign of heatstroke in a dog is often?", choices: ["Excessive panting", "Sleeping", "Eating more", "Cold paws"], correct: 0 },
  { question: "Antifreeze (ethylene glycol) primarily damages a dog's?", choices: ["Lungs", "Kidneys", "Eyes", "Skin"], correct: 1 },
  { question: "Xylitol ingestion in dogs causes?", choices: ["Constipation", "Hypoglycemia and liver injury", "Bad breath only", "Allergies"], correct: 1 },
  { question: "Onions and garlic damage dogs by?", choices: ["Burning the stomach", "Damaging red blood cells", "Causing seizures", "Blocking airways"], correct: 1 },
  { question: "AAFCO statement on dog food indicates?", choices: ["A flavor", "Nutritional adequacy", "A brand", "Organic status"], correct: 1 },
  { question: "Puppy nipping is best addressed by?", choices: ["Hitting the muzzle", "Yelping and redirecting to a toy", "Ignoring forever", "Crating all day"], correct: 1 },
  { question: "A normal canine rectal temperature is approximately?", choices: ["95–97°F", "101–102.5°F", "104–106°F", "108°F"], correct: 1 },
  { question: "Kennel cough is most often caused by?", choices: ["Parvovirus", "Bordetella bronchiseptica", "Leptospira", "Distemper"], correct: 1 },
  { question: "Spay/neuter is commonly recommended around?", choices: ["8 weeks", "6 months to 1+ year, breed-dependent", "3 years", "Never"], correct: 1 },
  { question: "Lyme disease in dogs is transmitted by?", choices: ["Mosquitoes", "Black-legged (deer) ticks", "Fleas", "Mites"], correct: 1 },
  { question: "Dogs see colors best in which range?", choices: ["Full spectrum", "Blue and yellow", "Red and green", "Black and white only"], correct: 1 },
  { question: "Average lifespan of a small breed dog is roughly?", choices: ["3–5 years", "12–16 years", "20–25 years", "30+ years"], correct: 1 },
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
