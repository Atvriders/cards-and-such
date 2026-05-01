import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldRiversQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldRiversQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldRiversQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the longest river in the world?", choices: ["Amazon","Nile","Yangtze","Mississippi"], correct: 1 },
  { question: "What is the largest river in the world by discharge volume?", choices: ["Nile","Amazon","Yangtze","Congo"], correct: 1 },
  { question: "On which river is the city of Cairo located?", choices: ["Tigris","Euphrates","Nile","Jordan"], correct: 2 },
  { question: "What river forms part of the U.S.-Mexico border?", choices: ["Colorado","Rio Grande","Sacramento","Gila"], correct: 1 },
  { question: "What is the longest river in Europe?", choices: ["Danube","Rhine","Volga","Dnieper"], correct: 2 },
  { question: "What river flows through London?", choices: ["Severn","Mersey","Thames","Tyne"], correct: 2 },
  { question: "What river runs through Paris?", choices: ["Loire","Rhone","Seine","Garonne"], correct: 2 },
  { question: "What river is sacred in Hinduism?", choices: ["Indus","Ganges","Brahmaputra","Yamuna"], correct: 1 },
  { question: "What two rivers form Mesopotamia?", choices: ["Nile and Jordan","Tigris and Euphrates","Indus and Ganges","Yangtze and Yellow"], correct: 1 },
  { question: "What is the longest river in China?", choices: ["Yellow","Yangtze","Pearl","Mekong"], correct: 1 },
  { question: "What river forms Niagara Falls?", choices: ["St. Lawrence","Niagara","Ohio","Hudson"], correct: 1 },
  { question: "What is the longest river in South America?", choices: ["Parana","Amazon","Orinoco","Madeira"], correct: 1 },
  { question: "What river runs through Vienna and Budapest?", choices: ["Rhine","Danube","Elbe","Oder"], correct: 1 },
  { question: "What river flows through Baghdad?", choices: ["Euphrates","Tigris","Karun","Jordan"], correct: 1 },
  { question: "What is the longest river in Africa, second only to the Nile by some measures?", choices: ["Niger","Congo","Zambezi","Limpopo"], correct: 1 },
  { question: "What river has the largest drainage basin in the world?", choices: ["Amazon","Nile","Mississippi","Yangtze"], correct: 0 },
  { question: "What is the longest river entirely in Russia?", choices: ["Ob","Lena","Volga","Yenisei"], correct: 2 },
  { question: "What river flows through New York City?", choices: ["Delaware","Hudson","Susquehanna","Connecticut"], correct: 1 },
  { question: "What is the second longest river in the U.S.?", choices: ["Mississippi","Missouri","Ohio","Rio Grande"], correct: 1 },
  { question: "What river forms much of the Brazil-Paraguay border?", choices: ["Amazon","Parana","Madeira","Sao Francisco"], correct: 1 },
  { question: "What river is famous for its delta in Bangladesh and India?", choices: ["Indus","Ganges-Brahmaputra","Mekong","Irrawaddy"], correct: 1 },
  { question: "On which river is the Three Gorges Dam?", choices: ["Yellow","Yangtze","Mekong","Pearl"], correct: 1 },
  { question: "Which river flows from Lake Victoria to the Mediterranean?", choices: ["Niger","Congo","Nile","Zambezi"], correct: 2 },
  { question: "What is the chief river of Egypt's heart?", choices: ["Tigris","Nile","Euphrates","Jordan"], correct: 1 },
  { question: "What river is associated with Cleopatra and ancient Egypt?", choices: ["Tigris","Nile","Jordan","Tigris"], correct: 1 },
  { question: "What river runs through Rome?", choices: ["Po","Tiber","Arno","Adige"], correct: 1 },
  { question: "What river runs through Florence?", choices: ["Po","Tiber","Arno","Adige"], correct: 2 },
  { question: "What river forms a famous gorge in Arizona, the Grand Canyon?", choices: ["Colorado","Snake","Green","Gila"], correct: 0 },
  { question: "What river runs through Vienna?", choices: ["Rhine","Danube","Elbe","Inn"], correct: 1 },
  { question: "What's the longest river in Australia?", choices: ["Murray","Darling","Murrumbidgee","Cooper Creek"], correct: 0 },
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
