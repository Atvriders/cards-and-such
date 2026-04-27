import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface AustraliaCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AustraliaCultureQuizSettings { questions: "10" | "20"; }
export interface AustraliaCultureQuizState { questions: AustraliaCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AustraliaCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: AustraliaCultureQuizQuestion[] = [
  { question: "What is the capital of Australia?", choices: ["Sydney","Melbourne","Canberra","Brisbane"], correct: 2 },
  { question: "Australia's biggest city by population is?", choices: ["Sydney","Melbourne","Brisbane","Perth"], correct: 0 },
  { question: "Which is a marsupial?", choices: ["Dingo","Kangaroo","Emu","Echidna"], correct: 1 },
  { question: "The Sydney Opera House was completed in?", choices: ["1959","1973","1985","1992"], correct: 1 },
  { question: "Uluru is also known as?", choices: ["Ayers Rock","Kakadu","Bondi","Daintree"], correct: 0 },
  { question: "Aboriginal art is famous for which technique?", choices: ["Mosaic","Dot painting","Stained glass","Fresco"], correct: 1 },
  { question: "Australia's national day is?", choices: ["Jan 1","Jan 26","Apr 25","Dec 26"], correct: 1 },
  { question: "ANZAC Day commemorates?", choices: ["Gallipoli landing","Federation","Cook arrival","D-Day"], correct: 0 },
  { question: "AFL stands for Australian?", choices: ["Football League","Footy League","Field League","Friendly League"], correct: 0 },
  { question: "Vegemite is a spread made from?", choices: ["Honey","Yeast extract","Avocado","Olive oil"], correct: 1 },
  { question: "The Great Barrier Reef is off the coast of?", choices: ["NSW","Queensland","WA","Victoria"], correct: 1 },
  { question: "Australia's currency is?", choices: ["Pound","Dollar","Euro","Peso"], correct: 1 },
  { question: "Captain Cook arrived in?", choices: ["1606","1770","1788","1803"], correct: 1 },
  { question: "Australia federated in?", choices: ["1788","1851","1901","1945"], correct: 2 },
  { question: "Which animal is on the coat of arms with the kangaroo?", choices: ["Koala","Emu","Wombat","Platypus"], correct: 1 },
  { question: "Outback refers to?", choices: ["Coastal cities","Inland remote regions","Northern rainforest","Antarctic territory"], correct: 1 },
  { question: "Crocodile Dundee starred?", choices: ["Mel Gibson","Hugh Jackman","Paul Hogan","Russell Crowe"], correct: 2 },
  { question: "Which is an Indigenous Australian language?", choices: ["Maori","Pitjantjatjara","Quechua","Hawaiian"], correct: 1 },
  { question: "Australia's largest state by area is?", choices: ["NSW","Queensland","Western Australia","Victoria"], correct: 2 },
  { question: "The Tasmanian Devil is a?", choices: ["Bird","Reptile","Marsupial","Amphibian"], correct: 2 },
  { question: "Bondi Beach is in?", choices: ["Sydney","Melbourne","Brisbane","Perth"], correct: 0 },
  { question: "Australia's national rugby team is the?", choices: ["All Blacks","Wallabies","Springboks","Pumas"], correct: 1 },
  { question: "Which famous reef is the world's largest?", choices: ["Belize","Great Barrier","New Caledonia","Red Sea"], correct: 1 },
  { question: "The Dreamtime belongs to which culture?", choices: ["Maori","Aboriginal","Polynesian","Aztec"], correct: 1 },
  { question: "Australia's PM as of 2020 was?", choices: ["Turnbull","Abbott","Morrison","Albanese"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AustraliaCultureQuizSettings): AustraliaCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AustraliaCultureQuizState, action: AustraliaCultureQuizAction): AustraliaCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AustraliaCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
