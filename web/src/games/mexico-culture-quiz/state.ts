import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface MexicoCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MexicoCultureQuizSettings { questions: "10" | "20"; }
export interface MexicoCultureQuizState { questions: MexicoCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MexicoCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: MexicoCultureQuizQuestion[] = [
  { question: "What is the capital of Mexico?", choices: ["Guadalajara","Monterrey","Mexico City","Cancun"], correct: 2 },
  { question: "Which civilization built Chichen Itza?", choices: ["Aztec","Maya","Olmec","Inca"], correct: 1 },
  { question: "Day of the Dead is on?", choices: ["Oct 31","Nov 1-2","Dec 12","Sep 16"], correct: 1 },
  { question: "Mexico's independence from Spain was proclaimed in?", choices: ["1810","1821","1830","1848"], correct: 0 },
  { question: "Which painter is married to Diego Rivera?", choices: ["Tamayo","Frida Kahlo","Orozco","Toledo"], correct: 1 },
  { question: "Tequila is made from?", choices: ["Cactus","Blue agave","Sugarcane","Corn"], correct: 1 },
  { question: "Mariachi music traditionally features what instrument?", choices: ["Banjo","Trumpet/violin/guitar","Accordion","Piano"], correct: 1 },
  { question: "Cinco de Mayo commemorates a victory over?", choices: ["Spain","France","USA","England"], correct: 1 },
  { question: "The Aztec capital was?", choices: ["Cuzco","Tenochtitlan","Palenque","Tikal"], correct: 1 },
  { question: "Mole is a sauce that often contains?", choices: ["Coconut","Chocolate","Soy","Cream"], correct: 1 },
  { question: "Lucha libre is?", choices: ["Folk dance","Pro wrestling","Soccer","Cooking"], correct: 1 },
  { question: "Hernan Cortes conquered the Aztecs in?", choices: ["1492","1521","1545","1572"], correct: 1 },
  { question: "Which is a Mexican state?", choices: ["Texas","Yucatan","California","Arizona"], correct: 1 },
  { question: "Pancho Villa was a leader in the?", choices: ["Independence War","Revolution","Cristero War","Mexican-American War"], correct: 1 },
  { question: "Tortillas are typically made from?", choices: ["Wheat or corn","Rice","Bean flour","Potato"], correct: 0 },
  { question: "The Mexican flag features what bird?", choices: ["Hummingbird","Eagle","Quetzal","Falcon"], correct: 1 },
  { question: "Which beach destination is on the Yucatan?", choices: ["Acapulco","Cancun","Puerto Vallarta","Mazatlan"], correct: 1 },
  { question: "Spanish is the?", choices: ["Co-official with English","Official language","Just regional","Indigenous"], correct: 1 },
  { question: "Quesadilla literally means?", choices: ["Little tortilla","Cheesy thing","Hot wrap","Stuffed bread"], correct: 1 },
  { question: "Which holiday: Las Posadas?", choices: ["Easter","Christmas season procession","Independence","New Year"], correct: 1 },
  { question: "Sor Juana was a famous?", choices: ["Painter","Poet/nun","Singer","Actress"], correct: 1 },
  { question: "Mexico borders the USA along?", choices: ["Pacific","Rio Grande","Caribbean","Gulf only"], correct: 1 },
  { question: "Mexican peso symbol is?", choices: ["$","€","¥","₱"], correct: 0 },
  { question: "Which culture invented chocolate?", choices: ["Aztec/Maya (Mesoamerican)","Inca","Egyptian","Roman"], correct: 0 },
  { question: "Acapulco is famous for?", choices: ["Cliff diving","Skiing","Vineyards","Coffee"], correct: 0 }
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
