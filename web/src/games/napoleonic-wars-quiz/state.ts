import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NapoleonicWarsQuizSettings { questions: "10" | "20" | "30"; }
export interface NapoleonicWarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NapoleonicWarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who was the French Emperor during the Napoleonic Wars?", choices: ["Louis XVI","Napoleon Bonaparte","Louis XVIII","Charles X"], correct: 1 },
  { question: "In what year did Napoleon become Emperor?", choices: ["1799","1801","1804","1812"], correct: 2 },
  { question: "At what battle was Napoleon decisively defeated in 1815?", choices: ["Leipzig","Austerlitz","Waterloo","Borodino"], correct: 2 },
  { question: "Who commanded the Anglo-allied army at Waterloo?", choices: ["Nelson","Wellington","Blucher","Pitt"], correct: 1 },
  { question: "Which Prussian general arrived to support at Waterloo?", choices: ["Bulow","Blucher","Gneisenau","Yorck"], correct: 1 },
  { question: "What naval battle in 1805 destroyed French/Spanish fleets?", choices: ["Trafalgar","Nile","Copenhagen","Navarino"], correct: 0 },
  { question: "Who was the British naval commander killed at Trafalgar?", choices: ["Hood","Nelson","Collingwood","Howe"], correct: 1 },
  { question: "What 1805 battle was Napoleon's masterpiece against Russia/Austria?", choices: ["Jena","Austerlitz","Wagram","Friedland"], correct: 1 },
  { question: "Napoleon's catastrophic invasion of which country was 1812?", choices: ["Spain","Russia","Prussia","Austria"], correct: 1 },
  { question: "What Russian general's strategy frustrated Napoleon in 1812?", choices: ["Kutuzov","Bagration","Barclay de Tolly","Tormasov"], correct: 0 },
  { question: "What battle outside Moscow in 1812?", choices: ["Smolensk","Borodino","Maloyaroslavets","Leipzig"], correct: 1 },
  { question: "What 1813 battle was called the Battle of the Nations?", choices: ["Leipzig","Dresden","Lutzen","Bautzen"], correct: 0 },
  { question: "To what island was Napoleon first exiled?", choices: ["St. Helena","Elba","Corsica","Sardinia"], correct: 1 },
  { question: "To what island was Napoleon finally exiled?", choices: ["St. Helena","Elba","Corsica","Madeira"], correct: 0 },
  { question: "How long was Napoleon's return known as?", choices: ["Hundred Days","Six Months","One Year","Three Years"], correct: 0 },
  { question: "What 1812 war was fought between US and Britain partly due to Napoleonic blockades?", choices: ["War of 1812","Anglo-American War","War of Independence","First Barbary War"], correct: 0 },
  { question: "What system did Napoleon impose to economically isolate Britain?", choices: ["Anti-Britain Pact","Continental System","Berlin Edict","Trade Embargo"], correct: 1 },
  { question: "What was Napoleon's birthplace?", choices: ["Paris","Marseille","Corsica","Sardinia"], correct: 2 },
  { question: "What was Napoleon's first wife's name?", choices: ["Josephine","Marie Louise","Marie Antoinette","Eugenie"], correct: 0 },
  { question: "What 1798 battle in Egypt did Napoleon win?", choices: ["Pyramids","Aboukir","Heliopolis","Alexandria"], correct: 0 },
  { question: "What naval defeat ended Napoleon's Egyptian campaign?", choices: ["Battle of the Nile","Trafalgar","Copenhagen","Aboukir Bay (Battle of the Nile)"], correct: 3 },
  { question: "What treaty in 1807 made Russia ally with France?", choices: ["Tilsit","Pressburg","Schonbrunn","Amiens"], correct: 0 },
  { question: "What 1806 victory crushed Prussia?", choices: ["Jena-Auerstedt","Austerlitz","Friedland","Eylau"], correct: 0 },
  { question: "What insurrection began in Spain against French rule in 1808?", choices: ["Peninsular War","Carlist War","Spanish Civil War","War of Succession"], correct: 0 },
  { question: "Who led the British in the Peninsular War?", choices: ["Wellington","Moore","Beresford","All commanded at times"], correct: 3 },
  { question: "What scientific expedition did Napoleon take with him to Egypt?", choices: ["Savants","Royal Society","Academy","Geographers"], correct: 0 },
  { question: "What stone discovered in Egypt led to deciphering hieroglyphics?", choices: ["Rosetta Stone","Pyramid Stone","Memphis Stone","Alexandria Stone"], correct: 0 },
  { question: "What's the name of Napoleon's legal code?", choices: ["Code Napoleon","Code Civile","Civil Code of France","All names used"], correct: 3 },
  { question: "What woman did Napoleon marry to ally with Austria?", choices: ["Marie Louise","Marie Antoinette","Eugenie","Louise"], correct: 0 },
  { question: "How did Napoleon die?", choices: ["Battle wound","Stomach cancer (likely)","Old age","Poisoning (theory)"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NapoleonicWarsQuizSettings): NapoleonicWarsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NapoleonicWarsQuizState, action: NapoleonicWarsQuizAction): NapoleonicWarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NapoleonicWarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
