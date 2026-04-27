import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BotanyQuizSettings { questions: "10" | "20" | "30"; }
export interface BotanyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BotanyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What pigment makes plants green?", choices: ["Carotene", "Chlorophyll", "Xanthophyll", "Anthocyanin"], correct: 1 },
  { question: "What process do plants use to convert sunlight into food?", choices: ["Respiration", "Photosynthesis", "Transpiration", "Germination"], correct: 1 },
  { question: "Which gas do plants release during photosynthesis?", choices: ["CO2", "O2", "N2", "H2"], correct: 1 },
  { question: "What part of a plant absorbs water from soil?", choices: ["Stem", "Leaves", "Flowers", "Roots"], correct: 3 },
  { question: "Which is a flowering plant group?", choices: ["Gymnosperms", "Angiosperms", "Bryophytes", "Pteridophytes"], correct: 1 },
  { question: "What is the male part of a flower?", choices: ["Pistil", "Stamen", "Sepal", "Petal"], correct: 1 },
  { question: "What is the female part of a flower?", choices: ["Stamen", "Pistil", "Anther", "Filament"], correct: 1 },
  { question: "Which scientist is the father of taxonomy?", choices: ["Darwin", "Linnaeus", "Mendel", "Hooke"], correct: 1 },
  { question: "What family does the rose belong to?", choices: ["Liliaceae", "Rosaceae", "Asteraceae", "Fabaceae"], correct: 1 },
  { question: "Which plant tissue transports water?", choices: ["Phloem", "Xylem", "Cambium", "Cortex"], correct: 1 },
  { question: "Which plant tissue transports sugars?", choices: ["Phloem", "Xylem", "Epidermis", "Bark"], correct: 0 },
  { question: "What are conifers known as?", choices: ["Angiosperms", "Gymnosperms", "Bryophytes", "Lichens"], correct: 1 },
  { question: "What is a tuber?", choices: ["A fruit", "Underground stem", "Type of leaf", "Type of flower"], correct: 1 },
  { question: "Which plant family includes wheat, rice, and corn?", choices: ["Poaceae (grasses)", "Brassicaceae", "Solanaceae", "Apiaceae"], correct: 0 },
  { question: "What is photosynthesis' main reactant?", choices: ["Glucose", "Oxygen", "CO2 + water", "Nitrogen"], correct: 2 },
  { question: "Where in a leaf does most photosynthesis happen?", choices: ["Epidermis", "Mesophyll", "Cuticle", "Stomata"], correct: 1 },
  { question: "What are stomata?", choices: ["Roots", "Leaf pores", "Flowers", "Seeds"], correct: 1 },
  { question: "Mosses belong to which plant group?", choices: ["Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms"], correct: 0 },
  { question: "What is germination?", choices: ["Seed sprouting", "Pollination", "Fruiting", "Flowering"], correct: 0 },
  { question: "Which fruit is botanically a berry?", choices: ["Apple", "Strawberry", "Tomato", "Cherry"], correct: 2 },
  { question: "Sunflower belongs to which family?", choices: ["Rosaceae", "Asteraceae", "Fabaceae", "Liliaceae"], correct: 1 },
  { question: "What pigment turns leaves red in autumn?", choices: ["Chlorophyll", "Anthocyanin", "Phycocyanin", "Lycopene"], correct: 1 },
  { question: "What is a monocot example?", choices: ["Rose", "Oak", "Lily", "Daisy"], correct: 2 },
  { question: "What does the cambium do?", choices: ["Stores water", "Produces new tissue (growth ring)", "Photosynthesis", "Reproduction"], correct: 1 },
  { question: "Which plant produces seeds in cones?", choices: ["Rose", "Pine", "Daisy", "Bamboo"], correct: 1 },
  { question: "Which plant is famously carnivorous?", choices: ["Cactus", "Venus flytrap", "Bamboo", "Maple"], correct: 1 },
  { question: "Pollination by bees is called?", choices: ["Anemophily", "Entomophily", "Hydrophily", "Zoophily"], correct: 1 },
  { question: "Which plant family includes peas and beans?", choices: ["Fabaceae", "Asteraceae", "Solanaceae", "Brassicaceae"], correct: 0 },
  { question: "Photosynthesis produces glucose and?", choices: ["Nitrogen", "Oxygen", "Methane", "Helium"], correct: 1 },
  { question: "What is the largest seed in nature?", choices: ["Coconut", "Coco de mer", "Avocado", "Mango"], correct: 1 },
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
