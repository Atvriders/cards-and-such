import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SouthAmericaQuizSettings { questions: "10" | "20" | "30"; }
export interface SouthAmericaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SouthAmericaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capital of Brazil?", choices: ["Rio de Janeiro","Sao Paulo","Brasilia","Salvador"], correct: 2 },
  { question: "Capital of Argentina?", choices: ["Cordoba","Rosario","Buenos Aires","Mendoza"], correct: 2 },
  { question: "Capital of Chile?", choices: ["Valparaiso","Santiago","Concepcion","Antofagasta"], correct: 1 },
  { question: "Capital of Peru?", choices: ["Cusco","Arequipa","Lima","Trujillo"], correct: 2 },
  { question: "Capital of Colombia?", choices: ["Medellin","Bogota","Cartagena","Cali"], correct: 1 },
  { question: "Capital of Venezuela?", choices: ["Maracaibo","Caracas","Valencia","Barquisimeto"], correct: 1 },
  { question: "Capital of Ecuador?", choices: ["Guayaquil","Quito","Cuenca","Manta"], correct: 1 },
  { question: "Capital of Bolivia (constitutional)?", choices: ["La Paz","Sucre","Santa Cruz","Cochabamba"], correct: 1 },
  { question: "Capital of Bolivia (administrative)?", choices: ["La Paz","Sucre","Santa Cruz","Cochabamba"], correct: 0 },
  { question: "Capital of Paraguay?", choices: ["Ciudad del Este","Asuncion","Encarnacion","Pedro Juan"], correct: 1 },
  { question: "Capital of Uruguay?", choices: ["Punta del Este","Montevideo","Salto","Paysandu"], correct: 1 },
  { question: "Capital of Guyana?", choices: ["Georgetown","Linden","New Amsterdam","Bartica"], correct: 0 },
  { question: "Capital of Suriname?", choices: ["Nieuw Nickerie","Paramaribo","Lelydorp","Moengo"], correct: 1 },
  { question: "Capital of French Guiana?", choices: ["Cayenne","Kourou","Saint-Laurent","Maripasoula"], correct: 0 },
  { question: "Largest country in South America?", choices: ["Argentina","Brazil","Peru","Colombia"], correct: 1 },
  { question: "Longest river in South America?", choices: ["Orinoco","Amazon","Parana","Madeira"], correct: 1 },
  { question: "Highest mountain in South America?", choices: ["Aconcagua","Huascaran","Chimborazo","Ojos del Salado"], correct: 0 },
  { question: "Highest navigable lake on Earth (Peru/Bolivia)?", choices: ["Maracaibo","Titicaca","Atitlan","Poopo"], correct: 1 },
  { question: "Famous waterfall on the Argentina-Brazil border?", choices: ["Angel","Iguazu","Niagara","Victoria"], correct: 1 },
  { question: "World's tallest single waterfall?", choices: ["Iguazu","Salto del Angel","Kaieteur","Yosemite"], correct: 1 },
  { question: "Patagonia is shared by Chile and?", choices: ["Argentina","Peru","Bolivia","Brazil"], correct: 0 },
  { question: "The Andes run through how many countries?", choices: ["3","5","7","9"], correct: 2 },
  { question: "Atacama Desert is located in?", choices: ["Peru","Chile","Argentina","Bolivia"], correct: 1 },
  { question: "Galapagos Islands belong to?", choices: ["Peru","Chile","Ecuador","Colombia"], correct: 2 },
  { question: "Amazon River mouth empties into which ocean?", choices: ["Pacific","Atlantic","Caribbean","Indian"], correct: 1 },
  { question: "Tierra del Fuego is shared by Chile and?", choices: ["Argentina","Peru","Bolivia","Uruguay"], correct: 0 },
  { question: "Easter Island belongs to?", choices: ["Peru","Chile","Polynesia","France"], correct: 1 },
  { question: "Drake Passage separates South America from?", choices: ["Africa","Antarctica","Australia","New Zealand"], correct: 1 },
  { question: "Machu Picchu is located in?", choices: ["Peru","Bolivia","Ecuador","Chile"], correct: 0 },
  { question: "Christ the Redeemer overlooks which city?", choices: ["Sao Paulo","Buenos Aires","Rio de Janeiro","Lima"], correct: 2 },
  { question: "Quechua is widely spoken in?", choices: ["Argentina","Peru","Brazil","Venezuela"], correct: 1 },
  { question: "Largest rainforest on Earth?", choices: ["Congo","Amazon","Daintree","Borneo"], correct: 1 },
  { question: "Country with the longest Pacific coastline in S. America?", choices: ["Peru","Chile","Ecuador","Colombia"], correct: 1 },
  { question: "Pampas grasslands are mostly in?", choices: ["Brazil","Argentina","Uruguay","Paraguay"], correct: 1 },
  { question: "Cape Horn is the southernmost point of?", choices: ["Argentina","Chile","Peru","Brazil"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SouthAmericaQuizSettings): SouthAmericaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SouthAmericaQuizState, action: SouthAmericaQuizAction): SouthAmericaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SouthAmericaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
