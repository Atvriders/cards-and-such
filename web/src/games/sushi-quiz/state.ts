import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SushiQuizSettings { questions: "10" | "20"; }
export interface SushiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SushiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Sushi rice is seasoned with which trio?",
    "choices": [
      "Vinegar/sugar/salt",
      "Soy/mirin/sake",
      "Miso/dashi/oil",
      "Vinegar/wasabi/oil"
    ],
    "correct": 0
  },
  {
    "question": "Nigiri is best described as?",
    "choices": [
      "Rice ball with fish on top",
      "Roll with seaweed",
      "Fish only",
      "Rice in a cone"
    ],
    "correct": 0
  },
  {
    "question": "Maguro refers to which fish?",
    "choices": [
      "Salmon",
      "Tuna",
      "Yellowtail",
      "Eel"
    ],
    "correct": 1
  },
  {
    "question": "Sake nigiri is topped with?",
    "choices": [
      "Tuna",
      "Salmon",
      "Mackerel",
      "Squid"
    ],
    "correct": 1
  },
  {
    "question": "Hamachi is the Japanese name for?",
    "choices": [
      "Yellowtail",
      "Eel",
      "Octopus",
      "Sea urchin"
    ],
    "correct": 0
  },
  {
    "question": "Unagi is what?",
    "choices": [
      "Freshwater eel",
      "Saltwater eel",
      "Squid",
      "Octopus"
    ],
    "correct": 0
  },
  {
    "question": "Tako is which seafood?",
    "choices": [
      "Squid",
      "Octopus",
      "Eel",
      "Crab"
    ],
    "correct": 1
  },
  {
    "question": "Ikura is?",
    "choices": [
      "Salmon roe",
      "Tuna roe",
      "Cod roe",
      "Crab roe"
    ],
    "correct": 0
  },
  {
    "question": "Uni is the Japanese word for?",
    "choices": [
      "Sea urchin",
      "Squid",
      "Octopus",
      "Eel"
    ],
    "correct": 0
  },
  {
    "question": "Gari refers to?",
    "choices": [
      "Pickled ginger",
      "Wasabi",
      "Soy sauce",
      "Daikon"
    ],
    "correct": 0
  },
  {
    "question": "Wasabi is traditionally?",
    "choices": [
      "Horseradish",
      "Hot pepper",
      "Mustard",
      "Ginger"
    ],
    "correct": 0
  },
  {
    "question": "Nori is?",
    "choices": [
      "Seaweed",
      "Rice",
      "Fish",
      "Egg"
    ],
    "correct": 0
  },
  {
    "question": "Tamago is sushi made with?",
    "choices": [
      "Egg",
      "Fish",
      "Tofu",
      "Vegetable"
    ],
    "correct": 0
  },
  {
    "question": "Maki rolls are wrapped in?",
    "choices": [
      "Nori",
      "Soy paper",
      "Cucumber",
      "Egg"
    ],
    "correct": 0
  },
  {
    "question": "Uramaki has rice on the?",
    "choices": [
      "Inside",
      "Outside",
      "Top only",
      "Bottom only"
    ],
    "correct": 1
  },
  {
    "question": "Temaki is a?",
    "choices": [
      "Hand cone",
      "Sashimi plate",
      "Pressed sushi",
      "Soup"
    ],
    "correct": 0
  },
  {
    "question": "Chirashi means?",
    "choices": [
      "Scattered",
      "Rolled",
      "Pressed",
      "Boiled"
    ],
    "correct": 0
  },
  {
    "question": "Oshizushi is?",
    "choices": [
      "Pressed/box sushi",
      "Hand-rolled",
      "Cone",
      "Inside-out"
    ],
    "correct": 0
  },
  {
    "question": "Sashimi is?",
    "choices": [
      "Sliced raw fish",
      "Rolled fish",
      "Cooked fish",
      "Smoked fish"
    ],
    "correct": 0
  },
  {
    "question": "Itamae is the title for a?",
    "choices": [
      "Sushi chef",
      "Server",
      "Apprentice",
      "Customer"
    ],
    "correct": 0
  },
  {
    "question": "Shari refers to?",
    "choices": [
      "Sushi rice",
      "Wasabi",
      "Roe",
      "Salmon"
    ],
    "correct": 0
  },
  {
    "question": "Edomae sushi originated in?",
    "choices": [
      "Tokyo",
      "Kyoto",
      "Osaka",
      "Hokkaido"
    ],
    "correct": 0
  },
  {
    "question": "Toro is from which fish?",
    "choices": [
      "Salmon",
      "Tuna belly",
      "Mackerel",
      "Sea bream"
    ],
    "correct": 1
  },
  {
    "question": "O-toro vs chu-toro: chu-toro is?",
    "choices": [
      "Less fatty",
      "More fatty",
      "Cooked",
      "Smoked"
    ],
    "correct": 0
  },
  {
    "question": "Saba is?",
    "choices": [
      "Mackerel",
      "Sea bass",
      "Sardine",
      "Eel"
    ],
    "correct": 0
  },
  {
    "question": "Tai is?",
    "choices": [
      "Sea bream",
      "Snapper",
      "Halibut",
      "Cod"
    ],
    "correct": 0
  },
  {
    "question": "Ebi nigiri uses?",
    "choices": [
      "Shrimp",
      "Crab",
      "Lobster",
      "Octopus"
    ],
    "correct": 0
  },
  {
    "question": "California roll typically contains?",
    "choices": [
      "Avocado/crab/cucumber",
      "Tuna only",
      "Eel/cucumber",
      "Tempura/avocado"
    ],
    "correct": 0
  },
  {
    "question": "A spider roll uses?",
    "choices": [
      "Soft-shell crab",
      "Octopus",
      "Eel",
      "Mackerel"
    ],
    "correct": 0
  },
  {
    "question": "Sushi rice should be served at what temperature?",
    "choices": [
      "Hot",
      "Body temp",
      "Cold",
      "Frozen"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SushiQuizSettings): SushiQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SushiQuizState, action: SushiQuizAction): SushiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SushiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
