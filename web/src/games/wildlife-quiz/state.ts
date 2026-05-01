import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WildlifeQuizSettings { questions: "10" | "20" | "30"; }
export interface WildlifeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WildlifeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which of these is NOT one of Africa's traditional Big Five?", choices: ["Elephant", "Hippopotamus", "Rhinoceros", "Lion"], correct: 1 },
  { question: "The largest living bear species is the?", choices: ["American black bear", "Polar bear", "Grizzly", "Sun bear"], correct: 1 },
  { question: "The fastest land animal over short distances is the?", choices: ["Lion", "Cheetah", "Pronghorn", "Horse"], correct: 1 },
  { question: "Pronghorn are native to?", choices: ["Africa", "North America", "Asia", "South America"], correct: 1 },
  { question: "Komodo dragons are native to?", choices: ["Australia", "Indonesia", "India", "Madagascar"], correct: 1 },
  { question: "The largest fish in the ocean is the?", choices: ["Whale shark", "Great white shark", "Marlin", "Manta ray"], correct: 0 },
  { question: "The largest animal ever known to have lived is the?", choices: ["Argentinosaurus", "Blue whale", "Sperm whale", "T. rex"], correct: 1 },
  { question: "Wild tigers are native to?", choices: ["Africa", "Asia", "South America", "Europe"], correct: 1 },
  { question: "Most wild lions today live in?", choices: ["India", "Sub-Saharan Africa", "Southeast Asia", "Australia"], correct: 1 },
  { question: "Asiatic lions survive primarily in?", choices: ["Gir Forest, India", "Sundarbans", "Karakoram", "Yala"], correct: 0 },
  { question: "Snow leopards are found in?", choices: ["The Himalayas and Central Asian mountains", "The Andes", "The Rockies", "The Atlas Mountains"], correct: 0 },
  { question: "Penguins are found primarily in the?", choices: ["Northern Hemisphere", "Southern Hemisphere", "Arctic only", "Tropics only"], correct: 1 },
  { question: "Polar bears hunt mainly?", choices: ["Salmon", "Seals", "Whales", "Caribou"], correct: 1 },
  { question: "The green anaconda is native to?", choices: ["Africa", "South America", "Asia", "Australia"], correct: 1 },
  { question: "Marine iguanas are found on which islands?", choices: ["Komodo", "Galápagos", "Maldives", "Hawaii"], correct: 1 },
  { question: "Pangolins primarily eat?", choices: ["Plants", "Ants and termites", "Birds", "Fish"], correct: 1 },
  { question: "Tasmanian devils today live wild in?", choices: ["Mainland Australia", "Tasmania", "New Zealand", "Papua New Guinea"], correct: 1 },
  { question: "Kiwi birds are native to?", choices: ["Australia", "New Zealand", "Tonga", "Samoa"], correct: 1 },
  { question: "Sloths live in the forests of?", choices: ["Africa", "Central and South America", "Southeast Asia", "Madagascar"], correct: 1 },
  { question: "Tigers are excellent?", choices: ["Climbers but poor swimmers", "Swimmers", "Burrowers", "Fliers"], correct: 1 },
  { question: "Hippos are responsible for more human deaths in Africa than?", choices: ["Lions", "Mosquitoes", "Crocodiles", "Cobras"], correct: 0 },
  { question: "The wolverine is in which family?", choices: ["Bear", "Mustelid (weasel family)", "Cat", "Dog"], correct: 1 },
  { question: "Octopuses have how many hearts?", choices: ["1", "3", "9", "12"], correct: 1 },
  { question: "A wallaby is most closely related to a?", choices: ["Wolf", "Kangaroo", "Wombat", "Marmot"], correct: 1 },
  { question: "Marmots belong to which family?", choices: ["Squirrel (Sciuridae)", "Cat", "Dog", "Bear"], correct: 0 },
  { question: "The jaguar is the largest wild cat in?", choices: ["Asia", "The Americas", "Africa", "Australia"], correct: 1 },
  { question: "Leopards have rosettes; cheetahs have?", choices: ["The same rosettes", "Solid round spots", "Stripes", "No spots"], correct: 1 },
  { question: "The Arctic tern is famous for migrating?", choices: ["Pole to pole", "To the equator only", "Within Europe", "Around Antarctica only"], correct: 0 },
  { question: "The bald eagle is the national bird of?", choices: ["Canada", "The United States", "The U.K.", "Russia"], correct: 1 },
  { question: "The IUCN Red List classifies species by?", choices: ["Color", "Conservation/extinction risk", "Size", "Habitat"], correct: 1 },
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
