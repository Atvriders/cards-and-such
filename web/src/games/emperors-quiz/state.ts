import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface EmperorsQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface EmperorsQuizState { settings: EmperorsQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type EmperorsQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "Who was the first Roman Emperor?", answer: "Augustus", wrong: ["Julius Caesar","Nero","Caligula"] },
  { question: "Which emperor built Hadrian's Wall in Britain?", answer: "Hadrian", wrong: ["Trajan","Marcus Aurelius","Domitian"] },
  { question: "Which Chinese dynasty's first emperor unified China?", answer: "Qin Shi Huang", wrong: ["Han Gaozu","Tang Taizong","Kublai Khan"] },
  { question: "Which emperor converted the Roman Empire to Christianity?", answer: "Constantine the Great", wrong: ["Theodosius","Justinian","Diocletian"] },
  { question: "Who was the emperor during the Great Fire of Rome in 64 AD?", answer: "Nero", wrong: ["Caligula","Claudius","Vespasian"] },
  { question: "Which Byzantine emperor codified Roman law?", answer: "Justinian I", wrong: ["Constantine I","Heraclius","Basil II"] },
  { question: "Who was the greatest Mongol emperor?", answer: "Genghis Khan", wrong: ["Kublai Khan","Timur","Ögedei Khan"] },
  { question: "Which French emperor was exiled to Elba then Waterloo?", answer: "Napoleon Bonaparte", wrong: ["Louis XVI","Louis XIV","Charles X"] },
  { question: "Who was the last Chinese emperor?", answer: "Puyi", wrong: ["Guangxu","Tongzhi","Daoguang"] },
  { question: "Which Roman emperor was known as the Philosopher Emperor?", answer: "Marcus Aurelius", wrong: ["Hadrian","Trajan","Antoninus Pius"] },
  { question: "Which Mughal emperor built the Taj Mahal?", answer: "Shah Jahan", wrong: ["Akbar","Aurangzeb","Babur"] },
  { question: "Which emperor was known as the Sun King of France?", answer: "Louis XIV", wrong: ["Louis XVI","Napoleon","Francis I"] },
  { question: "Who was the Ottoman sultan who conquered Constantinople in 1453?", answer: "Mehmed II", wrong: ["Suleiman I","Selim I","Bayezid II"] },
  { question: "Which Roman emperor split the empire into East and West?", answer: "Diocletian", wrong: ["Constantine","Theodosius","Valerian"] },
  { question: "Who founded the Holy Roman Empire?", answer: "Charlemagne", wrong: ["Otto I","Frederick Barbarossa","Henry IV"] },
  { question: "Which Aztec emperor met Hernán Cortés?", answer: "Moctezuma II", wrong: ["Cuauhtémoc","Ahuitzotl","Itzcoatl"] },
  { question: "Which Roman emperor was famously mad and made his horse a consul?", answer: "Caligula", wrong: ["Nero","Commodus","Domitian"] },
  { question: "Which emperor ruled Japan during World War II?", answer: "Hirohito", wrong: ["Meiji","Taisho","Showa (same)"] },
  { question: "Which Russian emperor freed the serfs in 1861?", answer: "Alexander II", wrong: ["Alexander I","Nicholas I","Peter the Great"] },
  { question: "Who was the emperor during the fall of the Western Roman Empire?", answer: "Romulus Augustulus", wrong: ["Honorius","Valentinian III","Julius Nepos"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EmperorsQuizSettings): EmperorsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: EmperorsQuizState, action: EmperorsQuizAction): EmperorsQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: EmperorsQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
