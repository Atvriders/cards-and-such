import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CaribbeanQuizSettings { questions: "10" | "20" | "30"; }
export interface CaribbeanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CaribbeanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest country in the Caribbean by area?", choices: ["Dominican Republic","Cuba","Jamaica","Haiti"], correct: 1 },
  { question: "What is the capital of Cuba?", choices: ["Santiago","Havana","Holguin","Camaguey"], correct: 1 },
  { question: "Which two countries share the island of Hispaniola?", choices: ["Cuba and Haiti","Dominican Republic and Haiti","Puerto Rico and Cuba","Jamaica and Haiti"], correct: 1 },
  { question: "What is the capital of Jamaica?", choices: ["Montego Bay","Negril","Kingston","Spanish Town"], correct: 2 },
  { question: "What is the official language of Haiti?", choices: ["Spanish","English","French","Dutch"], correct: 2 },
  { question: "What is the capital of the Dominican Republic?", choices: ["Santiago","Santo Domingo","La Romana","Punta Cana"], correct: 1 },
  { question: "Which Caribbean island is a U.S. territory?", choices: ["Aruba","Puerto Rico","Curacao","Martinique"], correct: 1 },
  { question: "What sea borders the Caribbean to the south?", choices: ["Atlantic","Caribbean Sea","Gulf of Mexico","Pacific"], correct: 1 },
  { question: "What is the smallest sovereign country in the Americas?", choices: ["Saint Kitts and Nevis","Grenada","Dominica","Barbados"], correct: 0 },
  { question: "What is the capital of Trinidad and Tobago?", choices: ["Scarborough","Port of Spain","San Fernando","Chaguanas"], correct: 1 },
  { question: "What music genre originated in Jamaica?", choices: ["Salsa","Reggae","Merengue","Calypso"], correct: 1 },
  { question: "The Bahamas consists of how many islands (approximately)?", choices: ["50","250","700","2,000"], correct: 2 },
  { question: "What is the capital of the Bahamas?", choices: ["Freeport","Nassau","Andros","Marsh Harbour"], correct: 1 },
  { question: "Which Caribbean island has the same name as its capital?", choices: ["Saint Lucia","Saint Vincent","Dominica","Grenada"], correct: 3 },
  { question: "What is the highest peak in the Caribbean?", choices: ["Pico Duarte","Blue Mountain Peak","Pico Turquino","Soufriere"], correct: 0 },
  { question: "In which country is Pico Duarte?", choices: ["Cuba","Haiti","Dominican Republic","Jamaica"], correct: 2 },
  { question: "What is Aruba's relationship to the Netherlands?", choices: ["Independent country","Constituent country of the Kingdom","Province","Colony"], correct: 1 },
  { question: "What is the capital of Barbados?", choices: ["Holetown","Speightstown","Bridgetown","Oistins"], correct: 2 },
  { question: "What music style originated in Trinidad?", choices: ["Reggae","Calypso","Salsa","Merengue"], correct: 1 },
  { question: "What is the capital of Puerto Rico?", choices: ["Ponce","Bayamon","San Juan","Mayaguez"], correct: 2 },
  { question: "Which volcano famously erupted on Martinique in 1902?", choices: ["Soufriere","Mount Pelee","La Grande Soufriere","Kick em Jenny"], correct: 1 },
  { question: "What strait separates Cuba from Florida?", choices: ["Yucatan Channel","Florida Strait","Windward Passage","Mona Passage"], correct: 1 },
  { question: "What is the capital of Haiti?", choices: ["Cap-Haitien","Port-au-Prince","Gonaives","Les Cayes"], correct: 1 },
  { question: "Which Caribbean nation gained independence from Britain in 1962?", choices: ["Jamaica","Bahamas","Barbados","Trinidad and Tobago"], correct: 0 },
  { question: "What currency is used in most of Eastern Caribbean states?", choices: ["US Dollar","Caribbean Dollar","Eastern Caribbean Dollar","Pound"], correct: 2 },
  { question: "What is the most southern Caribbean island country?", choices: ["Trinidad and Tobago","Grenada","Barbados","Saint Vincent"], correct: 0 },
  { question: "What sea creature appears on the flag of Anguilla?", choices: ["Shark","Dolphin","Three dolphins","Turtle"], correct: 2 },
  { question: "What's the dominant religion in most Caribbean nations?", choices: ["Hinduism","Christianity","Islam","Judaism"], correct: 1 },
  { question: "What island chain separates the Caribbean from the Atlantic?", choices: ["Greater Antilles","Lesser Antilles","Bahamas","Leeward Islands"], correct: 1 },
  { question: "Which Caribbean island is famous for its blue mountain coffee?", choices: ["Cuba","Jamaica","Dominican Republic","Puerto Rico"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CaribbeanQuizSettings): CaribbeanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CaribbeanQuizState, action: CaribbeanQuizAction): CaribbeanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CaribbeanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
