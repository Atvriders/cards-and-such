import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VikingQuizSettings { questions: "10" | "20" | "30"; }
export interface VikingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VikingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "From what region did Vikings originate?", choices: ["Scandinavia","Iberia","British Isles","Central Europe"], correct: 0 },
  { question: "What were the three main Viking homelands?", choices: ["Norway, Sweden, Denmark","Iceland, Norway, Sweden","Denmark, Iceland, Norway","Norway only"], correct: 0 },
  { question: "What was the typical Viking longship feature?", choices: ["Long, shallow draft, dragon prow","Tall mast","Iron hull","Steam"], correct: 0 },
  { question: "In what year did Vikings raid Lindisfarne?", choices: ["793","843","911","1066"], correct: 0 },
  { question: "What Viking explored Newfoundland around 1000 AD?", choices: ["Leif Erikson","Erik the Red","Bjorn Ironside","Ragnar"], correct: 0 },
  { question: "What did Vikings call North America?", choices: ["Vinland","Greenland","Markland","Both Vinland and Markland used"], correct: 3 },
  { question: "What land did Erik the Red colonize?", choices: ["Greenland","Iceland","Newfoundland","Faroe Islands"], correct: 0 },
  { question: "What was the Norse pantheon's chief god?", choices: ["Odin","Thor","Loki","Freyr"], correct: 0 },
  { question: "What was the Norse god of thunder?", choices: ["Thor","Odin","Loki","Tyr"], correct: 0 },
  { question: "What Norse afterlife is for warriors?", choices: ["Valhalla","Helheim","Asgard","Folkvangr"], correct: 0 },
  { question: "Who chose slain warriors for Valhalla?", choices: ["Valkyries","Norns","Disir","Aesir"], correct: 0 },
  { question: "What was the Norse end-of-world prophesied event?", choices: ["Ragnarok","Yggdrasil","Midgard","Bifrost"], correct: 0 },
  { question: "What was the Viking writing system?", choices: ["Runes","Cyrillic","Latin","Hieroglyphs"], correct: 0 },
  { question: "What kingdom in England was overrun by Vikings 9th century?", choices: ["Northumbria","Wessex","Mercia","All raided"], correct: 3 },
  { question: "Who fought back against Vikings successfully in England?", choices: ["Alfred the Great","Athelstan","Edward","All of them"], correct: 3 },
  { question: "What 1066 battle did Vikings (Norwegians) lose?", choices: ["Stamford Bridge","Hastings","Hastings","Senlac"], correct: 0 },
  { question: "Who was the Norwegian king at Stamford Bridge?", choices: ["Harald Hardrada","Harold Godwinson","Cnut","Olaf"], correct: 0 },
  { question: "Who became the first Norman king of England in 1066?", choices: ["William the Conqueror","Harold Godwinson","Cnut","Edward"], correct: 0 },
  { question: "What were Viking explorers of rivers in Russia called?", choices: ["Varangians","Rus","Both","Vikings only"], correct: 2 },
  { question: "What major medieval city was founded with Viking heritage in Russia?", choices: ["Kyiv (Kievan Rus founded by Varangians per legend)","Moscow","Novgorod founded by Vikings","Both Kyiv and Novgorod"], correct: 3 },
  { question: "What is a Viking burial ship called when buried with the dead?", choices: ["Ship burial","Pyre","Cairn","Mound"], correct: 0 },
  { question: "What was a famous Viking ship burial site in Norway?", choices: ["Oseberg","Gokstad","Both","Tune"], correct: 2 },
  { question: "What Norse weapon was iconic?", choices: ["Sword and battle-axe","Spear","Bow","All used"], correct: 3 },
  { question: "What's a berserker?", choices: ["Frenzied Viking warrior","Religious leader","Peaceful farmer","Trader"], correct: 0 },
  { question: "What was the Norse council/assembly called?", choices: ["Thing","Althing","Both","Wapentake"], correct: 2 },
  { question: "What famous Viking hairdo and culture-detail myth is FALSE?", choices: ["They wore horned helmets","They had longships","They explored","They had runes"], correct: 0 },
  { question: "What was Yggdrasil?", choices: ["World tree","Sea serpent","Sword","Magic ring"], correct: 0 },
  { question: "What Viking saga is famous from Iceland?", choices: ["Njal's Saga, Egil's Saga, etc.","The Iliad","Beowulf","Volsung Saga"], correct: 0 },
  { question: "Who is Loki in Norse myth?", choices: ["Trickster god","God of war","God of sea","God of dawn"], correct: 0 },
  { question: "In what year did the Viking Age conventionally end?", choices: ["1066","1100","911","1014"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VikingQuizSettings): VikingQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VikingQuizState, action: VikingQuizAction): VikingQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VikingQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
