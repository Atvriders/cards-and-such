import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MeteorologyQuizSettings { questions: "10" | "20" | "30"; }
export interface MeteorologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MeteorologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What instrument measures atmospheric pressure?", choices: ["Thermometer", "Barometer", "Anemometer", "Hygrometer"], correct: 1 },
  { question: "What instrument measures wind speed?", choices: ["Hygrometer", "Anemometer", "Barometer", "Thermometer"], correct: 1 },
  { question: "What instrument measures humidity?", choices: ["Hygrometer", "Anemometer", "Thermometer", "Barometer"], correct: 0 },
  { question: "What is the Beaufort scale?", choices: ["Earthquake scale", "Wind force scale", "Heat index", "Rainfall amount"], correct: 1 },
  { question: "What is a hurricane in the Pacific called?", choices: ["Cyclone", "Typhoon", "Twister", "Squall"], correct: 1 },
  { question: "Which cloud is high and wispy?", choices: ["Cumulus", "Cirrus", "Stratus", "Nimbus"], correct: 1 },
  { question: "Which cloud is fluffy and white?", choices: ["Cumulus", "Cirrus", "Stratus", "Nimbostratus"], correct: 0 },
  { question: "Which cloud type produces rain?", choices: ["Cirrus", "Nimbus", "Cumulus", "Altostratus"], correct: 1 },
  { question: "What scale rates tornadoes?", choices: ["Saffir-Simpson", "Enhanced Fujita", "Beaufort", "Richter"], correct: 1 },
  { question: "What scale rates hurricanes?", choices: ["Saffir-Simpson", "Enhanced Fujita", "Beaufort", "Mohs"], correct: 0 },
  { question: "What gas is most abundant in the atmosphere?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Argon"], correct: 1 },
  { question: "What layer of atmosphere has weather?", choices: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"], correct: 1 },
  { question: "What is the eye of a hurricane?", choices: ["Calm center", "Strongest wind area", "Outer band", "Cloud top"], correct: 0 },
  { question: "Which front brings heavy rain quickly?", choices: ["Warm front", "Cold front", "Stationary front", "Occluded front"], correct: 1 },
  { question: "Which is fastest spinning storm?", choices: ["Hurricane", "Tornado", "Cyclone", "Blizzard"], correct: 1 },
  { question: "What is the dew point?", choices: ["Freezing temp", "Temp at which dew forms", "Boiling temp", "Cloud height"], correct: 1 },
  { question: "What is climate (vs weather)?", choices: ["Daily condition", "Long-term pattern", "Cloud type", "Wind speed"], correct: 1 },
  { question: "What causes lightning?", choices: ["Earth's rotation", "Static electricity in clouds", "Sunlight", "Magnetism"], correct: 1 },
  { question: "Which region is the Sahara?", choices: ["Tropical", "Desert", "Tundra", "Temperate"], correct: 1 },
  { question: "What is the jet stream?", choices: ["Ocean current", "High-altitude wind", "Volcanic emission", "Cloud type"], correct: 1 },
  { question: "What is precipitation?", choices: ["Heat radiation", "Falling water (rain, snow, etc.)", "Wind", "Cloud cover"], correct: 1 },
  { question: "What is El Ni\u00f1o?", choices: ["A storm name", "Pacific warming pattern", "Type of monsoon", "Atmospheric layer"], correct: 1 },
  { question: "What is the Coriolis effect?", choices: ["Volcano effect", "Earth's rotation deflecting wind", "Heat transfer", "Magnetism"], correct: 1 },
  { question: "What's a blizzard?", choices: ["Heavy rain", "Severe snowstorm with wind", "Dust storm", "Heat wave"], correct: 1 },
  { question: "What's a monsoon?", choices: ["Hurricane", "Seasonal wind/rain pattern", "Cold front", "Snowstorm"], correct: 1 },
  { question: "What is the ozone layer in?", choices: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"], correct: 1 },
  { question: "What greenhouse gas is most abundant?", choices: ["Methane", "Water vapor", "CO2", "Nitrous oxide"], correct: 1 },
  { question: "What does humidity measure?", choices: ["Temperature", "Water vapor in air", "Pressure", "Wind"], correct: 1 },
  { question: "Which is a hurricane intensity Cat 5 minimum wind?", choices: ["75 mph", "111 mph", "157 mph", "200 mph"], correct: 2 },
  { question: "What is a 'derecho'?", choices: ["Tornado", "Long-lived windstorm", "Hurricane", "Dust storm"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MeteorologyQuizSettings): MeteorologyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MeteorologyQuizState, action: MeteorologyQuizAction): MeteorologyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MeteorologyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
