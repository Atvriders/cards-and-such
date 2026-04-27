import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GeologyQuizSettings { questions: "10" | "20" | "30"; }
export interface GeologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GeologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What type of rock is granite?", choices: ["Sedimentary", "Igneous", "Metamorphic", "Organic"], correct: 1 },
  { question: "What is the hardest mineral on the Mohs scale?", choices: ["Quartz", "Topaz", "Corundum", "Diamond"], correct: 3 },
  { question: "Who proposed continental drift?", choices: ["Lyell", "Wegener", "Hutton", "Darwin"], correct: 1 },
  { question: "What rock is formed from cooled magma?", choices: ["Sedimentary", "Igneous", "Metamorphic", "Limestone"], correct: 1 },
  { question: "Which is a sedimentary rock?", choices: ["Granite", "Marble", "Sandstone", "Basalt"], correct: 2 },
  { question: "What is a fossil?", choices: ["A young volcano", "Preserved remains/traces of life", "A type of mineral", "A meteorite"], correct: 1 },
  { question: "What is plate tectonics about?", choices: ["Earth's surface plates", "Atmospheric layers", "Solar winds", "Ocean currents"], correct: 0 },
  { question: "What scale measures earthquake size?", choices: ["Mohs", "Richter/Moment magnitude", "Beaufort", "Saffir-Simpson"], correct: 1 },
  { question: "What is the molten rock above Earth's surface called?", choices: ["Magma", "Lava", "Tephra", "Pumice"], correct: 1 },
  { question: "What is the molten rock below Earth's surface called?", choices: ["Lava", "Magma", "Pumice", "Obsidian"], correct: 1 },
  { question: "Which is the youngest geological era?", choices: ["Paleozoic", "Mesozoic", "Cenozoic", "Precambrian"], correct: 2 },
  { question: "What ended the dinosaur era 66 mya?", choices: ["Volcanic eruption", "Asteroid impact", "Climate cooling", "All thought to contribute"], correct: 3 },
  { question: "What rock is marble made from?", choices: ["Granite", "Limestone", "Sandstone", "Basalt"], correct: 1 },
  { question: "Which is the largest active volcano on Earth?", choices: ["Mount Etna", "Mauna Loa", "Mount Fuji", "Vesuvius"], correct: 1 },
  { question: "What does a seismograph measure?", choices: ["Wind", "Earthquakes", "Magnetism", "Temperature"], correct: 1 },
  { question: "Which layer is right beneath Earth's crust?", choices: ["Inner core", "Outer core", "Mantle", "Atmosphere"], correct: 2 },
  { question: "What is amber?", choices: ["Type of stone", "Fossilized tree resin", "Iron ore", "Volcanic glass"], correct: 1 },
  { question: "Pangaea was?", choices: ["A volcano", "An ancient supercontinent", "A famous mountain", "An ocean"], correct: 1 },
  { question: "Which mineral is graphite?", choices: ["Form of carbon", "Form of silicon", "Form of iron", "Form of sulfur"], correct: 0 },
  { question: "What does erosion do?", choices: ["Builds mountains", "Wears away rock", "Creates volcanoes", "Forms igneous rock"], correct: 1 },
  { question: "What is the youngest period?", choices: ["Quaternary", "Tertiary", "Cretaceous", "Jurassic"], correct: 0 },
  { question: "Which gem is corundum?", choices: ["Ruby/Sapphire", "Emerald", "Topaz", "Garnet"], correct: 0 },
  { question: "What is a tsunami caused by?", choices: ["Wind", "Underwater earthquake/volcano", "Tide", "Currents"], correct: 1 },
  { question: "Which fossil fuel forms from ancient plants?", choices: ["Oil", "Natural gas", "Coal", "Peat only"], correct: 2 },
  { question: "What is an igneous rock formed inside Earth called?", choices: ["Extrusive", "Intrusive", "Sedimentary", "Metamorphic"], correct: 1 },
  { question: "What is the Mohs scale highest value?", choices: ["7", "10", "12", "100"], correct: 1 },
  { question: "Which formed by extreme pressure and heat?", choices: ["Sedimentary rocks", "Igneous rocks", "Metamorphic rocks", "Sandstone"], correct: 2 },
  { question: "What is a moraine?", choices: ["Type of rock", "Glacial deposit", "Volcano type", "Earthquake fault"], correct: 1 },
  { question: "What is the Ring of Fire?", choices: ["A meteor shower", "Volcano-rich Pacific rim", "An ocean current", "A desert"], correct: 1 },
  { question: "Who is called 'father of geology'?", choices: ["Hutton", "Darwin", "Newton", "Lyell"], correct: 0 },
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
