import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CaveExploreQuizSettings { questions: "10" | "20" | "30"; }
export interface CaveExploreQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CaveExploreQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Study of caves is called?", choices: ["Geology", "Speleology", "Spelunking", "Karstology"], correct: 1 },
  { question: "Recreational cave exploration is called?", choices: ["Climbing", "Caving/spelunking", "Trekking", "Diving"], correct: 1 },
  { question: "Most caves form in which rock?", choices: ["Granite", "Limestone", "Basalt", "Shale"], correct: 1 },
  { question: "Hanging cave formations?", choices: ["Stalactites", "Stalagmites", "Columns", "Helictites"], correct: 0 },
  { question: "Floor formations growing up?", choices: ["Stalactites", "Stalagmites", "Columns", "Helictites"], correct: 1 },
  { question: "Stalactite/stalagmite mnemonic?", choices: ["G hangs on", "C hangs on", "Both", "Neither"], correct: 1 },
  { question: "Deepest known cave on Earth?", choices: ["Mammoth", "Veryovkina", "Krubera", "Sistema Sac Actun"], correct: 1 },
  { question: "Country of Veryovkina/Krubera caves?", choices: ["Georgia", "Mexico", "USA", "France"], correct: 0 },
  { question: "Longest known cave system?", choices: ["Mammoth Cave", "Krubera", "Optymistychna", "Lechuguilla"], correct: 0 },
  { question: "Mammoth Cave is in which US state?", choices: ["Tennessee", "Kentucky", "Missouri", "Texas"], correct: 1 },
  { question: "Cave painting site Lascaux is in?", choices: ["Spain", "France", "Italy", "Germany"], correct: 1 },
  { question: "Approx age of Lascaux paintings?", choices: ["~5,000 years", "~17,000 years", "~50,000 years", "~100,000 years"], correct: 1 },
  { question: "Altamira cave is in?", choices: ["France", "Spain", "Portugal", "Greece"], correct: 1 },
  { question: "Karst landscapes feature?", choices: ["Sand dunes", "Sinkholes & caves", "Volcanoes", "Glaciers"], correct: 1 },
  { question: "Cave divers explore underwater caves called?", choices: ["Sumps", "Cenotes", "Both", "Neither"], correct: 2 },
  { question: "Cenotes are most associated with?", choices: ["USA", "Mexico (Yucat\u00e1n)", "Brazil", "Egypt"], correct: 1 },
  { question: "Bats roosting in caves can carry?", choices: ["Cold", "Rabies risk", "Salt", "Iron"], correct: 1 },
  { question: "Glow-worm Waitomo caves are in?", choices: ["Australia", "NZ", "Indonesia", "UK"], correct: 1 },
  { question: "Cave of Crystals (giant gypsum) is in?", choices: ["Mexico (Naica)", "Iceland", "Russia", "USA"], correct: 0 },
  { question: "Lava tubes form by?", choices: ["Water", "Cooling lava flows", "Wind", "Tectonics"], correct: 1 },
  { question: "Sea caves form by?", choices: ["Wave erosion", "Dripping water", "Lava", "Earthquake"], correct: 0 },
  { question: "Largest known cave passage (Son Doong)?", choices: ["Vietnam", "Philippines", "Borneo", "Thailand"], correct: 0 },
  { question: "Son Doong was 'discovered' to public in?", choices: ["1991/2009", "1980", "2000", "2020"], correct: 0 },
  { question: "Carlsbad Caverns are in?", choices: ["New Mexico", "Arizona", "Texas", "Utah"], correct: 0 },
  { question: "Critical caving safety rule?", choices: ["Solo only", "Always 3+ in group", "Run", "No lights"], correct: 1 },
  { question: "'Squeeze' in caving means?", choices: ["Tight passage", "Tight lid", "Tight rope", "Cold"], correct: 0 },
  { question: "Single rope technique used for?", choices: ["Belay", "Vertical drops", "Anchors", "Tying knots"], correct: 1 },
  { question: "Light source recommended in caves?", choices: ["Single torch", "3 independent sources", "Phone only", "None"], correct: 1 },
  { question: "Cave temperature is generally?", choices: ["Highly variable", "Stable", "Always cold", "Always warm"], correct: 1 },
  { question: "Hibernating animal commonly found in caves?", choices: ["Snakes", "Bats", "Bears", "All of these"], correct: 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CaveExploreQuizSettings): CaveExploreQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CaveExploreQuizState, action: CaveExploreQuizAction): CaveExploreQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CaveExploreQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
