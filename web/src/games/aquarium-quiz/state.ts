import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AquariumQuizSettings { questions: "10" | "20" | "30"; }
export interface AquariumQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AquariumQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The nitrogen cycle progresses in which order?", choices: ["NH3 → NO2 → NO3", "NO3 → NO2 → NH3", "NH3 → NO3 → NO2", "NO2 → NH3 → NO3"], correct: 0 },
  { question: "A typical fish-in or fishless cycle takes about?", choices: ["1 day", "1 week", "4–6 weeks", "6 months"], correct: 2 },
  { question: "Nitrifying bacteria primarily colonize?", choices: ["Open water", "Filter media and substrate", "The glass surface", "Air bubbles"], correct: 1 },
  { question: "A common pH range for community freshwater fish is?", choices: ["4.0–5.0", "6.5–7.5", "8.5–9.0", "Below 5"], correct: 1 },
  { question: "Marine specific gravity is typically maintained near?", choices: ["1.000", "1.020–1.026", "1.050", "0.995"], correct: 1 },
  { question: "A sustainable freshwater water-change schedule is often?", choices: ["Never", "10–25% weekly", "100% daily", "Annually"], correct: 1 },
  { question: "Goldfish do best in?", choices: ["Small bowls", "Large filtered tanks or ponds", "Tropical 80°F tanks", "Saltwater"], correct: 1 },
  { question: "Cory catfish should be kept?", choices: ["Alone", "In schools of 6+", "With aggressive cichlids", "In brackish water"], correct: 1 },
  { question: "Common plecos can grow to?", choices: ["About 2 inches", "12 inches or more", "Always 6 inches", "Under 1 inch"], correct: 1 },
  { question: "Live aquatic plants help by?", choices: ["Producing ammonia", "Absorbing nitrate and adding oxygen", "Raising nitrite", "Heating water"], correct: 1 },
  { question: "CO2 injection primarily benefits?", choices: ["Bacteria", "Live plants", "Snails", "Heaters"], correct: 1 },
  { question: "Hard water is characterized by?", choices: ["Low GH", "High GH/KH", "No minerals", "Acidic only"], correct: 1 },
  { question: "A common reef-tank flagship fish is the?", choices: ["Goldfish", "Clownfish", "Neon tetra", "Discus"], correct: 1 },
  { question: "Live rock primarily provides?", choices: ["Decoration only", "Biological filtration", "Lighting", "Salt"], correct: 1 },
  { question: "Quarantining new fish before adding to a display tank should last?", choices: ["1 day", "2–6 weeks", "Several minutes", "Never"], correct: 1 },
  { question: "Ich (white-spot disease) is caused by a?", choices: ["Bacterium", "Protozoan parasite", "Fungus", "Virus"], correct: 1 },
  { question: "A common heater wattage rule of thumb is approximately?", choices: ["1W per 100 gallons", "3–5W per gallon", "20W per gallon", "No heat needed"], correct: 1 },
  { question: "HOB or canister filter turnover is often targeted at?", choices: ["0.5× tank volume per hour", "4–10× tank volume per hour", "100× tank volume per hour", "No turnover"], correct: 1 },
  { question: "Brackish-water fish examples include?", choices: ["Mollies and scats", "Discus", "Clownfish", "Angelfish"], correct: 0 },
  { question: "Discus prefer water temperatures around?", choices: ["60°F", "82–86°F", "95°F", "70°F"], correct: 1 },
  { question: "A complete starter test kit should cover?", choices: ["Only pH", "Ammonia, nitrite, nitrate, pH", "Only nitrate", "TDS only"], correct: 1 },
  { question: "Algae growth is driven mainly by excess?", choices: ["Filtration", "Light and nutrients", "CO2 alone", "Salt"], correct: 1 },
  { question: "A protein skimmer is used primarily in?", choices: ["Freshwater", "Saltwater", "Pond only", "Brackish only"], correct: 1 },
  { question: "A fishless cycle is typically started with?", choices: ["Live fish", "Pure ammonia or ammonium chloride", "Bleach", "Aquarium salt"], correct: 1 },
  { question: "Mystery snails in a planted tank generally act as?", choices: ["Predators", "Cleanup helpers", "Aggressive territorialists", "Algae causes"], correct: 1 },
  { question: "Goldfish tolerate ammonia?", choices: ["Very well", "Poorly", "Only as adults", "Only as fry"], correct: 1 },
  { question: "A water conditioner (dechlorinator) neutralizes?", choices: ["Bacteria", "Chlorine and chloramine", "Algae", "Salt"], correct: 1 },
  { question: "Bettas are best housed?", choices: ["With other male bettas", "Alone or with calm tankmates", "With aggressive cichlids", "In tiny cups long-term"], correct: 1 },
  { question: "API liquid tests are generally considered?", choices: ["Less accurate than strips", "More accurate than test strips", "Decorative", "Banned"], correct: 1 },
  { question: "Cycling collapses (mini-cycles) often follow?", choices: ["Routine water changes", "Filter media being replaced or scrubbed clean", "Feeding fish", "Lights on"], correct: 1 },
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
