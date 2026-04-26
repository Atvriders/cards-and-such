import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface VikingsQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface VikingsQuizState { settings: VikingsQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type VikingsQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "What was the Viking parliament called?", answer: "Thing (Ting)", wrong: ["Althing","Sagas","Longhouse"] },
  { question: "What type of ship did Vikings use for raids?", answer: "Longship", wrong: ["Cog","Carrack","Knarr"] },
  { question: "Who was the Norse god of thunder?", answer: "Thor", wrong: ["Odin","Loki","Tyr"] },
  { question: "What was the Norse afterlife for warriors called?", answer: "Valhalla", wrong: ["Asgard","Midgard","Hel"] },
  { question: "Which Viking explorer reached North America first?", answer: "Leif Erikson", wrong: ["Eric the Red","Harald Hardrada","Ragnar Lothbrok"] },
  { question: "What was the Viking writing system called?", answer: "Runes", wrong: ["Futhark alphabet","Norse script","Ogham"] },
  { question: "What was Odin's role in Norse mythology?", answer: "Allfather / chief god", wrong: ["God of thunder","God of war","God of sea"] },
  { question: "Where was the first Viking settlement in North America?", answer: "L'Anse aux Meadows", wrong: ["Newfoundland Bay","Vinland Bay","Greenland North"] },
  { question: "What did Vikings call North America?", answer: "Vinland", wrong: ["Markland","Helluland","Greenaland"] },
  { question: "What material were Viking shields typically made from?", answer: "Wood", wrong: ["Iron","Bronze","Leather"] },
  { question: "Which country did Eric the Red explore and settle?", answer: "Greenland", wrong: ["Iceland","Norway","Faroe Islands"] },
  { question: "What was the name of Odin's ravens?", answer: "Huginn and Muninn", wrong: ["Ratatoskr and Níðhöggr","Geri and Freki","Sleipnir and Fenrir"] },
  { question: "What was the great tree at the center of Norse cosmology?", answer: "Yggdrasil", wrong: ["Asgard","Bifrost","Jotunheim"] },
  { question: "Which Norse god was associated with mischief?", answer: "Loki", wrong: ["Odin","Baldr","Freyr"] },
  { question: "What were Viking sagas?", answer: "Oral and written stories", wrong: ["Religious hymns","Legal codes","Battle chants"] },
  { question: "What did Vikings call their law assemblies?", answer: "Thing", wrong: ["Ting","Moot","Council"] },
  { question: "What weapons were most commonly used by Vikings?", answer: "Axes and swords", wrong: ["Spears and bows","Clubs and maces","Pikes and halberds"] },
  { question: "What year did Vikings raid Lindisfarne monastery?", answer: "793 AD", wrong: ["865 AD","1066 AD","700 AD"] },
  { question: "What was the home of the Norse gods?", answer: "Asgard", wrong: ["Midgard","Valhalla","Jotunheim"] },
  { question: "What did the Valkyries do?", answer: "Choose slain warriors for Valhalla", wrong: ["Guide ships at sea","Forge weapons","Predict the future"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VikingsQuizSettings): VikingsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: VikingsQuizState, action: VikingsQuizAction): VikingsQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: VikingsQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
