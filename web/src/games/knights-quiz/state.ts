import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface KnightsQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface KnightsQuizState { settings: KnightsQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type KnightsQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "What was a young man training to become a knight called?", answer: "Squire", wrong: ["Page","Vassal","Serf"] },
  { question: "What was the ceremony making someone a knight?", answer: "Dubbing", wrong: ["Coronation","Oath ceremony","Initiation"] },
  { question: "What military orders fought in the Crusades?", answer: "Knights Templar", wrong: ["Knights Hospitaller only","Teutonic Knights only","Saxon Guard"] },
  { question: "What was the code of conduct for knights?", answer: "Chivalry", wrong: ["Feudalism","Jousting code","Oath of fealty"] },
  { question: "What was a knight's armored horse called?", answer: "Destrier", wrong: ["Palfrey","Courser","Rouncey"] },
  { question: "What type of combat sport did knights perform publicly?", answer: "Tournament / Jousting", wrong: ["Melee","Duel","Archery contest"] },
  { question: "What did crusader knights wear as a symbol?", answer: "Red cross on white", wrong: ["Black cross on silver","White cross on red","Gold cross on blue"] },
  { question: "What was the defensive structure knights guarded?", answer: "Castle", wrong: ["Manor","Fortified town","Monastery"] },
  { question: "Which famous crusade recaptured Jerusalem in 1099?", answer: "First Crusade", wrong: ["Second Crusade","Third Crusade","Fourth Crusade"] },
  { question: "What was a knight's long spear used in jousting?", answer: "Lance", wrong: ["Pike","Halberd","Pole-axe"] },
  { question: "What were the lower nobles who owned manors called?", answer: "Lords", wrong: ["Barons","Knights","Bishops"] },
  { question: "What famous knight is associated with the Round Table?", answer: "Lancelot", wrong: ["Gawain","Percival","Galahad"] },
  { question: "Which king is associated with the Knights of the Round Table?", answer: "King Arthur", wrong: ["Charlemagne","Richard I","Edward I"] },
  { question: "What was full plate armor first developed in?", answer: "14th century", wrong: ["12th century","10th century","16th century"] },
  { question: "What military order controlled Rhodes and Malta?", answer: "Knights Hospitaller", wrong: ["Teutonic Knights","Knights Templar","Knights of St. John only"] },
  { question: "What was a knight's heraldic symbol called?", answer: "Coat of arms", wrong: ["Crest","Livery","Badge"] },
  { question: "What was the large shield used by mounted knights?", answer: "Heater shield", wrong: ["Kite shield","Buckler","Targe"] },
  { question: "Which Crusade captured Constantinople instead of Jerusalem?", answer: "Fourth Crusade", wrong: ["Second Crusade","Third Crusade","Fifth Crusade"] },
  { question: "Who was the famous crusader-king known as Richard the Lionheart?", answer: "Richard I of England", wrong: ["Philip II of France","Frederick Barbarossa","Saladin"] },
  { question: "What system of land ownership supported the knight class?", answer: "Feudalism", wrong: ["Manorialism","Vassalage only","Serfdom"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KnightsQuizSettings): KnightsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: KnightsQuizState, action: KnightsQuizAction): KnightsQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: KnightsQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
