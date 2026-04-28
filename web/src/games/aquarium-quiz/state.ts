import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AquariumQuizSettings { questions: "10" | "20" | "30"; }
export interface AquariumQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AquariumQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Nitrogen cycle products in order?", choices: ["NH3 → NO2 → NO3", "NO3 → NO2 → NH3", "NH3 → NO3 → NO2", "NO2 → NH3 → NO3"], correct: 0 },
  { question: "Cycling a tank takes about?", choices: ["1 day", "1 week", "4–6 weeks", "6 months"], correct: 2 },
  { question: "Beneficial bacteria live primarily in?", choices: ["Water", "Filter media/substrate", "Glass", "Plants only"], correct: 1 },
  { question: "pH for most freshwater community is?", choices: ["4–5", "6.5–7.5", "8.5+", "Doesn\\u0027t matter"], correct: 1 },
  { question: "Saltwater specific gravity ~?", choices: ["1.000", "1.020–1.025", "1.050", "0.995"], correct: 1 },
  { question: "Water changes recommended?", choices: ["Never", "10–25% weekly", "Daily 100%", "Annual"], correct: 1 },
  { question: "Goldfish need?", choices: ["Bowls", "Large tanks", "Heat 80F", "Salt"], correct: 1 },
  { question: "Bettas should not be kept with?", choices: ["Snails", "Long-finned/aggressive males", "Plants", "Shrimp"], correct: 1 },
  { question: "Cory catfish are?", choices: ["Solitary", "Schooling/bottom", "Top", "Predator"], correct: 1 },
  { question: "Plecos can grow to?", choices: ["2 in", "12+ in", "6 in", "3 in"], correct: 1 },
  { question: "Live plants help by?", choices: ["Looks", "Absorb nitrate/oxygen", "Add NO2", "None"], correct: 1 },
  { question: "CO2 injection benefits?", choices: ["Fish only", "Plants", "Bacteria", "None"], correct: 1 },
  { question: "Hard water means?", choices: ["Acidic", "High GH", "Low TDS", "Soft"], correct: 1 },
  { question: "Reef tank flagship inhabitant often?", choices: ["Goldfish", "Clownfish", "Tetra", "Discus"], correct: 1 },
  { question: "Live rock provides?", choices: ["Decor", "Bio filtration", "Nothing", "pH only"], correct: 1 },
  { question: "Quarantine new fish for?", choices: ["1 day", "2 weeks+", "6 weeks", "None"], correct: 1 },
  { question: "Ich is?", choices: ["Bacterial", "Parasitic (white spots)", "Fungal", "Viral"], correct: 1 },
  { question: "Heater wattage rule (rough)?", choices: ["1W per 100 gal", "5W/gal", "3–5 W/gal", "10W/gal"], correct: 2 },
  { question: "Filter rating should match?", choices: ["<½ tank turnover", "4–10× turnover", "2× tank", "100×"], correct: 1 },
  { question: "Brackish fish examples?", choices: ["Mollies, scats", "Discus", "Clownfish", "Angelfish"], correct: 0 },
  { question: "Discus prefer water around?", choices: ["60F", "82–86F", "90F", "70F"], correct: 1 },
  { question: "Test kit must-haves include?", choices: ["Ammonia, nitrite, nitrate, pH", "Only pH", "Just nitrate", "Only TDS"], correct: 0 },
  { question: "Substrate for planted tank?", choices: ["Plain gravel", "Aqua soil/sand", "Coral sand", "Marble"], correct: 1 },
  { question: "Algae grows from excess?", choices: ["Filtration", "Nutrients/light", "CO2", "Salt"], correct: 1 },
  { question: "Skimmer is used in?", choices: ["Freshwater", "Saltwater", "Both", "None"], correct: 1 },
  { question: "Fishless cycle uses?", choices: ["Fish", "Ammonia", "Bleach", "Salt"], correct: 1 },
  { question: "Snails like Mystery snails are?", choices: ["Pests", "Cleanup helpers", "Predators", "Aggressors"], correct: 1 },
  { question: "Goldfish ammonia tolerance?", choices: ["High", "Low", "None", "Unknown"], correct: 1 },
  { question: "Most reef-safe LED spectrum includes?", choices: ["UV only", "Blue/whites", "Red only", "Green only"], correct: 1 },
  { question: "Water conditioner removes?", choices: ["Bacteria", "Chlorine/chloramine", "Algae", "Salt"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AquariumQuizSettings): AquariumQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AquariumQuizState, action: AquariumQuizAction): AquariumQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AquariumQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
