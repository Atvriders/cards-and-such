import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DesertTrekQuizSettings { questions: "10" | "20" | "30"; }
export interface DesertTrekQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DesertTrekQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Largest hot desert on Earth?", choices: ["Sahara", "Gobi", "Kalahari", "Atacama"], correct: 0 },
  { question: "Driest desert in the world?", choices: ["Sahara", "Atacama", "Gobi", "Mojave"], correct: 1 },
  { question: "Atacama is in which country mainly?", choices: ["Argentina", "Bolivia", "Chile", "Peru"], correct: 2 },
  { question: "Sahara spans how many countries (approx)?", choices: ["3", "5", "11", "20"], correct: 2 },
  { question: "Largest cold desert?", choices: ["Antarctica", "Sahara", "Gobi", "Atacama"], correct: 0 },
  { question: "Gobi Desert is mainly in?", choices: ["China & Mongolia", "Russia", "India", "Iran"], correct: 0 },
  { question: "Bedouin people are most associated with?", choices: ["Sahara/Arabian deserts", "Gobi", "Atacama", "Australian Outback"], correct: 0 },
  { question: "Tuareg people inhabit?", choices: ["Sahara", "Atacama", "Gobi", "Sonoran"], correct: 0 },
  { question: "Camels best suited for desert: dromedary has how many humps?", choices: ["0", "1", "2", "3"], correct: 1 },
  { question: "Bactrian camels have how many humps?", choices: ["0", "1", "2", "3"], correct: 2 },
  { question: "Hottest air temperature recorded?", choices: ["48 \u00b0C", "56.7 \u00b0C", "65 \u00b0C", "75 \u00b0C"], correct: 1 },
  { question: "That record was at?", choices: ["Sahara, Libya", "Death Valley, USA", "Lut, Iran", "Outback, AU"], correct: 1 },
  { question: "Highest surface temperature record (Lut Desert) approx?", choices: ["50 \u00b0C", "70 \u00b0C", "80.8 \u00b0C", "100 \u00b0C"], correct: 2 },
  { question: "Sandstorm in Arabic is called?", choices: ["Khamsin", "Haboob", "Simoom", "All of these"], correct: 3 },
  { question: "Wadis are?", choices: ["Salt flats", "Dry riverbeds", "Dunes", "Oases"], correct: 1 },
  { question: "Crescent-shaped dune?", choices: ["Barchan", "Linear", "Star", "Parabolic"], correct: 0 },
  { question: "Largest sand sea?", choices: ["Rub' al Khali", "Erg Chebbi", "Taklamakan", "Simpson"], correct: 0 },
  { question: "Rub' al Khali means?", choices: ["Empty Quarter", "Land of Stars", "Hot Place", "Desert of Kings"], correct: 0 },
  { question: "Iconic Sahara crossing race is the?", choices: ["Marathon des Sables", "Tour de France", "Vend\u00e9e Globe", "Iditarod"], correct: 0 },
  { question: "Length of Marathon des Sables (approx)?", choices: ["~50 km", "~250 km", "~500 km", "~1,000 km"], correct: 1 },
  { question: "Best clothing color in the desert?", choices: ["Dark blue/black", "Loose light", "Tight neon", "Reflective metal"], correct: 1 },
  { question: "Recommended water per day for desert hiking?", choices: ["0.5 L", "1 L", "4 L+", "20 L"], correct: 2 },
  { question: "Greatest threat at night in deserts?", choices: ["Heat", "Cold", "Wind", "Sun"], correct: 1 },
  { question: "Mirages are caused by?", choices: ["Hallucinations", "Light refraction", "Magic", "Sunblock"], correct: 1 },
  { question: "Oasis water comes from?", choices: ["Rainwater pools", "Underground aquifers", "Volcanoes", "Glaciers"], correct: 1 },
  { question: "Largest desert in Australia?", choices: ["Great Sandy", "Great Victoria", "Simpson", "Tanami"], correct: 1 },
  { question: "Sonoran Desert is in?", choices: ["USA & Mexico", "Chile", "Africa", "Asia"], correct: 0 },
  { question: "Saguaro cactus is native to?", choices: ["Sahara", "Sonoran", "Atacama", "Gobi"], correct: 1 },
  { question: "'Desert pavement' is?", choices: ["Roads", "Stone-covered ground", "Asphalt", "Salt crust"], correct: 1 },
  { question: "Lawrence of Arabia crossed which desert?", choices: ["Sahara", "Nefud", "Kalahari", "Gobi"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DesertTrekQuizSettings): DesertTrekQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DesertTrekQuizState, action: DesertTrekQuizAction): DesertTrekQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DesertTrekQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
