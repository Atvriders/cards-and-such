import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PiratesQuizSettings { questions: "10" | "20" | "30"; }
export interface PiratesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PiratesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Blackbeard's real name was?", choices: ["Edward Teach","Henry Morgan","Calico Jack","William Kidd"], correct: 0 },
  { question: "Blackbeard was killed in?", choices: ["1718","1728","1738","1748"], correct: 0 },
  { question: "Blackbeard's flagship was?", choices: ["Queen Anne's Revenge","Whydah","Adventure Galley","Royal Fortune"], correct: 0 },
  { question: "Anne Bonny sailed with?", choices: ["Calico Jack Rackham","Blackbeard","Kidd","Morgan"], correct: 0 },
  { question: "Mary Read disguised herself as?", choices: ["A man","A noblewoman","A monk","A child"], correct: 0 },
  { question: "Captain Kidd was hanged in?", choices: ["1701","1718","1722","1690"], correct: 0 },
  { question: "Henry Morgan was a privateer for?", choices: ["England","France","Spain","Portugal"], correct: 0 },
  { question: "Henry Morgan later became?", choices: ["Lt. Governor of Jamaica","King of Tortuga","Pirate of NC","Governor of Cuba"], correct: 0 },
  { question: "Bartholomew Roberts was also called?", choices: ["Black Bart","Calico Jack","Long John","Captain Flint"], correct: 0 },
  { question: "The Jolly Roger is the pirates'?", choices: ["Flag","Ship","Tavern","Code"], correct: 0 },
  { question: "'Pieces of eight' refers to a?", choices: ["Spanish silver dollar","Gold doubloon","English pound","French franc"], correct: 0 },
  { question: "Edward Low was known for?", choices: ["Cruelty","Generosity","Mapmaking","Cooking"], correct: 0 },
  { question: "The Whydah Gally sank off?", choices: ["Cape Cod","Florida Keys","Outer Banks","Bermuda"], correct: 0 },
  { question: "The Golden Age of Piracy peaked roughly?", choices: ["1690s-1720s","1500s","1800s","1600 only"], correct: 0 },
  { question: "Tortuga was a pirate haven near?", choices: ["Hispaniola","Cuba","Jamaica","Bermuda"], correct: 0 },
  { question: "Port Royal in Jamaica sank in an earthquake in?", choices: ["1692","1700","1750","1666"], correct: 0 },
  { question: "Stede Bonnet was known as?", choices: ["The Gentleman Pirate","The Mad Captain","Bloody Bonnet","Long Tom"], correct: 0 },
  { question: "Charles Vane was a contemporary of?", choices: ["Drake","Morgan","Kidd","Blackbeard"], correct: 3 },
  { question: "Sir Francis Drake circumnavigated the globe by?", choices: ["1580","1520","1620","1700"], correct: 0 },
  { question: "Drake's ship was the?", choices: ["Golden Hind","Mayflower","Santa Maria","Endeavour"], correct: 0 },
  { question: "Edward 'Ned' Low was active in the?", choices: ["1720s","1660s","1820s","1500s"], correct: 0 },
  { question: "Calico Jack's flag featured?", choices: ["Skull and crossed swords","Hourglass","Skeleton","Heart"], correct: 0 },
  { question: "Pirates of the Caribbean stories often base lore on the?", choices: ["Golden Age of Piracy","Vikings","Roman navy","WWI"], correct: 0 },
  { question: "'Walking the plank' is mostly?", choices: ["A myth/exaggeration","A daily practice","A legal punishment","A naval drill"], correct: 0 },
  { question: "A buccaneer originally referred to a?", choices: ["Hispaniola hunter","English noble","Dutch sailor","Spanish soldier"], correct: 0 },
  { question: "Treasure Island was written by?", choices: ["Robert Louis Stevenson","Daniel Defoe","Mark Twain","Jules Verne"], correct: 0 },
  { question: "Long John Silver appears in?", choices: ["Treasure Island","Moby Dick","Robinson Crusoe","Kidnapped"], correct: 0 },
  { question: "A 'letter of marque' authorized?", choices: ["Privateering","Marriage at sea","Trade","Citizenship"], correct: 0 },
  { question: "Madagascar was a famous pirate base for?", choices: ["Indian Ocean piracy","Caribbean piracy","Mediterranean piracy","Pacific piracy"], correct: 0 },
  { question: "The pirate code was?", choices: ["Articles agreed by the crew","Royal law","Naval code","Smuggler's law"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PiratesQuizSettings): PiratesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PiratesQuizState, action: PiratesQuizAction): PiratesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PiratesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
