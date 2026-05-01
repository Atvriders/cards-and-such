import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DesertQuizSettings { questions: "10" | "20"; }
export interface DesertQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DesertQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest hot desert in the world?", choices: ["Gobi","Kalahari","Sahara","Arabian"], correct: 2 },
  { question: "What is the largest desert overall (including cold deserts)?", choices: ["Sahara","Antarctica","Arctic","Gobi"], correct: 1 },
  { question: "In which country is the Atacama Desert?", choices: ["Peru","Chile","Bolivia","Argentina"], correct: 1 },
  { question: "What is the driest non-polar desert?", choices: ["Sahara","Atacama","Gobi","Namib"], correct: 1 },
  { question: "The Gobi Desert spans which two countries?", choices: ["China and Russia","China and Mongolia","Mongolia and Kazakhstan","India and Pakistan"], correct: 1 },
  { question: "In which country is the Mojave Desert?", choices: ["Mexico","USA","Argentina","Chile"], correct: 1 },
  { question: "What desert is famous for the Empty Quarter (Rub al Khali)?", choices: ["Sahara","Arabian","Thar","Kalahari"], correct: 1 },
  { question: "In which countries is the Kalahari Desert?", choices: ["Egypt and Libya","Botswana, Namibia, South Africa","Angola, DRC","Mozambique, Zambia"], correct: 1 },
  { question: "The Namib Desert is found primarily in which country?", choices: ["Angola","Namibia","South Africa","Botswana"], correct: 1 },
  { question: "What desert is the Sahara's eastern extension into the Arabian peninsula?", choices: ["Thar","Arabian","Negev","Karakum"], correct: 1 },
  { question: "Where is the Thar (Great Indian) Desert?", choices: ["India and Pakistan","India only","Bangladesh","Nepal"], correct: 0 },
  { question: "What is the largest desert in Australia?", choices: ["Gibson","Tanami","Great Sandy","Great Victoria"], correct: 3 },
  { question: "What desert is in Turkmenistan and Uzbekistan?", choices: ["Karakum","Kyzylkum","Both","Aralkum"], correct: 2 },
  { question: "What desert covers most of Egypt's western half?", choices: ["Sinai","Western Desert","Eastern Desert","Negev"], correct: 1 },
  { question: "What is the smallest desert in the world by some measures?", choices: ["Carcross","Antarctic","Atacama","Patagonian"], correct: 0 },
  { question: "In which U.S. state is Death Valley?", choices: ["Nevada","Arizona","California","Utah"], correct: 2 },
  { question: "What range borders the Mojave to the west?", choices: ["Rocky Mountains","Sierra Nevada","Cascades","Coast Range"], correct: 1 },
  { question: "What is the largest desert in South America?", choices: ["Atacama","Patagonian","Sechura","Monte"], correct: 1 },
  { question: "What desert covers parts of Iran's center?", choices: ["Dasht-e Kavir","Karakum","Negev","Thar"], correct: 0 },
  { question: "What sand dune is the highest in the world (in Namibia)?", choices: ["Dune 7","Big Daddy","Dune 45","Erg Chebbi"], correct: 0 },
  { question: "What desert is in Israel and Egypt's Sinai?", choices: ["Negev","Arabian","Sinai","Both Negev and Sinai"], correct: 3 },
  { question: "What is the dominant desert plant in the American Southwest?", choices: ["Cactus","Palm","Olive","Bamboo"], correct: 0 },
  { question: "What animal is famously called the ship of the desert?", choices: ["Horse","Donkey","Camel","Yak"], correct: 2 },
  { question: "What is an oasis?", choices: ["A fertile area in a desert","A type of cactus","A sand dune","A desert wind"], correct: 0 },
  { question: "What is the saltiest natural body of water surrounded by desert (and below sea level)?", choices: ["Caspian","Dead Sea","Aral Sea","Lake Eyre"], correct: 1 },
  { question: "What is the typical annual rainfall threshold for a desert (in mm)?", choices: ["100","250","500","1000"], correct: 1 },
  { question: "Which is a cold desert?", choices: ["Sahara","Gobi","Kalahari","Thar"], correct: 1 },
  { question: "What is the largest desert in North America (excluding Arctic)?", choices: ["Sonoran","Mojave","Chihuahuan","Great Basin"], correct: 2 },
  { question: "What desert flower famously blooms after rare rains in Atacama?", choices: ["Desert rose","Llareta","Anana","Desierto florido (multiple species)"], correct: 3 },
  { question: "What desert formation is a long, narrow ridge of sand?", choices: ["Erg","Reg","Wadi","Yardang"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DesertQuizSettings): DesertQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DesertQuizState, action: DesertQuizAction): DesertQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DesertQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
