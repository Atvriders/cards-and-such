import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GeologyQuizSettings { questions: "10" | "20" | "30"; }
export interface GeologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GeologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What are the three rock types?", choices: ["Igneous, sedimentary, metamorphic","Just igneous","Both","Just stone"], correct: 2 },
  { question: "What's an igneous rock?", choices: ["Formed from cooled magma/lava","Layered","Pressed","All"], correct: 0 },
  { question: "What's a sedimentary rock?", choices: ["Layered, formed from sediments","Just lava","Both","Pressure cooked"], correct: 0 },
  { question: "What's a metamorphic rock?", choices: ["Changed by heat/pressure","Just sediment","Both","Just lava"], correct: 0 },
  { question: "What's granite an example of?", choices: ["Igneous","Sedimentary","Metamorphic","All"], correct: 0 },
  { question: "What's sandstone an example of?", choices: ["Sedimentary","Igneous","Metamorphic","All"], correct: 0 },
  { question: "What's marble an example of?", choices: ["Metamorphic","Igneous","Sedimentary","Just rock"], correct: 0 },
  { question: "What's the Earth's outer layer called?", choices: ["Crust","Mantle","Core","Surface"], correct: 0 },
  { question: "What's the Earth's middle layer?", choices: ["Mantle","Crust","Core","Surface"], correct: 0 },
  { question: "What's the Earth's center?", choices: ["Core (inner solid, outer liquid)","Just core","Both","Mantle"], correct: 2 },
  { question: "What is plate tectonics?", choices: ["Theory of moving lithospheric plates","Just continents","Both","Just movement"], correct: 2 },
  { question: "What separates Earth's plates?", choices: ["Boundaries (divergent, convergent, transform)","Just rivers","All","No boundary"], correct: 0 },
  { question: "What's an earthquake measured by?", choices: ["Richter or Moment Magnitude scale","Just Richter","Both common","Different"], correct: 2 },
  { question: "What's the Mohs scale?", choices: ["Mineral hardness","Rock age","Both","Density"], correct: 0 },
  { question: "What's the hardest mineral?", choices: ["Diamond (Mohs 10)","Quartz","Topaz","Talc"], correct: 0 },
  { question: "What's the softest mineral?", choices: ["Talc (Mohs 1)","Diamond","Both","Gypsum"], correct: 0 },
  { question: "What's a fossil?", choices: ["Preserved remains of ancient life","Modern bone","Both","Just rocks"], correct: 0 },
  { question: "What's geology's main object?", choices: ["Earth materials and processes","Just rocks","Both","Just minerals"], correct: 2 },
  { question: "What's a geologic timescale division for past 65 million years?", choices: ["Cenozoic","Mesozoic","Paleozoic","Just era"], correct: 0 },
  { question: "What's the dinosaur era?", choices: ["Mesozoic","Paleozoic","Cenozoic","Precambrian"], correct: 0 },
  { question: "What's a glacier?", choices: ["Slow-moving mass of ice","Just ice","Both","River"], correct: 0 },
  { question: "What's erosion?", choices: ["Wearing down by water/wind/ice","Building up","Both","Volcanic"], correct: 0 },
  { question: "What's deposition?", choices: ["Adding sediments to area","Erosion","Both","Just water"], correct: 0 },
  { question: "What's a fault?", choices: ["Crack in Earth's crust where rocks move","Just crack","Both","Mountain"], correct: 2 },
  { question: "What's the San Andreas Fault?", choices: ["Transform fault in California","Volcanic","Both","Convergent"], correct: 0 },
  { question: "What's a volcano?", choices: ["Vent for magma to surface","Just mountain","Both","Just lava"], correct: 2 },
  { question: "What's a caldera?", choices: ["Large depression after eruption","Just crater","Both","Vent"], correct: 0 },
  { question: "What's pumice?", choices: ["Light volcanic rock","Heavy igneous","Both","Sedimentary"], correct: 0 },
  { question: "What's the age of Earth?", choices: ["~4.5 billion years","~6,000 years","~1 billion","~10 million"], correct: 0 },
  { question: "What dating method uses radioactive decay?", choices: ["Radiometric dating","Just dating","Both","Just carbon"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GeologyQuizSettings): GeologyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GeologyQuizState, action: GeologyQuizAction): GeologyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GeologyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
