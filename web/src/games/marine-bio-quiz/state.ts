import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarineBioQuizSettings { questions: "10" | "20" | "30"; }
export interface MarineBioQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarineBioQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the deepest part of the ocean?", choices: ["Puerto Rico Trench", "Mariana Trench", "Java Trench", "Tonga Trench"], correct: 1 },
  { question: "What percentage of Earth is covered by oceans?", choices: ["50%", "60%", "70%", "80%"], correct: 2 },
  { question: "Which is the largest ocean?", choices: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 1 },
  { question: "Coral reefs are made of?", choices: ["Stone", "Calcium carbonate skeletons", "Plant matter", "Sand"], correct: 1 },
  { question: "Which is a cetacean?", choices: ["Shark", "Dolphin", "Octopus", "Tuna"], correct: 1 },
  { question: "Which fish is the largest?", choices: ["Great white shark", "Whale shark", "Tiger shark", "Hammerhead"], correct: 1 },
  { question: "What is the largest reef system in the world?", choices: ["Belize Reef", "Great Barrier Reef", "Red Sea Reef", "Mesoamerican Reef"], correct: 1 },
  { question: "Plankton are at what trophic level?", choices: ["Top predator", "Herbivore", "Producers + primary consumers", "Decomposers"], correct: 2 },
  { question: "Which ocean is shrinking?", choices: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 1 },
  { question: "What gas do oceans absorb in large amounts?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], correct: 2 },
  { question: "Which animal has the largest brain?", choices: ["Elephant", "Sperm whale", "Human", "Dolphin"], correct: 1 },
  { question: "What ocean zone gets no sunlight?", choices: ["Sunlight zone", "Twilight zone", "Midnight zone", "All of them"], correct: 2 },
  { question: "Which mollusk has eight arms?", choices: ["Squid", "Octopus", "Cuttlefish", "Nautilus"], correct: 1 },
  { question: "Which fish jumps to spawn upstream?", choices: ["Tuna", "Salmon", "Cod", "Bass"], correct: 1 },
  { question: "Which is a flat fish?", choices: ["Tuna", "Flounder", "Sardine", "Mackerel"], correct: 1 },
  { question: "Whale sharks eat mainly?", choices: ["Big fish", "Plankton", "Seals", "Squid"], correct: 1 },
  { question: "What gives the ocean its salt?", choices: ["Sea creatures", "Eroded minerals from land", "Fish waste", "The Moon"], correct: 1 },
  { question: "Which ocean is between Africa and Australia?", choices: ["Pacific", "Atlantic", "Indian", "Southern"], correct: 2 },
  { question: "What causes ocean tides?", choices: ["Wind", "Sun and Moon", "Earth's rotation", "Currents"], correct: 1 },
  { question: "Krill are what kind of animal?", choices: ["Fish", "Crustacean", "Mollusk", "Coral"], correct: 1 },
  { question: "What's a group of fish called?", choices: ["Pod", "School", "Gaggle", "Herd"], correct: 1 },
  { question: "Which whale has a horn-like tusk?", choices: ["Beluga", "Narwhal", "Orca", "Humpback"], correct: 1 },
  { question: "Which animal makes pearls?", choices: ["Crab", "Oyster", "Squid", "Starfish"], correct: 1 },
  { question: "Sea turtles are what class?", choices: ["Mammal", "Reptile", "Amphibian", "Fish"], correct: 1 },
  { question: "What causes coral bleaching?", choices: ["Pollution", "Heat stress", "Predators", "Acid rain"], correct: 1 },
  { question: "What is a submarine canyon?", choices: ["Coral structure", "Deep underwater valley", "Type of fish", "Volcano"], correct: 1 },
  { question: "Which fish is venomous?", choices: ["Tuna", "Lionfish", "Cod", "Sole"], correct: 1 },
  { question: "What are baleen whales' filter structures called?", choices: ["Teeth", "Plates of baleen", "Gills", "Whiskers"], correct: 1 },
  { question: "Which marine animal is intelligent and uses tools?", choices: ["Tuna", "Octopus", "Jellyfish", "Sponge"], correct: 1 },
  { question: "What ocean current warms Western Europe?", choices: ["Humboldt", "Gulf Stream", "Kuroshio", "Benguela"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MarineBioQuizSettings): MarineBioQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MarineBioQuizState, action: MarineBioQuizAction): MarineBioQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MarineBioQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
