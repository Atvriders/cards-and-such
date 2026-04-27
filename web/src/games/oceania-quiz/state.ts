import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OceaniaQuizSettings { questions: "10" | "20" | "30"; }
export interface OceaniaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OceaniaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capital of Australia?", choices: ["Sydney","Melbourne","Canberra","Perth"], correct: 2 },
  { question: "Capital of New Zealand?", choices: ["Auckland","Wellington","Christchurch","Dunedin"], correct: 1 },
  { question: "Largest city in Australia?", choices: ["Melbourne","Sydney","Brisbane","Perth"], correct: 1 },
  { question: "Largest city in New Zealand?", choices: ["Wellington","Auckland","Christchurch","Hamilton"], correct: 1 },
  { question: "Capital of Fiji?", choices: ["Lautoka","Suva","Nadi","Labasa"], correct: 1 },
  { question: "Capital of Papua New Guinea?", choices: ["Lae","Madang","Port Moresby","Mount Hagen"], correct: 2 },
  { question: "Capital of Samoa?", choices: ["Apia","Salelologa","Pago Pago","Vailima"], correct: 0 },
  { question: "Capital of Tonga?", choices: ["Vava'u","Nuku'alofa","Eua","Niuatoputapu"], correct: 1 },
  { question: "Capital of Vanuatu?", choices: ["Luganville","Port Vila","Norsup","Lakatoro"], correct: 1 },
  { question: "Capital of Solomon Islands?", choices: ["Auki","Honiara","Gizo","Kirakira"], correct: 1 },
  { question: "Capital of Tuvalu?", choices: ["Funafuti","Vaiaku","Niulakita","Nui"], correct: 0 },
  { question: "Capital of Kiribati?", choices: ["Bikenibeu","Tarawa","Bairiki","Bonriki"], correct: 1 },
  { question: "Capital of Nauru?", choices: ["Nauru has no official capital","Yaren","Aiwo","Anabar"], correct: 0 },
  { question: "Capital of Palau?", choices: ["Koror","Ngerulmud","Melekeok","Airai"], correct: 1 },
  { question: "Capital of Micronesia (FSM)?", choices: ["Weno","Palikir","Kolonia","Tofol"], correct: 1 },
  { question: "Capital of Marshall Islands?", choices: ["Ebeye","Majuro","Jaluit","Wotje"], correct: 1 },
  { question: "Largest island in Oceania?", choices: ["Tasmania","New Guinea","South Island","North Island"], correct: 1 },
  { question: "Australia's longest river?", choices: ["Darling","Murray","Murrumbidgee","Yarra"], correct: 1 },
  { question: "Australia's highest mountain?", choices: ["Mt. Kosciuszko","Mt. Bogong","Mt. Ossa","Mt. Townsend"], correct: 0 },
  { question: "New Zealand's highest peak?", choices: ["Mt. Tasman","Aoraki/Mt. Cook","Mt. Aspiring","Mt. Sefton"], correct: 1 },
  { question: "Great Barrier Reef is off which Australian state?", choices: ["NSW","Victoria","Queensland","WA"], correct: 2 },
  { question: "Uluru is in which Australian state/territory?", choices: ["WA","NT","SA","QLD"], correct: 1 },
  { question: "Tasmania is south of which mainland city?", choices: ["Sydney","Adelaide","Melbourne","Perth"], correct: 2 },
  { question: "Which sea separates Australia and New Zealand?", choices: ["Coral Sea","Tasman Sea","Bass Strait","Arafura Sea"], correct: 1 },
  { question: "Cook Strait separates which islands?", choices: ["Tasmania and mainland","North and South Islands","Stewart and South","Three Kings"], correct: 1 },
  { question: "Australia's largest state by area?", choices: ["Queensland","NT","Western Australia","NSW"], correct: 2 },
  { question: "What's the capital of Western Australia?", choices: ["Perth","Fremantle","Bunbury","Albany"], correct: 0 },
  { question: "What is Australia's largest desert?", choices: ["Simpson","Tanami","Great Victoria","Gibson"], correct: 2 },
  { question: "Bora Bora is in which territory?", choices: ["Cook Islands","French Polynesia","Niue","Tokelau"], correct: 1 },
  { question: "New Caledonia is administered by?", choices: ["UK","Australia","France","NZ"], correct: 2 },
  { question: "Easter Island lies far east in Oceania, governed by?", choices: ["Chile","Peru","France","NZ"], correct: 0 },
  { question: "Capital of French Polynesia?", choices: ["Bora Bora","Papeete","Moorea","Raiatea"], correct: 1 },
  { question: "Maori language is from?", choices: ["Australia","New Zealand","Samoa","Fiji"], correct: 1 },
  { question: "Sydney's iconic structure is the?", choices: ["Eureka Tower","Opera House","Westgate Bridge","Harbour Tower"], correct: 1 },
  { question: "Tasman Sea borders Australia and?", choices: ["New Zealand","PNG","Indonesia","Fiji"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OceaniaQuizSettings): OceaniaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OceaniaQuizState, action: OceaniaQuizAction): OceaniaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OceaniaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
