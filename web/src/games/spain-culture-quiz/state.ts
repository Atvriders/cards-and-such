import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface SpainCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpainCultureQuizSettings { questions: "10" | "20"; }
export interface SpainCultureQuizState { questions: SpainCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpainCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: SpainCultureQuizQuestion[] = [
  { question: "What is the capital of Spain?", choices: ["Barcelona","Seville","Madrid","Valencia"], correct: 2 },
  { question: "Which Spanish region is the birthplace of paella?", choices: ["Catalonia","Andalusia","Valencia","Galicia"], correct: 2 },
  { question: "Flamenco music and dance originated in which region?", choices: ["Castile","Andalusia","Basque Country","Galicia"], correct: 1 },
  { question: "Which architect designed the Sagrada Familia in Barcelona?", choices: ["Calatrava","Gaudi","Bofill","Moneo"], correct: 1 },
  { question: "In which year did the Spanish Civil War end?", choices: ["1936","1939","1945","1949"], correct: 1 },
  { question: "Real Madrid plays its home games at which stadium?", choices: ["Camp Nou","Santiago Bernabeu","Mestalla","Wanda Metropolitano"], correct: 1 },
  { question: "La Tomatina festival in Bunol features a fight using what?", choices: ["Wine","Tomatoes","Bulls","Fireworks"], correct: 1 },
  { question: "Pablo Picasso was born in which Spanish city?", choices: ["Madrid","Barcelona","Malaga","Bilbao"], correct: 2 },
  { question: "Don Quixote was written by which Spanish author?", choices: ["Federico Garcia Lorca","Miguel de Cervantes","Camilo Jose Cela","Antonio Machado"], correct: 1 },
  { question: "Sangria is a punch traditionally based on what?", choices: ["Beer","Wine and fruit","Vodka","Whiskey"], correct: 1 },
  { question: "The Alhambra palace complex is located in which city?", choices: ["Cordoba","Granada","Seville","Toledo"], correct: 1 },
  { question: "Which sport is most popular nationally in Spain?", choices: ["Cricket","Football (soccer)","Rugby","Baseball"], correct: 1 },
  { question: "Tapas are best described as?", choices: ["Desserts","Small savory dishes or snacks","Cold soups","Stews"], correct: 1 },
  { question: "Pamplona is famous worldwide for the running of the?", choices: ["Horses","Bulls","Sheep","Pigs"], correct: 1 },
  { question: "Which language is co-official with Spanish in Catalonia?", choices: ["Basque","Galician","Catalan","Aragonese"], correct: 2 },
  { question: "Which royal house currently reigns in Spain?", choices: ["Habsburg","Bourbon","Orange","Windsor"], correct: 1 },
  { question: "Which Spanish city hosted the 1992 Summer Olympics?", choices: ["Madrid","Barcelona","Seville","Valencia"], correct: 1 },
  { question: "Gazpacho is traditionally served as a cold what?", choices: ["Stew","Soup","Drink","Sauce"], correct: 1 },
  { question: "The Prado Museum, home to works by Velazquez, is in which city?", choices: ["Barcelona","Madrid","Valencia","Bilbao"], correct: 1 },
  { question: "Which conquistador led the conquest of the Aztec Empire?", choices: ["Hernan Cortes","Francisco Pizarro","Vasco Nunez de Balboa","Ferdinand Magellan"], correct: 0 },
  { question: "Spain's national football team is nicknamed?", choices: ["La Roja","La Furia","Los Toros","La Selecta"], correct: 0 },
  { question: "Salvador Dali is best known as a master of which art movement?", choices: ["Cubism","Surrealism","Impressionism","Realism"], correct: 1 },
  { question: "Which is Spain's most famous wine region for tempranillo?", choices: ["Champagne","Rioja","Tuscany","Bordeaux"], correct: 1 },
  { question: "In which year did the Spanish Inquisition begin?", choices: ["1478","1492","1502","1521"], correct: 0 },
  { question: "Madrid sits on the banks of which river?", choices: ["Ebro","Tagus","Manzanares","Guadalquivir"], correct: 2 },
  { question: "Which mountain range separates Spain from France?", choices: ["Alps","Pyrenees","Sierra Nevada","Cantabrian Mountains"], correct: 1 },
  { question: "Iberian ham (jamon iberico) is made from a breed of?", choices: ["Cow","Sheep","Pig","Goat"], correct: 2 },
  { question: "Which Spanish king abdicated in favor of his son Felipe VI in 2014?", choices: ["Juan Carlos I","Alfonso XIII","Carlos III","Felipe V"], correct: 0 },
  { question: "The Camino de Santiago pilgrimage ends at the cathedral in?", choices: ["Santiago de Compostela","Burgos","Leon","Oviedo"], correct: 0 },
  { question: "Which Spanish painter created Las Meninas?", choices: ["Goya","El Greco","Velazquez","Zurbaran"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpainCultureQuizSettings): SpainCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpainCultureQuizState, action: SpainCultureQuizAction): SpainCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpainCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
