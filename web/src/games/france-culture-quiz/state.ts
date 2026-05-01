import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface FranceCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FranceCultureQuizSettings { questions: "10" | "20"; }
export interface FranceCultureQuizState { questions: FranceCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FranceCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: FranceCultureQuizQuestion[] = [
  { question: "What is the capital of France?", choices: ["Lyon","Paris","Marseille","Toulouse"], correct: 1 },
  { question: "Who painted the Mona Lisa, now housed in the Louvre?", choices: ["Monet","Raphael","Leonardo da Vinci","Vermeer"], correct: 2 },
  { question: "The Eiffel Tower was completed in?", choices: ["1875","1889","1900","1912"], correct: 1 },
  { question: "Which French king was guillotined in 1793?", choices: ["Louis XIV","Louis XV","Louis XVI","Henri IV"], correct: 2 },
  { question: "The French Revolution began in which year?", choices: ["1776","1789","1799","1815"], correct: 1 },
  { question: "Napoleon Bonaparte was finally defeated at?", choices: ["Austerlitz","Waterloo","Trafalgar","Borodino"], correct: 1 },
  { question: "The French national anthem is called?", choices: ["La Marseillaise","Le Chant","La Liberté","La Republique"], correct: 0 },
  { question: "Which river runs through Paris?", choices: ["Loire","Rhone","Seine","Garonne"], correct: 2 },
  { question: "The Louvre's iconic glass pyramid was designed by?", choices: ["I.M. Pei","Jean Nouvel","Le Corbusier","Frank Gehry"], correct: 0 },
  { question: "Charles de Gaulle led the Free French during which conflict?", choices: ["WWI","WWII","Algerian War","Franco-Prussian War"], correct: 1 },
  { question: "The Tour de France is held primarily in which month?", choices: ["June","July","August","September"], correct: 1 },
  { question: "Champagne wine comes from which region?", choices: ["Bordeaux","Burgundy","Champagne","Provence"], correct: 2 },
  { question: "Which French cheese is a soft, bloomy-rind classic from Normandy?", choices: ["Roquefort","Camembert","Comte","Brie de Meaux"], correct: 1 },
  { question: "Croissants share heritage most closely with which country's pastry?", choices: ["Italy","Austria","Switzerland","Germany"], correct: 1 },
  { question: "Bouillabaisse is a fish stew from which port city?", choices: ["Nice","Marseille","Bordeaux","Toulon"], correct: 1 },
  { question: "Coq au vin is chicken braised in?", choices: ["Beer","Red wine","Cream","Cider"], correct: 1 },
  { question: "Which French author wrote 'Les Misérables'?", choices: ["Émile Zola","Victor Hugo","Gustave Flaubert","Marcel Proust"], correct: 1 },
  { question: "The Palace of Versailles was built mainly for which king?", choices: ["Louis XIII","Louis XIV","Louis XV","Louis XVI"], correct: 1 },
  { question: "Joan of Arc helped lift the siege of which city in 1429?", choices: ["Paris","Orleans","Reims","Rouen"], correct: 1 },
  { question: "The Fifth Republic was established in?", choices: ["1944","1946","1958","1969"], correct: 2 },
  { question: "Which mountain range borders France and Spain?", choices: ["Alps","Pyrenees","Vosges","Jura"], correct: 1 },
  { question: "Mont Blanc, Western Europe's highest peak, sits on the border with?", choices: ["Switzerland","Italy","Spain","Germany"], correct: 1 },
  { question: "Impressionist Claude Monet is famous for paintings of?", choices: ["Sunflowers","Water lilies","Ballerinas","Bathers"], correct: 1 },
  { question: "Marie Curie won Nobel Prizes in which two fields?", choices: ["Physics and Chemistry","Chemistry and Medicine","Physics and Medicine","Chemistry only"], correct: 0 },
  { question: "Which French region is famous for lavender fields?", choices: ["Brittany","Normandy","Provence","Alsace"], correct: 2 },
  { question: "The Bastille was stormed on what date in 1789?", choices: ["May 5","June 20","July 14","August 4"], correct: 2 },
  { question: "The currency used in France today is the?", choices: ["Franc","Euro","Livre","Ecu"], correct: 1 },
  { question: "D-Day landings (1944) took place on the beaches of?", choices: ["Brittany","Normandy","Pas-de-Calais","Provence"], correct: 1 },
  { question: "Which fashion designer founded the house with the double-C logo?", choices: ["Yves Saint Laurent","Coco Chanel","Christian Dior","Hubert de Givenchy"], correct: 1 },
  { question: "Edith Piaf is best remembered as a famous?", choices: ["Painter","Singer","Author","Actress"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FranceCultureQuizSettings): FranceCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FranceCultureQuizState, action: FranceCultureQuizAction): FranceCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FranceCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
