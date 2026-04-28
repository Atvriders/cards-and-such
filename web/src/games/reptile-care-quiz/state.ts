import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReptileCareQuizSettings { questions: "10" | "20" | "30"; }
export interface ReptileCareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReptileCareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Reptiles are?", choices: ["Endotherms", "Ectotherms", "Ovo", "Mammal"], correct: 1 },
  { question: "Beardies need UVB?", choices: ["No", "Yes — daily", "Weekly", "Never"], correct: 1 },
  { question: "UVB bulbs replaced typically?", choices: ["Never", "Every 6–12 mo", "Every 5 years", "Daily"], correct: 1 },
  { question: "Leopard gecko ideal hot side?", choices: ["70F", "78F", "88–92F", "110F"], correct: 2 },
  { question: "Ball python lifespan?", choices: ["5", "15", "30+", "60"], correct: 2 },
  { question: "Beardie diet shifts at adult to?", choices: ["More greens", "More insects", "Same", "Fish"], correct: 0 },
  { question: "Calcium dust on insects?", choices: ["Skip", "Daily", "As required", "Yearly"], correct: 2 },
  { question: "Brumation is?", choices: ["Aggression", "Reptile dormancy", "Color", "Disease"], correct: 1 },
  { question: "Crested gecko prefers?", choices: ["Hot/dry", "Cool/humid", "Desert", "Aquatic"], correct: 1 },
  { question: "Corn snake size?", choices: ["1 ft", "3–6 ft", "15 ft", "20 ft"], correct: 1 },
  { question: "Boa vs python differ in?", choices: ["Live/oviparous", "Color", "Size only", "Sound"], correct: 0 },
  { question: "Iguanas need?", choices: ["Tiny cages", "Large enclosures", "None", "Bathtub"], correct: 1 },
  { question: "Tortoises eat mostly?", choices: ["Meat", "Greens/grasses", "Fish", "Seeds only"], correct: 1 },
  { question: "Aquatic turtle UVB?", choices: ["No", "Yes", "Weekly", "Optional"], correct: 1 },
  { question: "Salmonella concern with reptiles?", choices: ["No", "Yes — wash hands", "Only snakes", "Only turtles"], correct: 1 },
  { question: "MBD stands for?", choices: ["Metabolic Bone Disease", "Mid-Body Disorder", "Mass-Body", "Multi-Bone"], correct: 0 },
  { question: "Heat lamp wattage tuned to?", choices: ["Cage size/temp gradient", "Cost", "Brand", "Color"], correct: 0 },
  { question: "Substrate to avoid for many?", choices: ["Paper", "Loose sand for hatchlings", "Tile", "Bioactive"], correct: 1 },
  { question: "Bioactive enclosure includes?", choices: ["Plants/cleanup crew", "Plastic", "Concrete", "Foil"], correct: 0 },
  { question: "Snake feeding frequency adult?", choices: ["Daily", "1–2 weeks (varies)", "Yearly", "Hourly"], correct: 1 },
  { question: "Live vs frozen-thawed feeders?", choices: ["Live always", "F/T preferred for safety", "Same", "Cooked"], correct: 1 },
  { question: "Humidity for ball python?", choices: ["10%", "50–60%", "100%", "None"], correct: 1 },
  { question: "Veiled chameleon source water?", choices: ["Bowl", "Drip/mist", "Pool", "None"], correct: 1 },
  { question: "Tegus are?", choices: ["Snakes", "Large lizards", "Turtles", "Frogs"], correct: 1 },
  { question: "Sex determination in many turtles is?", choices: ["Genetic", "Temperature", "Size", "Color"], correct: 1 },
  { question: "Frog (caudata) is?", choices: ["Salamander", "Frog (anura) — error trap", "Lizard", "Snake"], correct: 1 },
  { question: "Vivarium vs aquarium?", choices: ["Same", "Vivarium is land/semi-aquatic", "Sea", "Pond"], correct: 1 },
  { question: "Dental care in reptiles?", choices: ["Standard", "Species-specific", "None", "Yearly"], correct: 1 },
  { question: "Shedding (ecdysis) in snakes is?", choices: ["Daily", "Periodic", "Yearly", "Rare"], correct: 1 },
  { question: "Common parasite check?", choices: ["Annual fecal", "Never", "Monthly", "Decadal"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ReptileCareQuizSettings): ReptileCareQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReptileCareQuizState, action: ReptileCareQuizAction): ReptileCareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReptileCareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
