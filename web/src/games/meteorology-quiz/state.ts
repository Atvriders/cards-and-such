import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MeteorologyQuizSettings { questions: "10" | "20" | "30"; }
export interface MeteorologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MeteorologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's meteorology?", choices: ["Study of atmosphere/weather","Study of meteors","Both (etymology)","Just space"], correct: 2 },
  { question: "What's the troposphere?", choices: ["Lowest atmospheric layer (weather happens here)","Highest","Middle","Just sky"], correct: 2 },
  { question: "What's the stratosphere?", choices: ["Layer above troposphere (contains ozone)","Lowest","Top","Just upper"], correct: 2 },
  { question: "What gas dominates Earth's atmosphere?", choices: ["Nitrogen (~78%)","Oxygen","CO2","Argon"], correct: 0 },
  { question: "What's relative humidity?", choices: ["Water vapor as percent of capacity","Just water","Both","Just temp"], correct: 2 },
  { question: "What's a tornado?", choices: ["Rotating column of air","Wind","Both","Storm"], correct: 2 },
  { question: "What scale measures tornado strength?", choices: ["Enhanced Fujita Scale","Just Fujita","Both","Saffir-Simpson"], correct: 2 },
  { question: "What scale measures hurricanes?", choices: ["Saffir-Simpson","Fujita","Beaufort","Richter"], correct: 0 },
  { question: "What's a hurricane in Pacific called?", choices: ["Typhoon","Cyclone","Both","Hurricane"], correct: 0 },
  { question: "What's a hurricane in Indian Ocean called?", choices: ["Cyclone","Typhoon","Hurricane","Both"], correct: 0 },
  { question: "What's the eye of a hurricane?", choices: ["Calm center","Most intense","Both edges","Just middle"], correct: 0 },
  { question: "What's the eyewall?", choices: ["Most intense ring around eye","Outer band","Both","Just clouds"], correct: 0 },
  { question: "What's a cumulonimbus?", choices: ["Towering thunderstorm cloud","Light cirrus","Both","Stratus"], correct: 0 },
  { question: "What's a cirrus cloud?", choices: ["High thin wispy cloud","Low fluffy","Both","Just rain cloud"], correct: 0 },
  { question: "What's a cumulus cloud?", choices: ["Puffy white","Wispy","Both","Layer"], correct: 0 },
  { question: "What's a stratus cloud?", choices: ["Low layered","High wispy","Both","Towering"], correct: 0 },
  { question: "What instrument measures temperature?", choices: ["Thermometer","Barometer","Hygrometer","Anemometer"], correct: 0 },
  { question: "What measures atmospheric pressure?", choices: ["Barometer","Thermometer","Hygrometer","Anemometer"], correct: 0 },
  { question: "What measures wind speed?", choices: ["Anemometer","Barometer","Thermometer","Hygrometer"], correct: 0 },
  { question: "What measures humidity?", choices: ["Hygrometer","Barometer","Anemometer","Rain gauge"], correct: 0 },
  { question: "What's the Coriolis effect?", choices: ["Earth's rotation deflects winds/currents","Just wind","Both","Just current"], correct: 2 },
  { question: "What's lightning?", choices: ["Electric discharge in atmosphere","Just bright light","Both","Static"], correct: 2 },
  { question: "What's thunder?", choices: ["Sound from lightning's heated air expansion","Just noise","Both","Wind"], correct: 2 },
  { question: "How fast is sound vs lightning?", choices: ["Light is much faster","Same","Sound faster","Both same"], correct: 0 },
  { question: "What's a front in weather?", choices: ["Boundary between air masses","Just storm","Both","Just air"], correct: 2 },
  { question: "What's a cold front?", choices: ["Cold air pushing into warm","Warm pushing","Both","Just temperature"], correct: 0 },
  { question: "What's a warm front?", choices: ["Warm air over cold","Cold over warm","Both","Just temperature"], correct: 0 },
  { question: "What's a low pressure system?", choices: ["Storm-bringing system","Fair weather","Both","No effect"], correct: 0 },
  { question: "What's a high pressure system?", choices: ["Generally fair weather","Stormy","Both","Just clouds"], correct: 0 },
  { question: "What was the strongest hurricane recorded in Atlantic?", choices: ["Allen, Wilma, Patricia (in Pacific)","All Atlantic-related","Allen 1980 had highest winds","Multiple"], correct: 2 },
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
