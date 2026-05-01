import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShipsQuizSettings { questions: "10" | "20" | "30"; }
export interface ShipsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShipsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was the most famous ship to sink in 1912?", choices: ["RMS Titanic", "RMS Lusitania", "HMS Hood", "USS Indianapolis"], correct: 0 },
  { question: "How many people died on the Titanic?", choices: ["About 1500", "About 800", "About 2000", "About 500"], correct: 0 },
  { question: "Who built the Titanic?", choices: ["Harland & Wolff", "Cunard", "White Star Line", "Cammell Laird"], correct: 0 },
  { question: "Where was Titanic built?", choices: ["Belfast", "Liverpool", "Glasgow", "Southampton"], correct: 0 },
  { question: "What ship was sunk by a German U-boat in 1915, helping draw US into WWI?", choices: ["RMS Lusitania", "HMS Hood", "Britannic", "Olympic"], correct: 0 },
  { question: "What is the largest aircraft carrier in service?", choices: ["USS Gerald R. Ford", "USS Nimitz", "USS Enterprise", "HMS Queen Elizabeth"], correct: 0 },
  { question: "What was the first nuclear-powered aircraft carrier?", choices: ["USS Enterprise (CVN-65)", "USS Nimitz", "USS Eisenhower", "USS Forrestal"], correct: 0 },
  { question: "What ship sank during WWII at Pearl Harbor in 1941?", choices: ["USS Arizona", "USS Missouri", "USS Iowa", "USS New Jersey"], correct: 0 },
  { question: "Where was the WWII Japanese surrender signed?", choices: ["USS Missouri", "USS Arizona", "USS Iowa", "USS Yorktown"], correct: 0 },
  { question: "The Spanish Armada was defeated in?", choices: ["1588", "1492", "1620", "1700"], correct: 0 },
  { question: "Who commanded the English fleet against the Armada?", choices: ["Lord Howard of Effingham", "Francis Drake", "John Hawkins", "Walter Raleigh"], correct: 0 },
  { question: "HMS Victory was the flagship of?", choices: ["Admiral Nelson", "Admiral Drake", "Admiral Rodney", "Admiral Anson"], correct: 0 },
  { question: "Battle of Trafalgar was fought in?", choices: ["1805", "1815", "1798", "1812"], correct: 0 },
  { question: "What was Magellan's flagship for circumnavigating Earth?", choices: ["Trinidad", "Victoria", "Concepcion", "San Antonio"], correct: 0 },
  { question: "What ship completed the first circumnavigation of the globe?", choices: ["Victoria (1522)", "Trinidad", "Santa Maria", "Endeavour"], correct: 0 },
  { question: "Captain Cook commanded which ship to discover Australia/Hawaii etc.?", choices: ["HMS Endeavour", "HMS Resolution", "HMS Discovery", "Both Endeavour and Resolution"], correct: 3 },
  { question: "The USS Constitution is nicknamed?", choices: ["Old Ironsides", "Big Mo", "The Mighty Mo", "Big Stick"], correct: 0 },
  { question: "Who designed the ironclad USS Monitor?", choices: ["John Ericsson", "Robert Fulton", "James Watt", "Isambard Brunel"], correct: 0 },
  { question: "The Battle of Hampton Roads in 1862 featured which two ironclads?", choices: ["Monitor vs Merrimack (Virginia)", "Monitor vs Constitution", "Merrimack vs Hartford", "Hartford vs Monitor"], correct: 0 },
  { question: "What is the world's oldest commissioned warship still afloat?", choices: ["USS Constitution", "HMS Victory (in dry dock)", "HMS Trincomalee", "USS Constellation"], correct: 0 },
  { question: "What sank the German battleship Bismarck?", choices: ["British Royal Navy fleet (May 1941)", "US Navy", "Soviet Navy", "Free French Navy"], correct: 0 },
  { question: "What is the largest cargo container ship class today?", choices: ["Ever Given-class/HMM Algeciras-class (~24,000 TEU)", "Triple-E", "Panamax", "Suezmax"], correct: 0 },
  { question: "Who invented the first steamboat in regular service?", choices: ["Robert Fulton (Clermont, 1807)", "James Watt", "John Fitch", "John Stevens"], correct: 0 },
  { question: "Cunard's RMS Queen Mary 2 entered service in?", choices: ["2004", "2000", "2008", "1998"], correct: 0 },
  { question: "What is a 'frigate' historically?", choices: ["A fast warship", "A passenger liner", "A cargo ship", "A fishing boat"], correct: 0 },
  { question: "What ship class is HMS Queen Elizabeth?", choices: ["Aircraft carrier", "Battleship", "Submarine", "Frigate"], correct: 0 },
  { question: "The 'Black Pearl' is a fictional ship from?", choices: ["Pirates of the Caribbean", "Treasure Island", "Master and Commander", "Moby Dick"], correct: 0 },
  { question: "The Mayflower carried Pilgrims to Plymouth in?", choices: ["1620", "1607", "1492", "1630"], correct: 0 },
  { question: "RMS stands for?", choices: ["Royal Mail Ship", "Royal Marine Ship", "Royal Maritime Ship", "Regulated Maritime Steamer"], correct: 0 },
  { question: "What is a 'Panamax' ship?", choices: ["Maximum size to fit through Panama Canal", "Maximum cargo capacity", "Built in Panama", "Owned by Panama"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ShipsQuizSettings): ShipsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShipsQuizState, action: ShipsQuizAction): ShipsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShipsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
