import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CaribbeanQuizSettings { questions: "10" | "20" | "30"; }
export interface CaribbeanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CaribbeanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capital of Cuba?", choices: ["Santiago","Havana","Camaguey","Holguin"], correct: 1 },
  { question: "Capital of Jamaica?", choices: ["Montego Bay","Kingston","Spanish Town","Ocho Rios"], correct: 1 },
  { question: "Capital of Haiti?", choices: ["Port-au-Prince","Cap-Haitien","Gonaives","Jacmel"], correct: 0 },
  { question: "Capital of Dominican Republic?", choices: ["Santo Domingo","Santiago","La Vega","Puerto Plata"], correct: 0 },
  { question: "Capital of Bahamas?", choices: ["Freeport","Nassau","Marsh Harbour","Andros"], correct: 1 },
  { question: "Capital of Barbados?", choices: ["Speightstown","Bridgetown","Holetown","Oistins"], correct: 1 },
  { question: "Capital of Trinidad and Tobago?", choices: ["San Fernando","Port of Spain","Scarborough","Chaguanas"], correct: 1 },
  { question: "Capital of Puerto Rico?", choices: ["Ponce","San Juan","Mayaguez","Caguas"], correct: 1 },
  { question: "Capital of Saint Lucia?", choices: ["Castries","Vieux Fort","Soufriere","Gros Islet"], correct: 0 },
  { question: "Capital of Saint Vincent?", choices: ["Kingstown","Layou","Calliaqua","Mesopotamia"], correct: 0 },
  { question: "Capital of Grenada?", choices: ["Saint George's","Gouyave","Grenville","Sauteurs"], correct: 0 },
  { question: "Capital of Antigua and Barbuda?", choices: ["Codrington","St. John's","All Saints","Falmouth"], correct: 1 },
  { question: "Capital of Dominica?", choices: ["Roseau","Portsmouth","Marigot","Soufriere"], correct: 0 },
  { question: "Capital of Saint Kitts and Nevis?", choices: ["Charlestown","Basseterre","Sandy Point","Old Road"], correct: 1 },
  { question: "Largest Caribbean island by area?", choices: ["Hispaniola","Cuba","Jamaica","Puerto Rico"], correct: 1 },
  { question: "Hispaniola is shared by Haiti and?", choices: ["Cuba","Jamaica","Dominican Republic","Puerto Rico"], correct: 2 },
  { question: "Bob Marley was from which country?", choices: ["Trinidad","Jamaica","Barbados","Bahamas"], correct: 1 },
  { question: "Reggae originated in?", choices: ["Trinidad","Jamaica","Cuba","Haiti"], correct: 1 },
  { question: "Calypso music originated in?", choices: ["Trinidad","Jamaica","Cuba","Haiti"], correct: 0 },
  { question: "Caribbean Sea is bordered by which Central American country to the west?", choices: ["Honduras","Belize","Guatemala","Nicaragua"], correct: 1 },
  { question: "Cuba achieved independence from which country?", choices: ["UK","Spain","France","US"], correct: 1 },
  { question: "Haiti was colonized primarily by?", choices: ["Spain","France","Britain","Netherlands"], correct: 1 },
  { question: "Aruba, Curacao, Bonaire are part of?", choices: ["Dutch Caribbean","French Caribbean","British Caribbean","Spanish Caribbean"], correct: 0 },
  { question: "US territory besides Puerto Rico in the Caribbean?", choices: ["Bahamas","US Virgin Islands","Bermuda","Cayman Islands"], correct: 1 },
  { question: "Cayman Islands are a territory of?", choices: ["UK","France","US","Netherlands"], correct: 0 },
  { question: "Largest city in Cuba?", choices: ["Havana","Santiago","Camaguey","Holguin"], correct: 0 },
  { question: "The Bahamas were where Columbus first landed in?", choices: ["1492","1502","1487","1500"], correct: 0 },
  { question: "Capital of Cayman Islands?", choices: ["West Bay","George Town","Bodden Town","East End"], correct: 1 },
  { question: "Capital of Bermuda?", choices: ["Hamilton","St. George's","Somerset","Dockyard"], correct: 0 },
  { question: "Bermuda is technically in which ocean (not Caribbean)?", choices: ["Pacific","Atlantic","Indian","Arctic"], correct: 1 },
  { question: "Pirate hub of the 17th century?", choices: ["Port Royal","Havana","Santo Domingo","San Juan"], correct: 0 },
  { question: "Tortola is part of which territory?", choices: ["US Virgin Islands","British Virgin Islands","Cayman","Turks and Caicos"], correct: 1 },
  { question: "Capital of British Virgin Islands?", choices: ["Road Town","Spanish Town","East End","Anegada"], correct: 0 },
  { question: "Capital of US Virgin Islands?", choices: ["Christiansted","Charlotte Amalie","Frederiksted","Cruz Bay"], correct: 1 },
  { question: "Greater Antilles include Cuba, Hispaniola, Jamaica, and?", choices: ["Trinidad","Puerto Rico","Barbados","Aruba"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CaribbeanQuizSettings): CaribbeanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CaribbeanQuizState, action: CaribbeanQuizAction): CaribbeanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CaribbeanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
