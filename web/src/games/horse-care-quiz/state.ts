import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HorseCareQuizSettings { questions: "10" | "20" | "30"; }
export interface HorseCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HorseCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Horses are dietarily classified as?", choices: ["Carnivores", "Herbivores", "Omnivores", "Insectivores"], correct: 1 },
  { question: "Daily forage intake should be roughly what percent of body weight?", choices: ["0.5%", "1.5–2%", "5%", "10%"], correct: 1 },
  { question: "An average adult horse drinks about how much water per day?", choices: ["1 gallon", "5–10+ gallons", "50 gallons", "100 gallons"], correct: 1 },
  { question: "Most horses need hooves trimmed approximately every?", choices: ["Week", "6–8 weeks", "Year", "Never"], correct: 1 },
  { question: "\"No hoof, no horse\" emphasizes?", choices: ["A racing slogan", "The critical importance of hoof care", "Speed", "Coat color"], correct: 1 },
  { question: "Colic in horses refers to?", choices: ["A coat condition", "Abdominal pain", "Lameness", "Eye disease"], correct: 1 },
  { question: "Laminitis (founder) primarily affects the?", choices: ["Eyes", "Hooves", "Liver", "Lungs"], correct: 1 },
  { question: "Common core equine vaccines include?", choices: ["Tetanus, EEE/WEE, West Nile, rabies", "Only flu", "Only tetanus", "Only West Nile"], correct: 0 },
  { question: "Strangles is caused by a?", choices: ["Virus", "Bacterium (Streptococcus equi)", "Fungus", "Parasite"], correct: 1 },
  { question: "Average lifespan of a healthy horse is about?", choices: ["10 years", "25–30 years", "50 years", "60+ years"], correct: 1 },
  { question: "One \"hand\" used to measure horse height equals?", choices: ["2 inches", "4 inches", "6 inches", "12 inches"], correct: 1 },
  { question: "A typical riding horse stands about?", choices: ["10 hands", "15–16 hands", "20 hands", "25 hands"], correct: 1 },
  { question: "Hay quality is best judged by?", choices: ["Color, smell, and leaf content", "Bag size", "Price", "Location"], correct: 0 },
  { question: "Sweet feed contains added?", choices: ["Grass only", "Molasses", "Salt only", "Vitamins only"], correct: 1 },
  { question: "Free-choice salt or mineral block is?", choices: ["Toxic", "Recommended", "Unnecessary", "Banned"], correct: 1 },
  { question: "Tying-up (exertional rhabdomyolysis) is a?", choices: ["Behavior", "Muscle disorder", "Hoof disease", "Coat issue"], correct: 1 },
  { question: "West Nile virus in horses is spread by?", choices: ["Ticks", "Mosquitoes", "Flies", "Mice"], correct: 1 },
  { question: "Pasture-induced laminitis is most associated with?", choices: ["Lush spring grass with high sugars", "Cold weather only", "Snow", "Drought only"], correct: 0 },
  { question: "Cribbing is a?", choices: ["Disease", "Stable vice/stereotypy", "Coat color", "Eye condition"], correct: 1 },
  { question: "Basic grooming kit includes?", choices: ["Curry comb, hoof pick, body brush", "Soap only", "A towel only", "Just water"], correct: 0 },
  { question: "Modern equine deworming emphasizes?", choices: ["Daily worming", "Strategic worming guided by fecal egg counts", "Yearly without testing", "Never deworming"], correct: 1 },
  { question: "Foals must receive colostrum within how long after birth?", choices: ["First 24 hours", "First week", "First month", "First year"], correct: 0 },
  { question: "A mare's gestation length is approximately?", choices: ["9 months", "11 months", "13 months", "15 months"], correct: 1 },
  { question: "A common Western breed is the?", choices: ["Arabian", "Quarter Horse", "Hanoverian", "Friesian"], correct: 1 },
  { question: "A common dressage breed type is the?", choices: ["Quarter Horse", "Warmblood", "Pony", "Mustang"], correct: 1 },
  { question: "Trailer loading is best taught with?", choices: ["Force", "Patience and step-by-step training", "Bribes only", "A whip only"], correct: 1 },
  { question: "Equine teeth are best floated approximately?", choices: ["Never", "Annually", "Every 10 years", "Daily"], correct: 1 },
  { question: "Coggins testing screens for?", choices: ["Strangles", "Equine Infectious Anemia", "West Nile", "Rabies"], correct: 1 },
  { question: "Sand colic risk is highest when horses?", choices: ["Eat off clean rubber mats", "Eat hay or grain off sandy ground", "Drink fresh water", "Stand in stalls"], correct: 1 },
  { question: "A horse's normal resting heart rate is approximately?", choices: ["10–20 bpm", "28–44 bpm", "60–80 bpm", "100–120 bpm"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HorseCareQuizSettings): HorseCareQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HorseCareQuizState, action: HorseCareQuizAction): HorseCareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HorseCareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
