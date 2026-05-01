import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AztecQuizSettings { questions: "10" | "20" | "30"; }
export interface AztecQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AztecQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was the Aztec capital?", choices: ["Tenochtitlan","Teotihuacan","Tula","Cholula"], correct: 0 },
  { question: "What modern city sits over Tenochtitlan?", choices: ["Mexico City","Guadalajara","Puebla","Oaxaca"], correct: 0 },
  { question: "In what year did Hernan Cortes arrive in Mexico?", choices: ["1519","1492","1521","1532"], correct: 0 },
  { question: "Who led the Spanish conquest of Mexico?", choices: ["Hernan Cortes","Pizarro","Cabeza de Vaca","Cortez"], correct: 0 },
  { question: "Who was the Aztec emperor when Cortes arrived?", choices: ["Moctezuma II","Cuauhtemoc","Ahuitzotl","Tizoc"], correct: 0 },
  { question: "In what year did Tenochtitlan fall?", choices: ["1521","1519","1525","1532"], correct: 0 },
  { question: "Who was the last Aztec emperor?", choices: ["Cuauhtemoc","Moctezuma II","Cuitlahuac","Ahuitzotl"], correct: 0 },
  { question: "What was the chief Aztec war god?", choices: ["Huitzilopochtli","Tlaloc","Quetzalcoatl","Tezcatlipoca"], correct: 0 },
  { question: "What was the Aztec rain god?", choices: ["Tlaloc","Huitzilopochtli","Quetzalcoatl","Xipe Totec"], correct: 0 },
  { question: "What feathered serpent god was prominent in Aztec/Mesoamerican religion?", choices: ["Quetzalcoatl","Tlaloc","Huitzilopochtli","Xolotl"], correct: 0 },
  { question: "What was the Aztec language?", choices: ["Nahuatl","Mayan","Quechua","Otomi"], correct: 0 },
  { question: "What Aztec staple food crop was central?", choices: ["Maize","Potato","Quinoa","Yam"], correct: 0 },
  { question: "What were Aztec floating gardens called?", choices: ["Chinampas","Andenes","Milpas","Waru waru"], correct: 0 },
  { question: "What lake was Tenochtitlan built on?", choices: ["Lake Texcoco","Lake Patzcuaro","Lake Chapala","Lake Catemaco"], correct: 0 },
  { question: "What was the Aztec calendar stone called?", choices: ["Sun Stone (Piedra del Sol)","Moon Stone","Stela","Codex"], correct: 0 },
  { question: "What ritual practice was Aztec religion famous for?", choices: ["Human sacrifice","Animal sacrifice","Both","Fire offering"], correct: 2 },
  { question: "What military elite warriors were named for animals?", choices: ["Eagle and Jaguar warriors","Snake warriors","Owl warriors","Hawk warriors"], correct: 0 },
  { question: "What weapon was an obsidian-bladed wooden club?", choices: ["Macuahuitl","Atlatl","Tepoztopilli","Cuauhololli"], correct: 0 },
  { question: "What was an atlatl?", choices: ["Spear-thrower","Sword","Bow","Sling"], correct: 0 },
  { question: "What city-state league formed the Aztec Triple Alliance?", choices: ["Tenochtitlan, Texcoco, Tlacopan","Tenochtitlan, Tlatelolco, Cholula","Tula, Teotihuacan, Tlaxcala","Mayapan, Uxmal, Chichen"], correct: 0 },
  { question: "Who was Cortes's translator?", choices: ["La Malinche (Malintzin)","Aguilar","Both helped him","Geronimo"], correct: 2 },
  { question: "What disease devastated the Aztecs?", choices: ["Smallpox","Cholera","Plague","Measles"], correct: 0 },
  { question: "What Aztec god of the underworld?", choices: ["Mictlantecuhtli","Tlaloc","Tezcatlipoca","Xolotl"], correct: 0 },
  { question: "What Aztec ritual had a 52-year cycle ceremony?", choices: ["New Fire Ceremony","Tlaxinica","Veintena","Atemoztli"], correct: 0 },
  { question: "What region in Mexico did the Aztecs call home?", choices: ["Valley of Mexico","Yucatan","Oaxaca","Veracruz"], correct: 0 },
  { question: "What was the largest Aztec marketplace?", choices: ["Tlatelolco","Texcoco","Cholula","Xochimilco"], correct: 0 },
  { question: "What were Aztec causeways?", choices: ["Roads connecting Tenochtitlan to mainland","Sea routes","River bridges","Canals"], correct: 0 },
  { question: "What was xocoatl?", choices: ["Cocoa drink (chocolate)","Maize bread","Beer","Stew"], correct: 0 },
  { question: "What was Aztec social class structure based on?", choices: ["Nobles, commoners, slaves with priests/warriors above","Caste","Tribal","Royal lineage only"], correct: 0 },
  { question: "What was a calmecac?", choices: ["School for nobles","Temple","Marketplace","Battlefield"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AztecQuizSettings): AztecQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AztecQuizState, action: AztecQuizAction): AztecQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AztecQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
