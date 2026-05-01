import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ZoologyQuizSettings { questions: "10" | "20" | "30"; }
export interface ZoologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ZoologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's the largest land animal?", choices: ["African elephant","Giraffe","Hippo","Rhino"], correct: 0 },
  { question: "What's the largest animal ever?", choices: ["Blue whale","Argentinosaurus (extinct)","African elephant","Sperm whale"], correct: 0 },
  { question: "What's the tallest animal?", choices: ["Giraffe","Elephant","Ostrich","Polar bear"], correct: 0 },
  { question: "What's the fastest land animal?", choices: ["Cheetah","Lion","Pronghorn","Greyhound"], correct: 0 },
  { question: "What's the largest bird?", choices: ["Ostrich","Emu","Cassowary","Albatross"], correct: 0 },
  { question: "What bird has the largest wingspan?", choices: ["Wandering albatross","Condor","Eagle","Pelican"], correct: 0 },
  { question: "How many legs do insects have?", choices: ["6","8","4","10"], correct: 0 },
  { question: "How many legs do arachnids have?", choices: ["8","6","4","10"], correct: 0 },
  { question: "What's a crustacean?", choices: ["Mostly aquatic arthropod (crab, shrimp)","Just bug","Both","Spider"], correct: 2 },
  { question: "What's the largest fish?", choices: ["Whale shark","Great white","Manta ray","Marlin"], correct: 0 },
  { question: "What's the largest reptile?", choices: ["Saltwater crocodile","Komodo dragon","Anaconda","Boa"], correct: 0 },
  { question: "What's the longest snake?", choices: ["Reticulated python","Anaconda","Boa","King cobra"], correct: 0 },
  { question: "What's the heaviest snake?", choices: ["Green anaconda","Reticulated python","Both close","King cobra"], correct: 0 },
  { question: "What's the smallest mammal?", choices: ["Etruscan shrew or bumblebee bat","Mouse","Just shrew","Bat"], correct: 0 },
  { question: "What's the only flying mammal?", choices: ["Bat","Squirrel","Bird","Just bat"], correct: 2 },
  { question: "What's a primate?", choices: ["Includes monkeys, apes, humans","Just monkey","Both","Lemur"], correct: 2 },
  { question: "What's the smartest non-human animal commonly cited?", choices: ["Chimpanzee, dolphin, octopus","Just chimp","Both","Many candidates"], correct: 0 },
  { question: "What's a mammal characteristic?", choices: ["Mammary glands, hair, warm-blooded","Just hair","Both","Live young"], correct: 2 },
  { question: "What's an oviparous animal?", choices: ["Lays eggs","Live birth","Both","Just birds"], correct: 0 },
  { question: "What's a viviparous animal?", choices: ["Live birth","Lays eggs","Both","Just mammals"], correct: 0 },
  { question: "What's an amphibian?", choices: ["Lives water and land (frog, etc.)","Just water","Just land","Reptile"], correct: 0 },
  { question: "What animal class is a snake?", choices: ["Reptile","Amphibian","Mammal","Fish"], correct: 0 },
  { question: "What animal class is a frog?", choices: ["Amphibian","Reptile","Fish","Mammal"], correct: 0 },
  { question: "What's an arthropod?", choices: ["Jointed exoskeleton (insects, spiders, crustaceans)","Just bug","Both","Just spider"], correct: 2 },
  { question: "What's the largest predator on land?", choices: ["Polar bear","Brown bear","Tiger","Lion"], correct: 0 },
  { question: "What's the largest cat?", choices: ["Tiger","Lion","Jaguar","Leopard"], correct: 0 },
  { question: "What's the largest bear?", choices: ["Polar bear","Brown/Kodiak","Both close","Black"], correct: 2 },
  { question: "What's the only flightless parrot?", choices: ["Kakapo","Kea","Cockatoo","Macaw"], correct: 0 },
  { question: "What's a marsupial?", choices: ["Mammal carrying young in pouch","Just kangaroo","Both","All Australian"], correct: 2 },
  { question: "What's the world's largest rodent?", choices: ["Capybara","Beaver","Rat","Squirrel"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ZoologyQuizSettings): ZoologyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ZoologyQuizState, action: ZoologyQuizAction): ZoologyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ZoologyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
