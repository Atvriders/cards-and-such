import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CatsBreedsQuizSettings { questions: "10" | "20"; }
export interface CatsBreedsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CatsBreedsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Maine Coon is from?",
    "choices": [
      "Maine, USA",
      "England",
      "Norway",
      "Russia"
    ],
    "correct": 0
  },
  {
    "question": "The Maine Coon is famous for?",
    "choices": [
      "Large size",
      "Small size",
      "Hairlessness",
      "Folded ears"
    ],
    "correct": 0
  },
  {
    "question": "The Norwegian Forest cat is from?",
    "choices": [
      "Norway",
      "Iceland",
      "Russia",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "The Siberian cat is from?",
    "choices": [
      "Russia",
      "Mongolia",
      "Norway",
      "Canada"
    ],
    "correct": 0
  },
  {
    "question": "The Persian cat originated in?",
    "choices": [
      "Persia/Iran",
      "Egypt",
      "Turkey",
      "India"
    ],
    "correct": 0
  },
  {
    "question": "The Persian's signature feature is?",
    "choices": [
      "Long fluffy coat",
      "Hairlessness",
      "Folded ears",
      "Curly fur"
    ],
    "correct": 0
  },
  {
    "question": "The Siamese cat is from?",
    "choices": [
      "Thailand (Siam)",
      "Japan",
      "Burma",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "Siamese coat pattern is?",
    "choices": [
      "Colorpoint",
      "Tabby",
      "Calico",
      "Smoke"
    ],
    "correct": 0
  },
  {
    "question": "The Burmese cat originated in?",
    "choices": [
      "Myanmar (Burma)",
      "Thailand",
      "Cambodia",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "The Birman is also called?",
    "choices": [
      "Sacred Cat of Burma",
      "Sacred Cat of India",
      "Sacred Cat of Japan",
      "Sacred Cat of Tibet"
    ],
    "correct": 0
  },
  {
    "question": "The Abyssinian cat resembles cats from?",
    "choices": [
      "Ancient Egypt",
      "Persia",
      "Greece",
      "Italy"
    ],
    "correct": 0
  },
  {
    "question": "The Abyssinian's coat is?",
    "choices": [
      "Ticked",
      "Spotted",
      "Tabby",
      "Calico"
    ],
    "correct": 0
  },
  {
    "question": "The Russian Blue is famous for?",
    "choices": [
      "Plush blue/grey coat",
      "Long fluffy coat",
      "Folded ears",
      "Hairlessness"
    ],
    "correct": 0
  },
  {
    "question": "The Sphynx is famous for?",
    "choices": [
      "Hairlessness",
      "Folded ears",
      "Spotted coat",
      "Large size"
    ],
    "correct": 0
  },
  {
    "question": "The Sphynx originated in?",
    "choices": [
      "Canada",
      "Egypt",
      "Russia",
      "France"
    ],
    "correct": 0
  },
  {
    "question": "The Scottish Fold is famous for?",
    "choices": [
      "Folded ears",
      "Hairlessness",
      "Spotted coat",
      "Large size"
    ],
    "correct": 0
  },
  {
    "question": "The Scottish Fold originated in?",
    "choices": [
      "Scotland",
      "Ireland",
      "England",
      "Wales"
    ],
    "correct": 0
  },
  {
    "question": "The British Shorthair is famous for?",
    "choices": [
      "Round face/dense coat",
      "Hairless",
      "Folded ears",
      "Large size"
    ],
    "correct": 0
  },
  {
    "question": "The Bengal cat was bred to resemble?",
    "choices": [
      "Asian leopard cat",
      "Tiger",
      "Snow leopard",
      "Jaguar"
    ],
    "correct": 0
  },
  {
    "question": "The Ragdoll is famous for?",
    "choices": [
      "Going limp when held",
      "Folded ears",
      "Hairlessness",
      "Spotted coat"
    ],
    "correct": 0
  },
  {
    "question": "The Ragdoll's coat pattern is?",
    "choices": [
      "Colorpoint/mitted",
      "Calico",
      "Tabby only",
      "Tortoiseshell"
    ],
    "correct": 0
  },
  {
    "question": "The Devon Rex has?",
    "choices": [
      "Curly soft coat",
      "Long fluffy coat",
      "Hairless",
      "Tabby coat"
    ],
    "correct": 0
  },
  {
    "question": "The Cornish Rex has?",
    "choices": [
      "Wavy short coat",
      "Hairless",
      "Long fluffy coat",
      "Tabby coat"
    ],
    "correct": 0
  },
  {
    "question": "Calico coats are nearly always?",
    "choices": [
      "Female",
      "Male",
      "Either equally",
      "Neutered"
    ],
    "correct": 0
  },
  {
    "question": "Tortoiseshell coats are nearly always?",
    "choices": [
      "Female",
      "Male",
      "Either equally",
      "Spotted"
    ],
    "correct": 0
  },
  {
    "question": "Colorpoint patterns are caused by?",
    "choices": [
      "Temperature-sensitive gene",
      "Sun exposure",
      "Diet",
      "Age"
    ],
    "correct": 0
  },
  {
    "question": "The Manx cat is famous for?",
    "choices": [
      "No tail",
      "Folded ears",
      "Hairlessness",
      "Large size"
    ],
    "correct": 0
  },
  {
    "question": "The Manx is from?",
    "choices": [
      "Isle of Man",
      "Ireland",
      "Scotland",
      "Wales"
    ],
    "correct": 0
  },
  {
    "question": "The Turkish Van is known for?",
    "choices": [
      "Loving water",
      "Hairlessness",
      "Folded ears",
      "Spotted coat"
    ],
    "correct": 0
  },
  {
    "question": "The Savannah cat was bred from?",
    "choices": [
      "Serval/domestic",
      "Lynx/domestic",
      "Caracal/domestic",
      "Ocelot/domestic"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CatsBreedsQuizSettings): CatsBreedsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CatsBreedsQuizState, action: CatsBreedsQuizAction): CatsBreedsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CatsBreedsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
