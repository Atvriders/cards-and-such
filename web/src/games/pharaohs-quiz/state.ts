import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface PharaohsQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface PharaohsQuizState { settings: PharaohsQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type PharaohsQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "Which pharaoh built the Great Pyramid of Giza?", answer: "Khufu", wrong: ["Khafre","Ramesses II","Thutmose III"] },
  { question: "Which pharaoh was known as Ramesses the Great?", answer: "Ramesses II", wrong: ["Ramesses I","Ramesses III","Seti I"] },
  { question: "Which female pharaoh ruled as king alongside Thutmose III?", answer: "Hatshepsut", wrong: ["Nefertiti","Cleopatra VII","Ankhesenamun"] },
  { question: "Which pharaoh introduced worship of Aten as sole god?", answer: "Akhenaten", wrong: ["Tutankhamun","Amenhotep III","Horemheb"] },
  { question: "Which famous boy-pharaoh's tomb was found intact in 1922?", answer: "Tutankhamun", wrong: ["Akhenaten","Ramesses II","Seti I"] },
  { question: "Who was Egypt's last ruling pharaoh?", answer: "Cleopatra VII", wrong: ["Nefertiti","Hatshepsut","Berenice IV"] },
  { question: "Which pharaoh fought the Hittites at Kadesh?", answer: "Ramesses II", wrong: ["Thutmose III","Seti I","Amenhotep II"] },
  { question: "Who built the Sphinx at Giza?", answer: "Khafre (likely)", wrong: ["Khufu","Menkaure","Ramesses II"] },
  { question: "Which pharaoh's mummy was found at Valley of the Kings in 1881?", answer: "Ramesses II", wrong: ["Khufu","Akhenaten","Thutmose III"] },
  { question: "What title was given to the pharaoh as living god?", answer: "Son of Ra", wrong: ["Lord of Horus","Voice of Osiris","King of Aten"] },
  { question: "Which pharaoh defeated the Sea Peoples?", answer: "Ramesses III", wrong: ["Ramesses II","Seti I","Merneptah"] },
  { question: "Which pharaoh united Upper and Lower Egypt?", answer: "Narmer (Menes)", wrong: ["Khufu","Sneferu","Djoser"] },
  { question: "Who built the first true pyramid in Egypt?", answer: "Sneferu", wrong: ["Djoser","Khufu","Khafre"] },
  { question: "Which pharaoh built the first step pyramid?", answer: "Djoser", wrong: ["Khufu","Sneferu","Menkaure"] },
  { question: "Which pharaoh was buried in the Valley of the Kings first?", answer: "Thutmose I", wrong: ["Amenhotep I","Thutmose II","Hatshepsut"] },
  { question: "Which New Kingdom pharaoh was known for his military campaigns?", answer: "Thutmose III", wrong: ["Amenhotep III","Akhenaten","Seti I"] },
  { question: "What did pharaohs wear as a symbol of power?", answer: "Double crown (Pschent)", wrong: ["Gold helmet","Uraeus only","Blue war crown only"] },
  { question: "What was the sacred cobra symbol on the pharaoh's crown called?", answer: "Uraeus", wrong: ["Ankh","Djed","Was scepter"] },
  { question: "Which queen was the wife of Akhenaten and famed for her beauty?", answer: "Nefertiti", wrong: ["Nefertari","Hatshepsut","Ankhesenamun"] },
  { question: "What was the sacred bull worshipped at Memphis?", answer: "Apis Bull", wrong: ["Hathor Bull","Ra Bull","Khnum Bull"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PharaohsQuizSettings): PharaohsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: PharaohsQuizState, action: PharaohsQuizAction): PharaohsQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: PharaohsQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
