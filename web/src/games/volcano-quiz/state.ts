import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VolcanoQuizSettings { questions: "10" | "20"; }
export interface VolcanoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VolcanoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which volcano famously destroyed Pompeii in 79 AD?", choices: ["Etna","Vesuvius","Stromboli","Krakatoa"], correct: 1 },
  { question: "In which country is Mount Etna?", choices: ["Italy","Greece","Spain","Turkey"], correct: 0 },
  { question: "What is the largest active volcano in the world?", choices: ["Mauna Loa","Kilauea","Etna","Fuji"], correct: 0 },
  { question: "In which U.S. state is Mauna Loa?", choices: ["Alaska","Hawaii","California","Washington"], correct: 1 },
  { question: "What volcano erupted in 1980 in Washington state?", choices: ["Rainier","St. Helens","Hood","Adams"], correct: 1 },
  { question: "What is the most active volcano in Hawaii?", choices: ["Mauna Loa","Kilauea","Mauna Kea","Hualalai"], correct: 1 },
  { question: "What volcano erupted in Indonesia in 1883 with global effects?", choices: ["Krakatoa","Merapi","Tambora","Sinabung"], correct: 0 },
  { question: "What 1815 eruption caused the year without a summer?", choices: ["Krakatoa","Tambora","Pinatubo","Toba"], correct: 1 },
  { question: "What is the term for a volcanic vent that releases hot gases?", choices: ["Crater","Caldera","Fumarole","Lava tube"], correct: 2 },
  { question: "What molten rock is called when underground?", choices: ["Lava","Magma","Pumice","Tephra"], correct: 1 },
  { question: "What is the highest active volcano in the world?", choices: ["Cotopaxi","Ojos del Salado","Llullaillaco","Sajama"], correct: 1 },
  { question: "What 1991 eruption in the Philippines caused global cooling?", choices: ["Mayon","Pinatubo","Taal","Bulusan"], correct: 1 },
  { question: "What kind of volcano is Mount Fuji?", choices: ["Shield","Stratovolcano","Cinder cone","Lava dome"], correct: 1 },
  { question: "What is a caldera?", choices: ["A small volcanic vent","A large depression after a major eruption","A type of lava","A volcanic island"], correct: 1 },
  { question: "What's the main composition of basaltic lava?", choices: ["High silica","Low silica","Sulfur","Carbon"], correct: 1 },
  { question: "Which volcano destroyed the Minoan civilization on Santorini around 1600 BC?", choices: ["Etna","Thera","Vesuvius","Stromboli"], correct: 1 },
  { question: "What volcano in Iceland erupted in 2010 grounding European flights?", choices: ["Hekla","Eyjafjallajokull","Katla","Grimsvotn"], correct: 1 },
  { question: "What is the most dangerous active volcano in Africa?", choices: ["Kilimanjaro","Nyiragongo","Mount Cameroon","Erta Ale"], correct: 1 },
  { question: "What's the U.S. national park containing many active volcanoes including Old Faithful?", choices: ["Yellowstone","Yosemite","Crater Lake","Lassen"], correct: 0 },
  { question: "What gas is emitted in greatest amounts by volcanoes?", choices: ["CO2","Water vapor","SO2","H2S"], correct: 1 },
  { question: "What's the term for hot mud and ash flowing down a volcano?", choices: ["Lahar","Pyroclastic flow","Lava flow","Aa"], correct: 0 },
  { question: "What deadly fast-moving cloud of hot gas and ash is associated with explosive eruptions?", choices: ["Lahar","Pyroclastic flow","Tephra","Strombolian"], correct: 1 },
  { question: "What volcano erupted in Mexico in 1943, growing in a farmer's field?", choices: ["Popocatepetl","Paricutin","El Chichon","Ceboruco"], correct: 1 },
  { question: "What is the volcano near Mexico City that erupts smoke periodically?", choices: ["Popocatepetl","Iztaccihuatl","Pico de Orizaba","Nevado de Toluca"], correct: 0 },
  { question: "What kind of volcano is Mauna Loa?", choices: ["Stratovolcano","Shield volcano","Cinder cone","Lava dome"], correct: 1 },
  { question: "Which African volcano contains a near-permanent lava lake?", choices: ["Kilimanjaro","Nyiragongo","Erta Ale","Both Nyiragongo and Erta Ale"], correct: 3 },
  { question: "What's the term for the volcanic ring around the Pacific Ocean?", choices: ["Volcanic Belt","Ring of Fire","Pacific Belt","Fire Ring"], correct: 1 },
  { question: "What volcano in Italy erupts almost continuously and is called the Lighthouse of the Mediterranean?", choices: ["Etna","Stromboli","Vesuvius","Vulcano"], correct: 1 },
  { question: "What volcano is the largest in the solar system (on Mars)?", choices: ["Maxwell Montes","Olympus Mons","Mauna Loa","Tharsis"], correct: 1 },
  { question: "What scale measures volcanic eruption explosivity?", choices: ["Richter","Modified Mercalli","VEI","Beaufort"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VolcanoQuizSettings): VolcanoQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VolcanoQuizState, action: VolcanoQuizAction): VolcanoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VolcanoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
