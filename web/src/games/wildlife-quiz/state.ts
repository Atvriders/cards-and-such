import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WildlifeQuizSettings { questions: "10" | "20" | "30"; }
export interface WildlifeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WildlifeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "African Big Five excludes?", choices: ["Elephant", "Hippo", "Rhino", "Lion"], correct: 1 },
  { question: "Largest bear?", choices: ["Black", "Polar", "Grizzly", "Sun"], correct: 1 },
  { question: "Fastest land animal?", choices: ["Lion", "Cheetah", "Pronghorn", "Horse"], correct: 1 },
  { question: "Pronghorn is found in?", choices: ["Africa", "N. America", "Asia", "S. America"], correct: 1 },
  { question: "Komodo dragon native to?", choices: ["Australia", "Indonesia", "India", "Madagascar"], correct: 1 },
  { question: "Largest fish?", choices: ["Whale shark", "Great white", "Marlin", "Manta"], correct: 0 },
  { question: "Largest mammal ever?", choices: ["Elephant", "Blue whale", "Sperm whale", "T. rex"], correct: 1 },
  { question: "Tigers native to?", choices: ["Africa", "Asia", "S. America", "Europe"], correct: 1 },
  { question: "Lions live mostly in?", choices: ["India", "Africa", "Asia", "Australia"], correct: 1 },
  { question: "Asiatic lions live in?", choices: ["Gir Forest", "Sundarbans", "Karakoram", "Yala"], correct: 0 },
  { question: "Snow leopard found in?", choices: ["Himalayas", "Andes", "Rockies", "Atlas"], correct: 0 },
  { question: "Penguins live primarily?", choices: ["North", "South", "Both", "Tropics"], correct: 1 },
  { question: "Polar bears hunt mainly?", choices: ["Salmon", "Seals", "Whales", "Caribou"], correct: 1 },
  { question: "Anaconda native to?", choices: ["Africa", "S. America", "Asia", "Oz"], correct: 1 },
  { question: "Komodo, Galápagos — which has marine iguana?", choices: ["Komodo", "Galápagos", "Both", "Neither"], correct: 1 },
  { question: "Pangolins eat?", choices: ["Plants", "Ants/termites", "Birds", "Fish"], correct: 1 },
  { question: "Tasmanian devil is found in?", choices: ["Mainland Oz", "Tasmania", "NZ", "PNG"], correct: 1 },
  { question: "Kiwi bird is from?", choices: ["Australia", "New Zealand", "Tonga", "Tahiti"], correct: 1 },
  { question: "Sloths live in?", choices: ["Africa", "Central/S. America", "Asia", "Madagascar"], correct: 1 },
  { question: "Tigers can swim?", choices: ["No", "Yes", "Some", "Briefly"], correct: 1 },
  { question: "Hippos kill more humans annually than?", choices: ["Lions", "Mosquitoes", "Crocs", "Cobras"], correct: 0 },
  { question: "Wolverine is a?", choices: ["Bear", "Mustelid", "Cat", "Dog"], correct: 1 },
  { question: "Tiger sharks are named for?", choices: ["Stripes", "Speed", "Bite", "Color"], correct: 0 },
  { question: "Octopuses have how many hearts?", choices: ["1", "3", "9", "12"], correct: 1 },
  { question: "Wallaby is related to?", choices: ["Wolf", "Kangaroo", "Wombat", "Marmot"], correct: 1 },
  { question: "Marmot is in family?", choices: ["Squirrel", "Cat", "Dog", "Bear"], correct: 0 },
  { question: "Jaguar is largest cat in?", choices: ["Asia", "Americas", "Africa", "Oz"], correct: 1 },
  { question: "Leopard vs cheetah spots?", choices: ["Same", "Rosettes vs solid", "Reverse", "None"], correct: 1 },
  { question: "Arctic tern migrates pole to?", choices: ["Pole", "Equator", "Tropics", "None"], correct: 0 },
  { question: "Bald eagle national bird of?", choices: ["Canada", "U.S.", "UK", "Russia"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WildlifeQuizSettings): WildlifeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WildlifeQuizState, action: WildlifeQuizAction): WildlifeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WildlifeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
