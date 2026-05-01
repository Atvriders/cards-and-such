import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MayanQuizSettings { questions: "10" | "20" | "30"; }
export interface MayanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MayanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what region did the Maya civilization develop?", choices: ["Mesoamerica (Mexico, Guatemala, Belize, Honduras)","Andes","Caribbean","Amazon"], correct: 0 },
  { question: "What was the Maya classic period?", choices: ["c. 250-900 AD","500 BC-100 AD","1200-1500 AD","800 BC-200 AD"], correct: 0 },
  { question: "What is Chichen Itza?", choices: ["A major Maya city","A king","A volcano","A river"], correct: 0 },
  { question: "In what country is Chichen Itza?", choices: ["Mexico","Guatemala","Belize","Honduras"], correct: 0 },
  { question: "What is the famous step pyramid at Chichen Itza called?", choices: ["El Castillo (Temple of Kukulcan)","El Caracol","Great Ball Court","Sacred Cenote"], correct: 0 },
  { question: "What was the Maya writing system?", choices: ["Hieroglyphic script","Quipu","Cuneiform","Hieratic"], correct: 0 },
  { question: "What number system did the Maya use?", choices: ["Vigesimal (base 20)","Decimal","Binary","Sexagesimal"], correct: 0 },
  { question: "What concept did Maya math include uniquely?", choices: ["Zero","Negative numbers","Fractions","Infinity"], correct: 0 },
  { question: "What 260-day calendar did the Maya use?", choices: ["Tzolkin","Haab","Long Count","Sothic"], correct: 0 },
  { question: "What 365-day Maya solar calendar?", choices: ["Haab","Tzolkin","Long Count","Calendar Round"], correct: 0 },
  { question: "What ball game did the Maya play?", choices: ["Pok-a-tok / Pitz","Lacrosse","Ulama","Tlachtli"], correct: 0 },
  { question: "What was a Maya city-state called?", choices: ["Polity / kingdom","Caliphate","Sultanate","Khanate"], correct: 0 },
  { question: "What was the largest Maya city in the Classic Period?", choices: ["Tikal","Palenque","Copan","Caracol"], correct: 0 },
  { question: "In what country is Tikal?", choices: ["Guatemala","Mexico","Honduras","Belize"], correct: 0 },
  { question: "What was the Maya feathered serpent god (also Quetzalcoatl)?", choices: ["Kukulcan","Chaac","Itzamna","Hunahpu"], correct: 0 },
  { question: "Who was the Maya rain god?", choices: ["Chaac","Kukulcan","Itzamna","Ixchel"], correct: 0 },
  { question: "What was the Maya creator god?", choices: ["Itzamna","Kukulcan","Chaac","Ah Mun"], correct: 0 },
  { question: "What was a sacred sinkhole used by Maya?", choices: ["Cenote","Caldera","Spring","Lagoon"], correct: 0 },
  { question: "What collapse occurred c. 900 AD in southern Maya region?", choices: ["Classic Maya Collapse","Yucatec collapse","Postclassic","Pre-Columbian"], correct: 0 },
  { question: "What was the elite Maya city Palenque famous for?", choices: ["Pakal's tomb","Great pyramid","Ball court","Astronomy tower"], correct: 0 },
  { question: "Who was the most famous Maya ruler of Palenque?", choices: ["K'inich Janaab Pakal (Pakal the Great)","Yax K'uk Mo","Kinich Yax K'uk","Bird Jaguar"], correct: 0 },
  { question: "What Maya book is named for Yucatecan creation myths?", choices: ["Popol Vuh","Books of Chilam Balam","Codex Dresden","All are Maya"], correct: 3 },
  { question: "What Spanish bishop burned many Maya codices?", choices: ["Diego de Landa","Hernan Cortes","Pedro de Alvarado","Bartolome de las Casas"], correct: 0 },
  { question: "In what year did Spanish conquer the last Maya city?", choices: ["1521","1697","1532","1519"], correct: 1 },
  { question: "Where is the last Maya stronghold Nojpetén located?", choices: ["Lake Peten Itza","Yucatan","Highlands of Guatemala","Honduras coast"], correct: 0 },
  { question: "What was the Maya staple food?", choices: ["Maize","Wheat","Rice","Yams"], correct: 0 },
  { question: "What Maya bean became important to Europeans (cocoa)?", choices: ["Cacao","Vanilla","Achiote","Both cacao and vanilla"], correct: 3 },
  { question: "What were Maya stelae?", choices: ["Carved monumental stones","Temple roofs","Sacred trees","Cenote markers"], correct: 0 },
  { question: "What direction did Maya pyramids face most often?", choices: ["With astronomical alignments","North","South","Random"], correct: 0 },
  { question: "What was the Maya 'Long Count' famously associated with in 2012?", choices: ["End of a baktun cycle (misinterpreted as world end)","Calendar reset","World end","All these myths"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MayanQuizSettings): MayanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MayanQuizState, action: MayanQuizAction): MayanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MayanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
