import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IncanQuizSettings { questions: "10" | "20" | "30"; }
export interface IncanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IncanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What region did the Inca Empire dominate?", choices: ["Andean South America","Mesoamerica","Caribbean","Amazon Basin"], correct: 0 },
  { question: "What was the Inca capital?", choices: ["Cusco","Machu Picchu","Quito","Lima"], correct: 0 },
  { question: "What was the Inca name for their empire?", choices: ["Tawantinsuyu","Inka","Andean","Cuzco"], correct: 0 },
  { question: "Who was the Inca founder figure?", choices: ["Manco Capac","Pachacuti","Atahualpa","Tupac"], correct: 0 },
  { question: "Who was the great Inca emperor that expanded the empire (1438-1471)?", choices: ["Pachacuti","Manco","Huayna Capac","Tupac Inca Yupanqui"], correct: 0 },
  { question: "Who was the last Inca emperor before Spanish conquest?", choices: ["Atahualpa","Huascar","Manco","Tupac"], correct: 0 },
  { question: "In what year did Pizarro capture Atahualpa?", choices: ["1532","1492","1521","1519"], correct: 0 },
  { question: "Who led the Spanish conquest of Peru?", choices: ["Francisco Pizarro","Hernan Cortes","Diego de Almagro","Pedro de Valdivia"], correct: 0 },
  { question: "What system of knotted strings did Inca use for records?", choices: ["Quipu","Codex","Wampum","Khipus"], correct: 0 },
  { question: "What language did Inca speak?", choices: ["Quechua","Aymara","Spanish","Both Quechua and Aymara"], correct: 0 },
  { question: "What Inca site is in the Andes above the Sacred Valley?", choices: ["Machu Picchu","Cusco","Lima","Trujillo"], correct: 0 },
  { question: "Who rediscovered Machu Picchu in 1911?", choices: ["Hiram Bingham","Heinrich Schliemann","Percy Fawcett","Carter"], correct: 0 },
  { question: "What was the Inca road system called?", choices: ["Qhapaq Nan","Camino Real","Inca Trail","Royal Road"], correct: 0 },
  { question: "How long was the Inca road system roughly?", choices: ["40,000 km","10,000 km","20,000 km","5,000 km"], correct: 0 },
  { question: "What was the Inca Sun god?", choices: ["Inti","Viracocha","Pachamama","Mama Quilla"], correct: 0 },
  { question: "What was the Inca creator god?", choices: ["Viracocha","Inti","Pachamama","Mama Killa"], correct: 0 },
  { question: "What was the Inca earth-mother deity?", choices: ["Pachamama","Mama Killa","Inti","Mama Cocha"], correct: 0 },
  { question: "What Inca staple food allowed high-altitude farming?", choices: ["Potato","Corn","Quinoa","All staples"], correct: 3 },
  { question: "What animal did Inca domesticate for wool/transport?", choices: ["Llama","Alpaca","Both","Vicuna"], correct: 2 },
  { question: "What was the Inca currency or trade good (essentially they had no money)?", choices: ["Trade by barter","Gold","Silver","Cocoa beans"], correct: 0 },
  { question: "What Inca metalwork was famous?", choices: ["Gold and silver work","Bronze weapons","Iron tools","Copper alone"], correct: 0 },
  { question: "What 1572 event killed the last Inca royal claimant?", choices: ["Execution of Tupac Amaru I","Pizarro killed last royal","Battle of Cuzco","Vilcabamba fell"], correct: 0 },
  { question: "What was the Inca army's main weapon?", choices: ["Sling, club, bola","Sword","Bow","Spear"], correct: 0 },
  { question: "What Inca region/quarter was the four-part division?", choices: ["Suyu","Chinchaysuyu","Tawantinsuyu's parts","Antisuyu"], correct: 2 },
  { question: "What's the Inca terrace farming system called?", choices: ["Andenes","Chinampas","Milpa","Waru waru"], correct: 0 },
  { question: "What Inca temple in Cusco was covered in gold?", choices: ["Coricancha","Sacsayhuaman","Qenqo","Tambomachay"], correct: 0 },
  { question: "What Inca fortress is above Cusco?", choices: ["Sacsayhuaman","Ollantaytambo","Pisac","All Inca sites"], correct: 0 },
  { question: "What Inca disease devastated population pre-Pizarro?", choices: ["Smallpox","Cholera","Plague","Measles"], correct: 0 },
  { question: "What 1781-1783 rebellion took the name Tupac Amaru II?", choices: ["Tupac Amaru II rebellion","Tahuantinsuyu","Cusco rebellion","Inca Restoration"], correct: 0 },
  { question: "What sacred shape was the Inca city of Cusco said to resemble?", choices: ["A puma","A condor","A llama","A serpent"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: IncanQuizSettings): IncanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: IncanQuizState, action: IncanQuizAction): IncanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: IncanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
