import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SurvivalQuizSettings { questions: "10" | "20" | "30"; }
export interface SurvivalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SurvivalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Rule of 3s: humans can survive without air?", choices: ["~3 sec", "~3 min", "~3 hr", "~3 days"], correct: 1 },
  { question: "Rule of 3s: without shelter (extreme)?", choices: ["~3 sec", "~3 min", "~3 hr", "~3 days"], correct: 2 },
  { question: "Rule of 3s: without water?", choices: ["~3 sec", "~3 min", "~3 hr", "~3 days"], correct: 3 },
  { question: "Rule of 3s: without food?", choices: ["~3 days", "~3 weeks", "~3 months", "~3 years"], correct: 1 },
  { question: "Most reliable fire-starting tool to carry?", choices: ["Matches", "Lighter", "Ferrocerium rod", "All as backup"], correct: 3 },
  { question: "Safest drinking water method?", choices: ["Smell", "Boil", "Filter", "Boil + filter"], correct: 3 },
  { question: "Boiling kills?", choices: ["Bacteria & viruses", "Heavy metals", "Salt", "Sediments"], correct: 0 },
  { question: "Hypothermia first action?", choices: ["Cold shower", "Get dry & warm", "Sleep on snow", "Run"], correct: 1 },
  { question: "Heat stroke first action?", choices: ["Run", "Cool the body", "Drink alcohol", "Sit in sun"], correct: 1 },
  { question: "Best signal mirror flash visibility?", choices: ["~1 km", "~10 km", "~50 km+", "~500 km"], correct: 2 },
  { question: "International distress signal?", choices: ["Three of anything", "Two whistles", "One smoke", "Wave once"], correct: 0 },
  { question: "Survival knife fixed-blade is preferred over folding because?", choices: ["Looks cooler", "Stronger", "Lighter", "Cheaper"], correct: 1 },
  { question: "STOP acronym means?", choices: ["Sit, Think, Observe, Plan", "Stop, Travel, Open, Pack", "Stand, Talk, Open, Pause", "Survive, Track, Out, Plan"], correct: 0 },
  { question: "Best shelter priority in cold rain?", choices: ["Floor", "Roof + walls", "Just a fire", "Just clothing"], correct: 1 },
  { question: "Snow shelter type good for emergencies?", choices: ["Igloo", "Snow trench", "Quinzhee", "All of these"], correct: 3 },
  { question: "Lost in woods, you should generally?", choices: ["Walk randomly", "Stay put", "Climb tree", "Run downhill"], correct: 1 },
  { question: "Following a stream usually leads to?", choices: ["Mountain top", "People/civilization", "Ocean only", "Nowhere"], correct: 1 },
  { question: "Edible plant rule of thumb?", choices: ["Eat colors", "If unsure, don't", "Sweet = safe", "Bitter = safe"], correct: 1 },
  { question: "Universal edibility test was developed by?", choices: ["NASA", "US Army", "Boy Scouts", "UN"], correct: 1 },
  { question: "Bear encounter (grizzly): you should?", choices: ["Run", "Climb tree", "Play dead if attacked", "Fight always"], correct: 2 },
  { question: "Black bear encounter, attacked: you should?", choices: ["Play dead", "Fight back", "Run", "Sing"], correct: 1 },
  { question: "Snake bite first aid: most important?", choices: ["Suck venom", "Tourniquet", "Stay calm, immobilize, hospital", "Cut wound"], correct: 2 },
  { question: "In open water without flotation, best technique?", choices: ["Treading", "Survival float", "Swim hard", "Sink to rest"], correct: 1 },
  { question: "Cold-water immersion: cold shock lasts?", choices: ["~30 sec", "~1 min", "~1-3 min", "~30 min"], correct: 2 },
  { question: "Hyponatremia is from?", choices: ["Too little salt", "Too much water", "No water", "Cold"], correct: 1 },
  { question: "Best layer next to skin in cold?", choices: ["Cotton", "Wool/synthetic", "Plastic", "Leather"], correct: 1 },
  { question: "Cotton in cold environments is?", choices: ["Best", "Dangerous when wet", "Warm always", "Waterproof"], correct: 1 },
  { question: "Direction-finding without compass: shadow stick uses?", choices: ["Sun arc", "Wind", "Rain", "Magnetism"], correct: 0 },
  { question: "North Star is found via?", choices: ["Big Dipper pointers", "Orion's Belt", "Southern Cross", "Cassiopeia only"], correct: 0 },
  { question: "Most important survival item is?", choices: ["Knife", "Water", "Mindset", "Tarp"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SurvivalQuizSettings): SurvivalQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SurvivalQuizState, action: SurvivalQuizAction): SurvivalQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SurvivalQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
