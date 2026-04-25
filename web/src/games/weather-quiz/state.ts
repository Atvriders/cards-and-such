import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface WeatherQuizState {
  questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean;
  score: number; correctCount: number; phase: "playing"|"result"|"done";
}
export type WeatherQuizAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" };
export interface WeatherQuizSettings { questions: "10"|"20" }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question:"What is the eye of a hurricane?", choices:["Calm center","Strongest winds","Outer rain band","Storm surge"], correct:0 },
  { question:"Which cloud type is associated with thunderstorms?", choices:["Cirrus","Stratus","Cumulonimbus","Altocumulus"], correct:2 },
  { question:"What instrument measures atmospheric pressure?", choices:["Thermometer","Barometer","Hygrometer","Anemometer"], correct:1 },
  { question:"What causes a rainbow?", choices:["Reflection only","Refraction and reflection in droplets","Diffraction around clouds","Static electricity"], correct:1 },
  { question:"What is a tornado also called?", choices:["Cyclone","Twister","Typhoon","Waterspout"], correct:1 },
  { question:"Which scale measures hurricane intensity?", choices:["Richter","Fujita","Saffir-Simpson","Beaufort"], correct:2 },
  { question:"What is freezing rain that coats surfaces called?", choices:["Sleet","Graupel","Glaze ice / freezing rain","Hoarfrost"], correct:2 },
  { question:"Where do most weather events occur?", choices:["Stratosphere","Mesosphere","Troposphere","Thermosphere"], correct:2 },
  { question:"What is the dew point?", choices:["Freezing point of water","Temp at which air is saturated","Boiling point at altitude","Minimum daily temperature"], correct:1 },
  { question:"Which wind pattern creates deserts near 30° latitude?", choices:["Trade winds","Polar easterlies","Hadley cell subsidence","Jet stream"], correct:2 },
  { question:"What is a blizzard defined by?", choices:["Snow > 10 cm","Heavy snow + wind + low visibility","Ice storm","Freezing temperatures only"], correct:1 },
  { question:"What does a hygrometer measure?", choices:["Wind speed","Rainfall","Humidity","Cloud height"], correct:2 },
  { question:"Which front brings long steady rain?", choices:["Cold front","Warm front","Occluded front","Stationary front"], correct:1 },
  { question:"What is the Coriolis effect?", choices:["Sun's heating of land","Earth's rotation deflecting winds","Ocean current warming","Pressure gradient force"], correct:1 },
  { question:"What causes sea breezes during the day?", choices:["Land cools faster","Sea heats faster","Land heats faster","Equal temperatures"], correct:2 },
  { question:"Lightning is caused by what buildup?", choices:["Magnetic field","Static electrical charge","Radiation","Heat convection"], correct:1 },
  { question:"What is El Niño?", choices:["Cold Pacific event","Warm Pacific ocean pattern","Atlantic hurricane system","Indian Ocean current"], correct:1 },
  { question:"Which clouds are highest in the atmosphere?", choices:["Cumulus","Stratus","Cirrus","Nimbostratus"], correct:2 },
  { question:"What does 'partly cloudy' typically mean?", choices:["0-10% cloud cover","10-30% cloud cover","30-70% cloud cover","70-90% cloud cover"], correct:2 },
  { question:"A wind of 120 km/h is what on Beaufort scale?", choices:["Force 6","Force 8","Force 10","Force 12"], correct:3 },
];

function shuffle<T>(arr: T[], rng: ()=>number): T[] {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a;
}

export function initialState(seed: number, settings: WeatherQuizSettings): WeatherQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions,10);
  const pool = shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c,i)=>({c,i}));
    const sh = shuffle(indexed,rng);
    const newCorrect = sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;
    return { ...q, choices: sh.map(x=>x.c) as [string,string,string,string], correct: newCorrect };
  });
  return { questions, currentIndex:0, selected:null, submitted:false, score:0, correctCount:0, phase:"playing" };
}

export function reducer(state: WeatherQuizState, action: WeatherQuizAction): WeatherQuizState {
  if(state.phase==="done") return state;
  switch(action.type) {
    case "select": return state.submitted ? state : { ...state, selected:action.choice };
    case "submit": {
      if(state.submitted||state.selected===null) return state;
      const q=state.questions[state.currentIndex]!;
      const ok=state.selected===q.correct;
      return { ...state, submitted:true, score:state.score+(ok?100:0), correctCount:state.correctCount+(ok?1:0), phase:"result" };
    }
    case "next": {
      const next=state.currentIndex+1;
      if(next>=state.questions.length) return { ...state, phase:"done" };
      return { ...state, currentIndex:next, selected:null, submitted:false, phase:"playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: WeatherQuizState): { score:number }|null {
  return state.phase==="done" ? { score:state.score } : null;
}
