import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HorseCareQuizSettings { questions: "10" | "20" | "30"; }
export interface HorseCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HorseCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Horses are obligate?", choices: ["Carnivores", "Herbivores", "Omnivores", "Insectivores"], correct: 1 },
  { question: "Average daily forage % of body weight?", choices: ["0.5%", "1.5–2%", "5%", "10%"], correct: 1 },
  { question: "Adult horse drinks daily (gallons)?", choices: ["1", "5–10+", "50", "100"], correct: 1 },
  { question: "Hooves should be trimmed every?", choices: ["Week", "6–8 weeks", "Year", "Never"], correct: 1 },
  { question: "\"No hoof, no horse\" means?", choices: ["Slogan", "Hoof care critical", "Speed", "Color"], correct: 1 },
  { question: "Colic refers to?", choices: ["Coat issue", "Abdominal pain", "Lameness", "Eyes"], correct: 1 },
  { question: "Founder/laminitis affects?", choices: ["Eyes", "Hooves", "Liver", "Lungs"], correct: 1 },
  { question: "Vaccinations include?", choices: ["Tetanus, EWT, rabies", "None", "Distemper only", "Just flu"], correct: 0 },
  { question: "Strangles is?", choices: ["Viral", "Bacterial", "Fungal", "Parasitic"], correct: 1 },
  { question: "Average horse lifespan?", choices: ["10", "25–30", "50", "60"], correct: 1 },
  { question: "Common bit type?", choices: ["Snaffle", "Kimberwicke", "Curb", "All listed"], correct: 3 },
  { question: "Western saddle has?", choices: ["Horn", "Knee", "Light tree", "None"], correct: 0 },
  { question: "Hand height = inches?", choices: ["2", "4", "6", "12"], correct: 1 },
  { question: "Average riding horse height?", choices: ["10 hh", "15–16 hh", "20 hh", "22 hh"], correct: 1 },
  { question: "Hay quality judged by?", choices: ["Color/smell/leaves", "Price", "Bag", "Time"], correct: 0 },
  { question: "Sweet feed contains?", choices: ["Grass", "Molasses", "Salt only", "Vitamins only"], correct: 1 },
  { question: "Free choice salt/mineral?", choices: ["Bad", "Good", "Not needed", "Toxic"], correct: 1 },
  { question: "Tying up (ER) in horses is?", choices: ["Normal", "Muscle disorder", "Behavior", "Coat"], correct: 1 },
  { question: "West Nile spread by?", choices: ["Tick", "Mosquito", "Fly", "Mouse"], correct: 1 },
  { question: "Founder is associated with?", choices: ["Lush spring grass", "Cold", "Snow", "Heat only"], correct: 0 },
  { question: "Cribbing is a?", choices: ["Disease", "Stable vice", "Color", "Eye issue"], correct: 1 },
  { question: "Grooming kit basics?", choices: ["Curry, hoof pick, brush", "None", "Soap only", "Comb only"], correct: 0 },
  { question: "Deworming today emphasizes?", choices: ["Daily", "Strategic + fecals", "Yearly", "Never"], correct: 1 },
  { question: "Stall bedding examples?", choices: ["Straw, shavings, pellets", "Cotton", "Foam", "Dirt"], correct: 0 },
  { question: "Pasture rotation reduces?", choices: ["Costs", "Parasites/overgrazing", "Color", "Bleeding"], correct: 1 },
  { question: "Foal nursing first hours critical for?", choices: ["Colostrum", "Sleep", "Dewormer", "Exercise"], correct: 0 },
  { question: "Mare gestation (months)?", choices: ["9", "11", "13", "15"], correct: 1 },
  { question: "Common Western breed?", choices: ["Arabian", "Quarter Horse", "Hanoverian", "Friesian"], correct: 1 },
  { question: "Common dressage breed?", choices: ["QH", "Warmblood", "Pony", "Mustang"], correct: 1 },
  { question: "Trailer loading is best with?", choices: ["Force", "Patience/training", "Bribes", "Crowd"], correct: 1 },
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
