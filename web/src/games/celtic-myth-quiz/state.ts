import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CelticMythQuizSettings { questions: "10" | "20" | "30"; }
export interface CelticMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CelticMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What people primarily had Celtic mythology?", choices: ["Celts of Ireland, Scotland, Wales, Brittany","Just Irish","Both","Just Welsh"], correct: 2 },
  { question: "What's a Banshee?", choices: ["Wailing female spirit foretelling death","Just female","Both","Just spirit"], correct: 2 },
  { question: "What's a Leprechaun?", choices: ["Irish fairy associated with shoes","Just small fairy","Both","Just Irish"], correct: 2 },
  { question: "What's a Selkie?", choices: ["Seal-shapeshifter","Just seal","Both","Sea creature"], correct: 2 },
  { question: "What's the Tuatha De Danann?", choices: ["Irish mythological race of gods/people","Just gods","Both","Just race"], correct: 2 },
  { question: "Who's the Celtic god of light and skill?", choices: ["Lugh","Dagda","Brigid","Cernunnos"], correct: 0 },
  { question: "Who's the horned Celtic god?", choices: ["Cernunnos","Lugh","Dagda","Brigid"], correct: 0 },
  { question: "Who's the Celtic mother/healing goddess?", choices: ["Brigid","Danu","Both important","Morrigan"], correct: 2 },
  { question: "Who's the war goddess (often a crow)?", choices: ["Morrigan","Brigid","Danu","Lugh"], correct: 0 },
  { question: "What's the Cauldron of the Dagda?", choices: ["Magical pot of plenty","Just cauldron","Both","Bottomless"], correct: 2 },
  { question: "Who's the Welsh sea god?", choices: ["Manawydan or Lir's son Manannan","Just Manannan","Both","Just Welsh"], correct: 2 },
  { question: "What's the Irish epic about Cu Chulainn?", choices: ["Tain Bo Cuailnge","Mabinogion","Both Irish/Welsh","Just Tain"], correct: 0 },
  { question: "What's the Welsh medieval myth collection?", choices: ["The Mabinogion","Just stories","Both","Welsh tales"], correct: 2 },
  { question: "Who's Cu Chulainn?", choices: ["Irish hero","Welsh hero","Both","Just Irish"], correct: 0 },
  { question: "What's the spear of Lugh?", choices: ["One of the four treasures of Tuatha","Just spear","Both","Magical"], correct: 2 },
  { question: "What are the four treasures of the Tuatha De Danann?", choices: ["Cauldron, Spear, Stone, Sword","Just four objects","Both","Magical items"], correct: 2 },
  { question: "What's Samhain?", choices: ["Celtic festival, Halloween origin","Winter","Both","Just festival"], correct: 2 },
  { question: "What's Beltane?", choices: ["Celtic May Day festival","Just May","Both","Spring"], correct: 2 },
  { question: "What's Imbolc?", choices: ["Early February festival, Brigid","Just February","Both","Spring"], correct: 2 },
  { question: "What's Lughnasadh?", choices: ["August festival of Lugh","Harvest","Both","Just August"], correct: 2 },
  { question: "What's a Druid?", choices: ["Celtic priest/wise person","Just priest","Both","Just druid"], correct: 2 },
  { question: "What plant was sacred to Druids?", choices: ["Mistletoe and oak","Just oak","Both","Just mistletoe"], correct: 2 },
  { question: "Who's Arthur in Celtic-British myth?", choices: ["Legendary king","Just king","Both","Real and myth"], correct: 2 },
  { question: "What's Excalibur?", choices: ["King Arthur's sword","Just sword","Both","Magic"], correct: 2 },
  { question: "Who's the Lady of the Lake?", choices: ["Gives Arthur Excalibur","Just lake","Both","Magic"], correct: 2 },
  { question: "What's the Holy Grail in Celtic-Christian myth?", choices: ["Sacred cup of Christ","Just cup","Both","Magic"], correct: 2 },
  { question: "Who's Merlin?", choices: ["Wizard advisor to Arthur","Just wizard","Both","King"], correct: 2 },
  { question: "What's a faerie circle?", choices: ["Mushroom ring associated with fairies","Just mushroom","Both","Just circle"], correct: 2 },
  { question: "What's a Pooka (Puca)?", choices: ["Shape-shifting Irish trickster","Just animal","Both","Just trickster"], correct: 2 },
  { question: "What's the Otherworld?", choices: ["Celtic afterlife/realm","Heaven","Both","Just realm"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CelticMythQuizSettings): CelticMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CelticMythQuizState, action: CelticMythQuizAction): CelticMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CelticMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
