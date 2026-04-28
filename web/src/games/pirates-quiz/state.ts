import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PiratesQuizSettings { questions: "10" | "20" | "30"; }
export interface PiratesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PiratesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Blackbeard's real name was?", choices: ["Edward Teach","Henry Morgan","Calico Jack","William Kidd"], correct: 0 },
  { question: "Blackbeard was killed in?", choices: ["1718","1728","1738","1748"], correct: 0 },
  { question: "Blackbeard's ship was called?", choices: ["Queen Anne's Revenge","Whydah","Adventure Galley","Royal Fortune"], correct: 0 },
  { question: "Anne Bonny sailed with?", choices: ["Calico Jack","Blackbeard","Kidd","Morgan"], correct: 0 },
  { question: "Mary Read was disguised as?", choices: ["A boy","A noble","A priest","A merchant"], correct: 0 },
  { question: "Calico Jack's full name was?", choices: ["John Rackham","John Smith","John Avery","John Steed"], correct: 0 },
  { question: "Henry Morgan was a famous?", choices: ["Welsh privateer","Spanish admiral","French explorer","Dutch merchant"], correct: 0 },
  { question: "William Kidd was hanged in?", choices: ["1701","1711","1721","1731"], correct: 0 },
  { question: "Bartholomew Roberts was nicknamed?", choices: ["Black Bart","Calico Jack","Blackbeard","Long John"], correct: 0 },
  { question: "Bartholomew Roberts captured how many ships?", choices: ["~50","~200","~400","~600"], correct: 2 },
  { question: "The Whydah Gally was captained by?", choices: ["Sam Bellamy","Blackbeard","Kidd","Morgan"], correct: 0 },
  { question: "Sam Bellamy was nicknamed?", choices: ["Black Sam","Calico","Long John","Captain Crunch"], correct: 0 },
  { question: "The Golden Age of Piracy was approximately?", choices: ["1500-1600","1650-1730","1750-1850","1850-1920"], correct: 1 },
  { question: "The Jolly Roger had what color background?", choices: ["Red","Black","White","Blue"], correct: 1 },
  { question: "A 'privateer' was?", choices: ["Government-licensed pirate","Bank robber","Slave trader","Smuggler"], correct: 0 },
  { question: "Tortuga was a pirate haven in?", choices: ["Caribbean","Pacific","Mediterranean","Indian Ocean"], correct: 0 },
  { question: "Port Royal (Jamaica) was destroyed by?", choices: ["Earthquake 1692","Fire 1691","Spanish raid","Hurricane"], correct: 0 },
  { question: "Edward Low was famous for?", choices: ["Cruelty","Mercy","Generosity","Trade"], correct: 0 },
  { question: "Stede Bonnet was nicknamed?", choices: ["The Gentleman Pirate","Black Beard","Long John","Captain Crunch"], correct: 0 },
  { question: "Charles Vane refused to attack a?", choices: ["French warship","British warship","Spanish ship","Dutch ship"], correct: 1 },
  { question: "The Barbary Pirates operated from?", choices: ["North Africa","Caribbean","Indian Ocean","SE Asia"], correct: 0 },
  { question: "Stop the Barbary Wars were waged by?", choices: ["UK","USA","France","Spain"], correct: 1 },
  { question: "The 1856 Declaration of Paris ended?", choices: ["Privateering","Piracy","Slavery","Trade"], correct: 0 },
  { question: "Olivier Levasseur left a famous?", choices: ["Treasure cipher","Coin","Map","Sword"], correct: 0 },
  { question: "Pirate Hawkins was?", choices: ["John Hawkins (Elizabethan)","Treasure Island fictional","Both","Neither"], correct: 2 },
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
