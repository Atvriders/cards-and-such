import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ZoologyQuizSettings { questions: "10" | "20" | "30"; }
export interface ZoologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ZoologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many legs does an insect have?", choices: ["4", "6", "8", "10"], correct: 1 },
  { question: "How many legs does a spider have?", choices: ["4", "6", "8", "10"], correct: 2 },
  { question: "Which is the largest mammal?", choices: ["Elephant", "Blue whale", "Giraffe", "Polar bear"], correct: 1 },
  { question: "Which bird can fly backward?", choices: ["Eagle", "Hummingbird", "Sparrow", "Owl"], correct: 1 },
  { question: "Which reptile is the longest?", choices: ["Anaconda", "Komodo dragon", "Reticulated python", "King cobra"], correct: 2 },
  { question: "What class do whales belong to?", choices: ["Fish", "Mammals", "Reptiles", "Amphibians"], correct: 1 },
  { question: "What is a baby kangaroo called?", choices: ["Cub", "Joey", "Pup", "Calf"], correct: 1 },
  { question: "Which animal is known as the king of the jungle?", choices: ["Tiger", "Lion", "Leopard", "Cheetah"], correct: 1 },
  { question: "Which is a flightless bird?", choices: ["Sparrow", "Eagle", "Penguin", "Robin"], correct: 2 },
  { question: "Which animal has the longest neck?", choices: ["Camel", "Giraffe", "Ostrich", "Llama"], correct: 1 },
  { question: "Which animal lays the largest egg?", choices: ["Crocodile", "Ostrich", "Eagle", "Pelican"], correct: 1 },
  { question: "Which is a marsupial?", choices: ["Bat", "Kangaroo", "Mouse", "Rabbit"], correct: 1 },
  { question: "Which is a venomous snake?", choices: ["Boa", "Python", "Cobra", "Garter"], correct: 2 },
  { question: "Which animal lays eggs but is a mammal?", choices: ["Kangaroo", "Bat", "Platypus", "Sloth"], correct: 2 },
  { question: "What class are frogs in?", choices: ["Mammalia", "Reptilia", "Amphibia", "Aves"], correct: 2 },
  { question: "What is the fastest land animal?", choices: ["Lion", "Cheetah", "Horse", "Greyhound"], correct: 1 },
  { question: "Which insect makes honey?", choices: ["Wasp", "Bee", "Ant", "Hornet"], correct: 1 },
  { question: "Which animal has black-and-white stripes?", choices: ["Tiger", "Zebra", "Lemur", "Skunk"], correct: 1 },
  { question: "How many hearts does an octopus have?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "What kind of animal is a Komodo dragon?", choices: ["Snake", "Lizard", "Crocodile", "Turtle"], correct: 1 },
  { question: "What's a group of lions called?", choices: ["Pack", "Pride", "Herd", "Flock"], correct: 1 },
  { question: "Which mammal can truly fly?", choices: ["Flying squirrel", "Bat", "Sugar glider", "Colugo"], correct: 1 },
  { question: "What is taxonomy?", choices: ["Animal feeding", "Classification of life", "Animal migration", "Mating behavior"], correct: 1 },
  { question: "What animal is featured on Australia's coat of arms with the kangaroo?", choices: ["Koala", "Emu", "Kookaburra", "Wombat"], correct: 1 },
  { question: "Which is the largest land carnivore?", choices: ["Lion", "Tiger", "Polar bear", "Grizzly bear"], correct: 2 },
  { question: "Which species is humans' closest living relative?", choices: ["Gorilla", "Bonobo", "Orangutan", "Lemur"], correct: 1 },
  { question: "Which animal hibernates in winter?", choices: ["Cat", "Bear", "Dog", "Cow"], correct: 1 },
  { question: "What's a group of crows called?", choices: ["Flock", "Murder", "Herd", "Swarm"], correct: 1 },
  { question: "Which is the smallest mammal?", choices: ["Bumblebee bat", "Mouse", "Shrew", "Vole"], correct: 0 },
  { question: "What phylum do insects belong to?", choices: ["Chordata", "Arthropoda", "Mollusca", "Annelida"], correct: 1 },
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
