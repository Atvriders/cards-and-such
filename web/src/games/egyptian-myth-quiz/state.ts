import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EgyptianMythQuizSettings { questions: "10" | "20" | "30"; }
export interface EgyptianMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EgyptianMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who's the Egyptian sun god?", choices: ["Ra","Osiris","Anubis","Horus"], correct: 0 },
  { question: "Who's the god of the dead?", choices: ["Osiris","Anubis","Both have roles","Set"], correct: 2 },
  { question: "Who's the jackal-headed god of mummification?", choices: ["Anubis","Osiris","Set","Thoth"], correct: 0 },
  { question: "Who's the falcon-headed god?", choices: ["Horus","Ra","Set","Thoth"], correct: 0 },
  { question: "Who's the god of chaos and storms?", choices: ["Set","Ra","Anubis","Horus"], correct: 0 },
  { question: "Who's the goddess of magic and motherhood?", choices: ["Isis","Hathor","Bastet","Sekhmet"], correct: 0 },
  { question: "Who's the cat goddess?", choices: ["Bastet","Sekhmet","Both feline","Just Bastet"], correct: 2 },
  { question: "Who's the lion-headed war goddess?", choices: ["Sekhmet","Bastet","Both","Just Sekhmet"], correct: 0 },
  { question: "Who's the wisdom god with ibis head?", choices: ["Thoth","Anubis","Horus","Ra"], correct: 0 },
  { question: "What's Osiris's wife?", choices: ["Isis","Hathor","Nephthys","Maat"], correct: 0 },
  { question: "Who killed Osiris?", choices: ["Set","Horus","Anubis","Just Set"], correct: 2 },
  { question: "Who avenged Osiris?", choices: ["Horus","Isis","Both","Just Horus"], correct: 0 },
  { question: "Whose feather is used to weigh hearts?", choices: ["Maat","Isis","Hathor","Bastet"], correct: 0 },
  { question: "What's the symbol of Maat's feather weighing against?", choices: ["Heart","Soul","Both","Just heart"], correct: 2 },
  { question: "What's the Eye of Horus?", choices: ["Symbol of protection/healing","Just an eye","Both","Curse"], correct: 2 },
  { question: "What's the ankh?", choices: ["Symbol of life","Death","Both","Just symbol"], correct: 2 },
  { question: "What's the Book of the Dead?", choices: ["Funerary text guide","Just spells","Both","Hieroglyphs"], correct: 2 },
  { question: "What's a pharaoh's tomb traditionally?", choices: ["Pyramid (early) or Valley of the Kings tomb","Just pyramid","Both","Just tomb"], correct: 2 },
  { question: "What's a sarcophagus?", choices: ["Stone coffin","Wooden box","Both","Just box"], correct: 0 },
  { question: "What's mummification?", choices: ["Preserving body for afterlife","Just embalming","Both","Just preservation"], correct: 2 },
  { question: "What organ was left in mummy?", choices: ["Heart","Brain","Both removed","Lungs"], correct: 0 },
  { question: "What was removed first in mummification?", choices: ["Brain (often through nose)","Heart","Lungs","Liver"], correct: 0 },
  { question: "What's a canopic jar?", choices: ["Held internal organs","Stored food","Both","Just jar"], correct: 0 },
  { question: "What god is Apep?", choices: ["Serpent of chaos opposing Ra","Sun god","Both","Just enemy"], correct: 2 },
  { question: "What's the Field of Reeds?", choices: ["Egyptian afterlife paradise","Just field","Both","Just heaven"], correct: 2 },
  { question: "Who's the dwarf god of household and protection?", choices: ["Bes","Anubis","Thoth","Khonsu"], correct: 0 },
  { question: "Who's the moon god?", choices: ["Khonsu","Thoth (also wisdom)","Both","Just Khonsu"], correct: 2 },
  { question: "Who's the falcon god of pharaohs?", choices: ["Horus","Ra","Both falcon","Just Horus"], correct: 0 },
  { question: "What's Ra's solar boat called?", choices: ["Solar barque","Mandjet (day) and Mesektet (night)","Both","Just barque"], correct: 2 },
  { question: "What was the cult center of Amun?", choices: ["Thebes","Memphis","Heliopolis","Abydos"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EgyptianMythQuizSettings): EgyptianMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EgyptianMythQuizState, action: EgyptianMythQuizAction): EgyptianMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EgyptianMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
