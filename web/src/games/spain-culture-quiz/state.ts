import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface SpainCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpainCultureQuizSettings { questions: "10" | "20"; }
export interface SpainCultureQuizState { questions: SpainCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpainCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: SpainCultureQuizQuestion[] = [
  { question: "What is the capital of Spain?", choices: ["Barcelona","Seville","Madrid","Valencia"], correct: 2 },
  { question: "Paella originated in which region?", choices: ["Catalonia","Andalusia","Valencia","Galicia"], correct: 2 },
  { question: "Flamenco is most associated with?", choices: ["Castile","Andalusia","Basque Country","Galicia"], correct: 1 },
  { question: "Antoni Gaudí designed?", choices: ["Alhambra","Sagrada Familia","El Escorial","Guggenheim Bilbao"], correct: 1 },
  { question: "The Spanish Civil War ended in?", choices: ["1936","1939","1945","1949"], correct: 1 },
  { question: "Real Madrid plays in which stadium?", choices: ["Camp Nou","Bernabeu","Mestalla","Wanda"], correct: 1 },
  { question: "La Tomatina festival features?", choices: ["Wine","Tomatoes","Bulls","Fireworks"], correct: 1 },
  { question: "Picasso was born in?", choices: ["Madrid","Barcelona","Malaga","Bilbao"], correct: 2 },
  { question: "Don Quixote was written by?", choices: ["Lorca","Cervantes","Borges","Marquez"], correct: 1 },
  { question: "Sangria typically contains?", choices: ["Beer","Wine and fruit","Vodka","Whiskey"], correct: 1 },
  { question: "The Alhambra is in?", choices: ["Cordoba","Granada","Seville","Toledo"], correct: 1 },
  { question: "Which is a Spanish-speaking sport, popular nationally?", choices: ["Cricket","Football","Rugby","Baseball"], correct: 1 },
  { question: "Tapas are?", choices: ["Desserts","Small dishes/snacks","Soups","Stews"], correct: 1 },
  { question: "Pamplona is famous for the running of the?", choices: ["Horses","Bulls","Sheep","Pigs"], correct: 1 },
  { question: "Which language is co-official in Catalonia?", choices: ["Basque","Galician","Catalan","Aragonese"], correct: 2 },
  { question: "Spain's royal house is?", choices: ["Habsburg","Bourbon","Orange","Windsor"], correct: 1 },
  { question: "Which city hosts the 1992 Olympics?", choices: ["Madrid","Barcelona","Seville","Valencia"], correct: 1 },
  { question: "Gazpacho is a cold?", choices: ["Stew","Soup","Drink","Sauce"], correct: 1 },
  { question: "The Prado Museum is in?", choices: ["Barcelona","Madrid","Valencia","Bilbao"], correct: 1 },
  { question: "Which conquistador conquered the Aztecs?", choices: ["Cortes","Pizarro","Balboa","Magellan"], correct: 0 },
  { question: "Spain's national football team is nicknamed?", choices: ["La Roja","La Furia","Los Toros","La Selecta"], correct: 0 },
  { question: "Salvador Dalí was a master of?", choices: ["Cubism","Surrealism","Impressionism","Realism"], correct: 1 },
  { question: "Which is a famous Spanish wine region?", choices: ["Champagne","Rioja","Tuscany","Bordeaux"], correct: 1 },
  { question: "The Spanish Inquisition began in?", choices: ["1478","1492","1502","1521"], correct: 0 },
  { question: "Madrid is on which river?", choices: ["Ebro","Tagus","Manzanares","Guadalquivir"], correct: 2 }
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
