import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SchoolBusesQuizSettings { questions: "10" | "20" | "30"; }
export interface SchoolBusesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SchoolBusesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Standard U.S. school bus color name?", choices: ["Safety yellow", "National School Bus Glossy Yellow", "Caterpillar", "Highway Orange"], correct: 1 },
  { question: "That color became standard in?", choices: ["1939", "1955", "1965", "1975"], correct: 0 },
  { question: "Type \"A\" bus is built on a?", choices: ["Truck chassis", "Cutaway van", "Transit chassis", "Semi"], correct: 1 },
  { question: "Type \"C\" is the most common; it is a?", choices: ["Pusher", "Conventional", "Cutaway", "Forward control"], correct: 1 },
  { question: "Type \"D\" buses have the engine?", choices: ["Front", "Rear or front (transit)", "Mid", "Side"], correct: 1 },
  { question: "Major U.S. bodybuilder Blue Bird is from?", choices: ["Georgia", "Texas", "Indiana", "Ohio"], correct: 0 },
  { question: "Thomas Built Buses is based in?", choices: ["Tennessee", "North Carolina", "Ohio", "Indiana"], correct: 1 },
  { question: "IC Bus is owned by?", choices: ["PACCAR", "Navistar", "Daimler", "Volvo"], correct: 1 },
  { question: "Stop-arm violation laws are typically?", choices: ["Civil", "Criminal in some states", "Federal", "Voluntary"], correct: 1 },
  { question: "Crossing arms swing out at?", choices: ["Side", "Front", "Rear", "Top"], correct: 1 },
  { question: "Most school buses run on?", choices: ["Gasoline", "Diesel", "Propane", "Electric"], correct: 1 },
  { question: "Electric school buses gained traction with?", choices: ["ESSER funds", "EPA Clean Bus Program", "State only", "None"], correct: 1 },
  { question: "Common chassis for Type C used to be?", choices: ["F-Super Duty", "International 3800/CE", "Freightliner FS65", "All"], correct: 3 },
  { question: "Eight-way warning lights start with?", choices: ["Yellow", "Red", "White", "Blue"], correct: 0 },
  { question: "When red lights flash, traffic must?", choices: ["Slow", "Stop", "Pass", "Honk"], correct: 1 },
  { question: "Most U.S. school buses lack what restraint?", choices: ["Lap belts", "3-point belts (most)", "Compartments", "Seats"], correct: 1 },
  { question: "Compartmentalization refers to?", choices: ["Storage", "Padded high-back seats", "Aisle", "Cargo"], correct: 1 },
  { question: "Rural buses average passengers around?", choices: ["10", "25", "45", "70"], correct: 2 },
  { question: "Bus driver minimum age (federal CDL)?", choices: ["18", "21", "25", "28"], correct: 1 },
  { question: "CDL endorsement for buses is?", choices: ["P", "S", "P + S", "B"], correct: 2 },
  { question: "School bus capacity rating uses what age?", choices: ["Under 12", "High school", "Adult", "None"], correct: 0 },
  { question: "First gas-powered school bus appeared around?", choices: ["1910", "1920", "1927", "1939"], correct: 2 },
  { question: "Wayne Corporation famous for?", choices: ["Coaches", "School buses", "Coaches & sleeper", "Cargo"], correct: 1 },
  { question: "Activity buses differ in?", choices: ["Color", "Use case", "Engine", "Tires"], correct: 1 },
  { question: "Tag axle on a Type D adds?", choices: ["Speed", "Capacity", "Comfort only", "None"], correct: 1 },
  { question: "Stop sign on bus side is?", choices: ["Optional", "Standard equipment", "Decorative", "Driver only"], correct: 1 },
  { question: "School bus emissions targeted by?", choices: ["EPA", "CARB & EPA", "OSHA", "DOT only"], correct: 1 },
  { question: "Average school bus lifespan (years)?", choices: ["5", "10", "15", "25"], correct: 2 },
  { question: "Yellow color chosen for?", choices: ["Cheapness", "Visibility", "Branding", "Tradition"], correct: 1 },
  { question: "\"Bluebird\" name comes from?", choices: ["Founder name", "Color", "Bird species", "Brand"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SchoolBusesQuizSettings): SchoolBusesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SchoolBusesQuizState, action: SchoolBusesQuizAction): SchoolBusesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SchoolBusesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
