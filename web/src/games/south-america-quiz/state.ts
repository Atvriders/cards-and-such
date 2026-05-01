import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SouthAmericaQuizSettings { questions: "10" | "20" | "30"; }
export interface SouthAmericaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SouthAmericaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the longest mountain range in South America?", choices: ["Rockies","Andes","Sierra Madre","Atlas"], correct: 1 },
  { question: "What is the largest country in South America?", choices: ["Argentina","Brazil","Peru","Colombia"], correct: 1 },
  { question: "What is the longest river in South America?", choices: ["Orinoco","Parana","Amazon","Sao Francisco"], correct: 2 },
  { question: "What is the capital of Argentina?", choices: ["Cordoba","Rosario","Buenos Aires","Mendoza"], correct: 2 },
  { question: "Machu Picchu is located in which country?", choices: ["Bolivia","Ecuador","Peru","Chile"], correct: 2 },
  { question: "What is the highest waterfall in the world?", choices: ["Iguazu","Angel Falls","Kaieteur","Niagara"], correct: 1 },
  { question: "In which country is Angel Falls?", choices: ["Brazil","Venezuela","Colombia","Guyana"], correct: 1 },
  { question: "What is the capital of Brazil?", choices: ["Rio de Janeiro","Sao Paulo","Brasilia","Salvador"], correct: 2 },
  { question: "Which country has the smallest area in South America?", choices: ["Suriname","Uruguay","French Guiana","Guyana"], correct: 0 },
  { question: "What ocean is to the west of South America?", choices: ["Atlantic","Pacific","Indian","Southern"], correct: 1 },
  { question: "What strait separates South America from Antarctica?", choices: ["Bering","Magellan","Drake Passage","Cook"], correct: 2 },
  { question: "In which country is the Atacama Desert?", choices: ["Peru","Chile","Bolivia","Argentina"], correct: 1 },
  { question: "What is the capital of Chile?", choices: ["Valparaiso","Santiago","Concepcion","Antofagasta"], correct: 1 },
  { question: "Which lake on the Bolivia-Peru border is the highest navigable lake?", choices: ["Maracaibo","Titicaca","Poopo","Junin"], correct: 1 },
  { question: "What is the official language of Brazil?", choices: ["Spanish","Portuguese","English","French"], correct: 1 },
  { question: "What is the capital of Colombia?", choices: ["Medellin","Cali","Bogota","Cartagena"], correct: 2 },
  { question: "What South American country is named after Italian explorer Vespucci's small Venice?", choices: ["Venezuela","Ecuador","Colombia","Bolivia"], correct: 0 },
  { question: "What are the two landlocked countries in South America?", choices: ["Bolivia and Paraguay","Bolivia and Uruguay","Paraguay and Ecuador","Peru and Bolivia"], correct: 0 },
  { question: "What is the capital of Peru?", choices: ["Cusco","Arequipa","Lima","Trujillo"], correct: 2 },
  { question: "In which country are the Galapagos Islands?", choices: ["Peru","Ecuador","Colombia","Chile"], correct: 1 },
  { question: "The Iguazu Falls span the borders of which two countries (and a third nearby)?", choices: ["Brazil and Argentina","Peru and Bolivia","Chile and Argentina","Brazil and Paraguay"], correct: 0 },
  { question: "What is the southernmost city in the world?", choices: ["Punta Arenas","Ushuaia","Puerto Williams","Stanley"], correct: 1 },
  { question: "What is the capital of Venezuela?", choices: ["Caracas","Maracaibo","Valencia","Maracay"], correct: 0 },
  { question: "What is the second-largest river basin in South America?", choices: ["Orinoco","Parana","Magdalena","Sao Francisco"], correct: 1 },
  { question: "Which country in South America was a Dutch colony?", choices: ["Guyana","Suriname","French Guiana","Ecuador"], correct: 1 },
  { question: "What is the capital of Uruguay?", choices: ["Montevideo","Punta del Este","Salto","Paysandu"], correct: 0 },
  { question: "What desert is the driest non-polar place on Earth?", choices: ["Patagonian","Atacama","Sechura","Monte"], correct: 1 },
  { question: "What is the capital of Ecuador?", choices: ["Guayaquil","Cuenca","Quito","Loja"], correct: 2 },
  { question: "What is the highest peak in the Andes?", choices: ["Aconcagua","Ojos del Salado","Huascaran","Chimborazo"], correct: 0 },
  { question: "What is the capital of Bolivia (administrative)?", choices: ["La Paz","Sucre","Cochabamba","Santa Cruz"], correct: 0 },
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
