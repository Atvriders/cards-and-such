import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldRiversQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldRiversQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldRiversQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Longest river in the world?", choices: ["Amazon","Nile","Yangtze","Mississippi"], correct: 1 },
  { question: "Longest river in South America (most volume of any river)?", choices: ["Amazon","Orinoco","Parana","Madeira"], correct: 0 },
  { question: "Which river runs through Cairo?", choices: ["Tigris","Nile","Euphrates","Jordan"], correct: 1 },
  { question: "Which river runs through London?", choices: ["Severn","Thames","Trent","Mersey"], correct: 1 },
  { question: "Which river runs through Paris?", choices: ["Loire","Seine","Rhone","Garonne"], correct: 1 },
  { question: "Which river runs through Vienna and Budapest?", choices: ["Rhine","Danube","Elbe","Oder"], correct: 1 },
  { question: "Which river runs through Berlin?", choices: ["Spree","Rhine","Elbe","Main"], correct: 0 },
  { question: "Which river forms the Germany-France border?", choices: ["Rhine","Elbe","Danube","Seine"], correct: 0 },
  { question: "Yangtze River is in?", choices: ["Russia","India","China","Vietnam"], correct: 2 },
  { question: "Yellow River (Huang He) is in?", choices: ["Korea","Japan","China","Mongolia"], correct: 2 },
  { question: "Ganges River is sacred in?", choices: ["China","India","Pakistan","Nepal"], correct: 1 },
  { question: "Mekong runs through how many countries?", choices: ["3","4","5","6"], correct: 3 },
  { question: "Volga is the longest river in?", choices: ["Russia (Europe)","Ukraine","Belarus","Kazakhstan"], correct: 0 },
  { question: "Mississippi-Missouri system is the longest in?", choices: ["Canada","USA","Mexico","Brazil"], correct: 1 },
  { question: "Niagara Falls is on which river?", choices: ["St. Lawrence","Niagara","Detroit","Hudson"], correct: 1 },
  { question: "Which river carved the Grand Canyon?", choices: ["Snake","Rio Grande","Colorado","Sacramento"], correct: 2 },
  { question: "Tigris-Euphrates rivers run mainly through?", choices: ["Iran","Iraq","Syria","Saudi Arabia"], correct: 1 },
  { question: "Murray River is the longest in?", choices: ["NZ","Australia","PNG","Tasmania"], correct: 1 },
  { question: "Rio Grande forms part of the border between?", choices: ["US-Canada","US-Mexico","Mexico-Guatemala","US-Cuba"], correct: 1 },
  { question: "Po River runs through which country?", choices: ["Spain","Italy","Greece","Portugal"], correct: 1 },
  { question: "Tagus River reaches the sea at?", choices: ["Madrid","Lisbon","Porto","Seville"], correct: 1 },
  { question: "Amazon's mouth is in?", choices: ["Peru","Colombia","Brazil","Venezuela"], correct: 2 },
  { question: "Largest drainage basin in the world?", choices: ["Nile","Amazon","Congo","Mississippi"], correct: 1 },
  { question: "Mississippi empties into?", choices: ["Atlantic","Gulf of Mexico","Pacific","Caribbean"], correct: 1 },
  { question: "Volga empties into?", choices: ["Black Sea","Caspian Sea","Aral Sea","Baltic"], correct: 1 },
  { question: "Nile empties into?", choices: ["Red Sea","Mediterranean","Persian Gulf","Indian Ocean"], correct: 1 },
  { question: "Yangtze empties into?", choices: ["South China Sea","East China Sea","Yellow Sea","Sea of Japan"], correct: 1 },
  { question: "Congo River runs through?", choices: ["West Africa","Central Africa","East Africa","North Africa"], correct: 1 },
  { question: "Zambezi forms which famous waterfall?", choices: ["Niagara","Iguazu","Victoria","Angel"], correct: 2 },
  { question: "Iguazu Falls is between Argentina and?", choices: ["Uruguay","Brazil","Bolivia","Paraguay"], correct: 1 },
  { question: "Yenisei River is in?", choices: ["Mongolia","Russia","China","Kazakhstan"], correct: 1 },
  { question: "Irrawaddy River is in?", choices: ["Thailand","Vietnam","Myanmar","Cambodia"], correct: 2 },
  { question: "Indus River runs through?", choices: ["India only","Pakistan and India","Pakistan only","Bangladesh"], correct: 1 },
  { question: "Mackenzie River is in?", choices: ["USA","Canada","Russia","Argentina"], correct: 1 },
  { question: "Loire is the longest river in?", choices: ["Spain","France","Germany","UK"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldRiversQuizSettings): WorldRiversQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldRiversQuizState, action: WorldRiversQuizAction): WorldRiversQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldRiversQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
