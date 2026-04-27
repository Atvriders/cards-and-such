import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DesertQuizSettings { questions: "10" | "20"; }
export interface DesertQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DesertQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "World's largest hot desert?",
    "choices": [
      "Gobi",
      "Kalahari",
      "Sahara",
      "Arabian"
    ],
    "correct": 2
  },
  {
    "question": "World's largest desert overall (any kind)?",
    "choices": [
      "Sahara",
      "Antarctic Desert",
      "Arctic Desert",
      "Australian"
    ],
    "correct": 1
  },
  {
    "question": "The Gobi Desert is in which countries?",
    "choices": [
      "Iran and Iraq",
      "Mongolia and China",
      "India and Pakistan",
      "Russia and Kazakhstan"
    ],
    "correct": 1
  },
  {
    "question": "The Atacama Desert is in which country?",
    "choices": [
      "Argentina",
      "Peru",
      "Chile",
      "Bolivia"
    ],
    "correct": 2
  },
  {
    "question": "The Mojave Desert is mostly in which US state?",
    "choices": [
      "Arizona",
      "California",
      "Nevada",
      "New Mexico"
    ],
    "correct": 1
  },
  {
    "question": "The Kalahari Desert is in which region?",
    "choices": [
      "West Africa",
      "Southern Africa",
      "North Africa",
      "East Africa"
    ],
    "correct": 1
  },
  {
    "question": "Death Valley is in which desert?",
    "choices": [
      "Mojave",
      "Sonoran",
      "Great Basin",
      "Chihuahuan"
    ],
    "correct": 0
  },
  {
    "question": "The Sahara stretches across roughly how many countries?",
    "choices": [
      "3",
      "5",
      "11",
      "20"
    ],
    "correct": 2
  },
  {
    "question": "The Thar Desert is shared by which two countries?",
    "choices": [
      "Egypt and Sudan",
      "Algeria and Morocco",
      "India and Pakistan",
      "Iran and Afghanistan"
    ],
    "correct": 2
  },
  {
    "question": "What is the driest non-polar place on Earth?",
    "choices": [
      "Mojave",
      "Atacama",
      "Sahara",
      "Gobi"
    ],
    "correct": 1
  },
  {
    "question": "The Namib Desert is in which country?",
    "choices": [
      "Namibia",
      "Botswana",
      "South Africa",
      "Angola"
    ],
    "correct": 0
  },
  {
    "question": "The Sonoran Desert is famous for which cactus?",
    "choices": [
      "Prickly pear",
      "Saguaro",
      "Barrel cactus",
      "Joshua tree"
    ],
    "correct": 1
  },
  {
    "question": "The Patagonian Desert is mostly in which country?",
    "choices": [
      "Chile",
      "Argentina",
      "Peru",
      "Brazil"
    ],
    "correct": 1
  },
  {
    "question": "Which desert is on the Arabian Peninsula?",
    "choices": [
      "Rub' al Khali",
      "Atacama",
      "Karakum",
      "Taklamakan"
    ],
    "correct": 0
  },
  {
    "question": "The Karakum Desert is mostly in which country?",
    "choices": [
      "Iran",
      "Afghanistan",
      "Turkmenistan",
      "Uzbekistan"
    ],
    "correct": 2
  },
  {
    "question": "The Australian Outback contains which large desert?",
    "choices": [
      "Great Victoria Desert",
      "Karoo",
      "Negev",
      "Sechura"
    ],
    "correct": 0
  },
  {
    "question": "The Negev Desert is in which country?",
    "choices": [
      "Egypt",
      "Israel",
      "Jordan",
      "Syria"
    ],
    "correct": 1
  },
  {
    "question": "The Taklamakan Desert is in which country?",
    "choices": [
      "Mongolia",
      "Russia",
      "China",
      "Kazakhstan"
    ],
    "correct": 2
  },
  {
    "question": "How is desert defined (rainfall)?",
    "choices": [
      "Less than 250mm/yr",
      "Less than 1000mm/yr",
      "Less than 50mm/yr",
      "More than 250mm/yr"
    ],
    "correct": 0
  },
  {
    "question": "The Chihuahuan Desert spans which two countries?",
    "choices": [
      "US and Mexico",
      "Mexico and Guatemala",
      "US and Canada",
      "Mexico and Belize"
    ],
    "correct": 0
  },
  {
    "question": "What does 'oasis' refer to in a desert?",
    "choices": [
      "Sandstorm",
      "Rocky outcrop",
      "Fertile spot with water",
      "Desert mountain"
    ],
    "correct": 2
  },
  {
    "question": "The Wadi Rum desert is in which country?",
    "choices": [
      "Saudi Arabia",
      "Jordan",
      "UAE",
      "Oman"
    ],
    "correct": 1
  }
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
