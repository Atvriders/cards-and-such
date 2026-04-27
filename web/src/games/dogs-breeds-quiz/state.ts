import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DogsBreedsQuizSettings { questions: "10" | "20"; }
export interface DogsBreedsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DogsBreedsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Labrador Retriever originated in?",
    "choices": [
      "Newfoundland (Canada)",
      "Labrador (Canada)",
      "England",
      "Scotland"
    ],
    "correct": 0
  },
  {
    "question": "Golden Retrievers were developed in?",
    "choices": [
      "Scotland",
      "England",
      "Ireland",
      "France"
    ],
    "correct": 0
  },
  {
    "question": "German Shepherds were originally bred for?",
    "choices": [
      "Herding",
      "Hunting",
      "Companion",
      "Sled pulling"
    ],
    "correct": 0
  },
  {
    "question": "Saint Bernards are from?",
    "choices": [
      "Switzerland",
      "Italy",
      "France",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "The Chihuahua is from?",
    "choices": [
      "Mexico",
      "Spain",
      "Peru",
      "Cuba"
    ],
    "correct": 0
  },
  {
    "question": "The Akita is from?",
    "choices": [
      "Japan",
      "Korea",
      "China",
      "Mongolia"
    ],
    "correct": 0
  },
  {
    "question": "The Shiba Inu is from?",
    "choices": [
      "Japan",
      "China",
      "Korea",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "The Tibetan Mastiff originated in?",
    "choices": [
      "Tibet/Himalayas",
      "Mongolia",
      "Russia",
      "Persia"
    ],
    "correct": 0
  },
  {
    "question": "The Border Collie is famous for?",
    "choices": [
      "Herding intelligence",
      "Sled pulling",
      "Lap warmth",
      "Guard duty"
    ],
    "correct": 0
  },
  {
    "question": "Border Collies originated in?",
    "choices": [
      "Anglo-Scottish border",
      "France",
      "Wales only",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "The Australian Shepherd was developed in?",
    "choices": [
      "United States",
      "Australia",
      "UK",
      "Canada"
    ],
    "correct": 0
  },
  {
    "question": "Dalmatians are famous for?",
    "choices": [
      "Spots",
      "Wrinkles",
      "Long ears",
      "Fluffy tails"
    ],
    "correct": 0
  },
  {
    "question": "Beagles were bred to hunt?",
    "choices": [
      "Rabbits",
      "Foxes",
      "Lions",
      "Bears"
    ],
    "correct": 0
  },
  {
    "question": "Greyhounds are known for?",
    "choices": [
      "Speed",
      "Strength",
      "Tracking scent",
      "Swimming"
    ],
    "correct": 0
  },
  {
    "question": "Bloodhounds are known for?",
    "choices": [
      "Tracking scent",
      "Speed",
      "Herding",
      "Guarding"
    ],
    "correct": 0
  },
  {
    "question": "Siberian Huskies were bred to?",
    "choices": [
      "Pull sleds",
      "Herd sheep",
      "Hunt foxes",
      "Guard homes"
    ],
    "correct": 0
  },
  {
    "question": "Alaskan Malamutes were bred to?",
    "choices": [
      "Pull heavy freight",
      "Herd",
      "Hunt ducks",
      "Race"
    ],
    "correct": 0
  },
  {
    "question": "The Poodle's traditional clip was for?",
    "choices": [
      "Swimming/retrieving",
      "Show only",
      "Cold weather",
      "Hunting birds"
    ],
    "correct": 0
  },
  {
    "question": "The Poodle originated in?",
    "choices": [
      "Germany",
      "France",
      "Italy",
      "England"
    ],
    "correct": 0
  },
  {
    "question": "The Bulldog is which group?",
    "choices": [
      "Non-sporting",
      "Working",
      "Toy",
      "Herding"
    ],
    "correct": 0
  },
  {
    "question": "The English Bulldog was originally for?",
    "choices": [
      "Bull baiting",
      "Hunting",
      "Herding",
      "Companion"
    ],
    "correct": 0
  },
  {
    "question": "The Doberman is from?",
    "choices": [
      "Germany",
      "Czech Republic",
      "Austria",
      "Switzerland"
    ],
    "correct": 0
  },
  {
    "question": "The Rottweiler descends from?",
    "choices": [
      "Roman drover dogs",
      "Mongol war dogs",
      "French shepherds",
      "Spanish hounds"
    ],
    "correct": 0
  },
  {
    "question": "Yorkshire Terriers are from?",
    "choices": [
      "England",
      "Wales",
      "Scotland",
      "Ireland"
    ],
    "correct": 0
  },
  {
    "question": "Jack Russell Terriers were bred for?",
    "choices": [
      "Fox hunting",
      "Sheep herding",
      "Lap warmth",
      "Guard"
    ],
    "correct": 0
  },
  {
    "question": "Pomeranians descend from?",
    "choices": [
      "Spitz/sled dogs",
      "Mastiffs",
      "Hunting hounds",
      "Lap dogs"
    ],
    "correct": 0
  },
  {
    "question": "Shih Tzus were favored by which royalty?",
    "choices": [
      "Chinese imperial",
      "Russian tsars",
      "English kings",
      "French royalty"
    ],
    "correct": 0
  },
  {
    "question": "Pugs originated in?",
    "choices": [
      "China",
      "India",
      "Egypt",
      "Persia"
    ],
    "correct": 0
  },
  {
    "question": "Mastiffs are which group?",
    "choices": [
      "Working",
      "Hound",
      "Toy",
      "Sporting"
    ],
    "correct": 0
  },
  {
    "question": "The Chow Chow originated in?",
    "choices": [
      "China",
      "Mongolia",
      "Korea",
      "Tibet"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DogsBreedsQuizSettings): DogsBreedsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DogsBreedsQuizState, action: DogsBreedsQuizAction): DogsBreedsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DogsBreedsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
