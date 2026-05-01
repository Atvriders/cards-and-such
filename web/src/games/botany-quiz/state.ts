import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BotanyQuizSettings { questions: "10" | "20" | "30"; }
export interface BotanyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BotanyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's photosynthesis?", choices: ["Plants making sugar from sunlight","Just plants","Both","Animal process"], correct: 2 },
  { question: "What pigment captures light in plants?", choices: ["Chlorophyll","Hemoglobin","Carotene","Anthocyanin"], correct: 0 },
  { question: "What organelle does photosynthesis happen in?", choices: ["Chloroplast","Mitochondrion","Nucleus","Vacuole"], correct: 0 },
  { question: "What gas do plants take in for photosynthesis?", choices: ["CO2","O2","N2","H2"], correct: 0 },
  { question: "What gas do plants release?", choices: ["O2","CO2","N2","H2O"], correct: 0 },
  { question: "What part of plant absorbs water?", choices: ["Roots","Leaves","Stem","Flowers"], correct: 0 },
  { question: "What transports water in plants?", choices: ["Xylem","Phloem","Both move different things","Just stem"], correct: 0 },
  { question: "What transports sugars in plants?", choices: ["Phloem","Xylem","Both","Stem"], correct: 0 },
  { question: "What's transpiration?", choices: ["Water evaporation from leaves","Photosynthesis","Just water","Just leaves"], correct: 0 },
  { question: "What's a stoma?", choices: ["Pore on leaf for gas exchange","Just leaf","Both","Stem opening"], correct: 2 },
  { question: "What's the male part of a flower?", choices: ["Stamen (anther + filament)","Pistil","Both","Just anther"], correct: 0 },
  { question: "What's the female part of a flower?", choices: ["Pistil/Carpel","Stamen","Both","Just stigma"], correct: 0 },
  { question: "What attracts pollinators?", choices: ["Petals (color, scent)","Stem","Roots","Just leaves"], correct: 0 },
  { question: "What's pollination?", choices: ["Pollen transfer to female parts","Seed making","Both","Just transfer"], correct: 0 },
  { question: "What's germination?", choices: ["Seed sprouting","Just sprouting","Both","Pollination"], correct: 0 },
  { question: "What's a perennial plant?", choices: ["Lives multiple years","Annual","Both","Just one year"], correct: 0 },
  { question: "What's an annual plant?", choices: ["One growing season","Multiple years","Both","Two years"], correct: 0 },
  { question: "What's a biennial plant?", choices: ["Two-year cycle","One year","Multiple","Just biennial"], correct: 2 },
  { question: "What are angiosperms?", choices: ["Flowering plants","Conifers","Ferns","Mosses"], correct: 0 },
  { question: "What are gymnosperms?", choices: ["Naked-seed plants (conifers, etc.)","Flowering","Both","Mosses"], correct: 0 },
  { question: "What's a deciduous tree?", choices: ["Drops leaves seasonally","Evergreen","Both","Shrub"], correct: 0 },
  { question: "What's an evergreen?", choices: ["Keeps leaves year-round","Loses leaves","Both","Just conifer"], correct: 0 },
  { question: "What's the largest plant family by species?", choices: ["Asteraceae (daisies)","Roses","Just one","Orchids"], correct: 0 },
  { question: "What's the tallest tree species?", choices: ["Coast Redwood","Giant Sequoia","Douglas Fir","Eucalyptus"], correct: 0 },
  { question: "What's the longest-lived tree?", choices: ["Bristlecone pine","Redwood","Sequoia","Oak"], correct: 0 },
  { question: "What's a monocot?", choices: ["One seed leaf, parallel veins","Two seed leaves","Both","Just seed"], correct: 0 },
  { question: "What's a dicot?", choices: ["Two seed leaves","One","Both","No seeds"], correct: 0 },
  { question: "What's a hydroponic plant grown in?", choices: ["Water with nutrients","Soil","Both","Air only"], correct: 0 },
  { question: "What's the smallest flowering plant?", choices: ["Wolffia","Lemna","Both small","Just rose"], correct: 2 },
  { question: "What's the largest flower?", choices: ["Rafflesia arnoldii","Sunflower","Hibiscus","Magnolia"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BotanyQuizSettings): BotanyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BotanyQuizState, action: BotanyQuizAction): BotanyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BotanyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
