import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface MexicoCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MexicoCultureQuizSettings { questions: "10" | "20"; }
export interface MexicoCultureQuizState { questions: MexicoCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MexicoCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: MexicoCultureQuizQuestion[] = [
  { question: "What is the capital of Mexico?", choices: ["Guadalajara","Mexico City","Monterrey","Puebla"], correct: 1 },
  { question: "The Day of the Dead (Dia de los Muertos) is celebrated in early?", choices: ["October","November","December","January"], correct: 1 },
  { question: "Which ancient civilization built the city of Tenochtitlan?", choices: ["Maya","Olmec","Aztec","Toltec"], correct: 2 },
  { question: "Tequila is distilled from which plant?", choices: ["Cactus","Blue agave","Sugarcane","Corn"], correct: 1 },
  { question: "Which painter is famous for self-portraits and married Diego Rivera?", choices: ["Remedios Varo","Frida Kahlo","Maria Izquierdo","Leonora Carrington"], correct: 1 },
  { question: "Chichen Itza, a famous Mayan pyramid site, is located in which state?", choices: ["Quintana Roo","Yucatan","Chiapas","Campeche"], correct: 1 },
  { question: "Mexico gained independence from which European country?", choices: ["France","Portugal","Spain","Britain"], correct: 2 },
  { question: "Mole poblano is a sauce associated with which city?", choices: ["Oaxaca","Puebla","Veracruz","Merida"], correct: 1 },
  { question: "Which Mexican holiday celebrates the 1862 victory over French forces?", choices: ["Independence Day","Cinco de Mayo","Revolution Day","Constitution Day"], correct: 1 },
  { question: "Which gulf lies to the east of Mexico?", choices: ["Gulf of California","Gulf of Mexico","Gulf of Tehuantepec","Gulf of Panama"], correct: 1 },
  { question: "Pancho Villa was a leader during which conflict?", choices: ["Mexican-American War","Mexican Revolution","Cristero War","War of Reform"], correct: 1 },
  { question: "Which is a traditional Mexican corn flatbread?", choices: ["Naan","Tortilla","Pita","Crepe"], correct: 1 },
  { question: "Mariachi music originated in which Mexican state?", choices: ["Oaxaca","Veracruz","Jalisco","Chiapas"], correct: 2 },
  { question: "Which Mexican dish consists of folded tortillas filled with cheese?", choices: ["Tamale","Quesadilla","Tostada","Chilaquiles"], correct: 1 },
  { question: "Which Aztec emperor met Hernan Cortes in 1519?", choices: ["Cuauhtemoc","Moctezuma II","Itzcoatl","Ahuitzotl"], correct: 1 },
  { question: "The Mexican peninsula extending into the Caribbean is?", choices: ["Baja California","Yucatan","Florida","Iberian"], correct: 1 },
  { question: "Which Nobel Prize-winning Mexican poet wrote 'The Labyrinth of Solitude'?", choices: ["Carlos Fuentes","Octavio Paz","Juan Rulfo","Mario Vargas Llosa"], correct: 1 },
  { question: "Mexican muralist Diego Rivera was famous for painting?", choices: ["Portraits","Murals","Landscapes","Still lifes"], correct: 1 },
  { question: "Which spirit is made from smoked agave hearts?", choices: ["Tequila","Mezcal","Pulque","Pisco"], correct: 1 },
  { question: "Which mountain range runs along Mexico's western coast?", choices: ["Sierra Madre Occidental","Sierra Madre Oriental","Andes","Rockies"], correct: 0 },
  { question: "Mexico's currency is the?", choices: ["Peso","Real","Sol","Quetzal"], correct: 0 },
  { question: "Which Olympic Games did Mexico City host?", choices: ["1964","1968","1972","1976"], correct: 1 },
  { question: "Acapulco is a famous resort city on which coast?", choices: ["Caribbean","Pacific","Gulf of Mexico","Sea of Cortez"], correct: 1 },
  { question: "Guacamole's main ingredient is?", choices: ["Tomato","Avocado","Lime","Bean"], correct: 1 },
  { question: "Which Mexican president led the country during the 1910 Revolution's start?", choices: ["Benito Juarez","Porfirio Diaz","Lazaro Cardenas","Miguel Aleman"], correct: 1 },
  { question: "The Maya civilization developed an advanced calendar and writing system in which area?", choices: ["Northern deserts","Mesoamerica","Andes","Patagonia"], correct: 1 },
  { question: "Cancun is located in which Mexican state?", choices: ["Yucatan","Quintana Roo","Campeche","Tabasco"], correct: 1 },
  { question: "Which Mexican volcano near Mexico City is called 'El Popo'?", choices: ["Pico de Orizaba","Popocatepetl","Iztaccihuatl","La Malinche"], correct: 1 },
  { question: "Which Mexican director won the Best Director Oscar for the film 'Gravity'?", choices: ["Guillermo del Toro","Alfonso Cuaron","Alejandro Gonzalez Inarritu","Carlos Reygadas"], correct: 1 },
  { question: "Salma Hayek is an actress born in which Mexican state?", choices: ["Veracruz","Jalisco","Yucatan","Sinaloa"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MexicoCultureQuizSettings): MexicoCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MexicoCultureQuizState, action: MexicoCultureQuizAction): MexicoCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MexicoCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
