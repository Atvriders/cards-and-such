import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SevenSummitsQuizSettings { questions: "10" | "20" | "30"; }
export interface SevenSummitsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SevenSummitsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many continents in the Seven Summits list?", choices: ["5", "6", "7", "8"], correct: 2 },
  { question: "Highest peak in Asia (Seven Summits)?", choices: ["K2", "Everest", "Kangchenjunga", "Lhotse"], correct: 1 },
  { question: "Highest peak in South America?", choices: ["Aconcagua", "Huascar\u00e1n", "Chimborazo", "Ojos del Salado"], correct: 0 },
  { question: "Country of Aconcagua?", choices: ["Chile", "Peru", "Argentina", "Bolivia"], correct: 2 },
  { question: "Highest peak in North America?", choices: ["Mt. Whitney", "Denali", "Logan", "Pico de Orizaba"], correct: 1 },
  { question: "Former name of Denali?", choices: ["Mt. McKinley", "Mt. Hubbard", "Mt. Foraker", "Mt. Roosevelt"], correct: 0 },
  { question: "Highest peak in Africa?", choices: ["Mt. Kenya", "Kilimanjaro", "Ras Dashen", "Stanley"], correct: 1 },
  { question: "Country of Kilimanjaro?", choices: ["Kenya", "Tanzania", "Uganda", "Ethiopia"], correct: 1 },
  { question: "Highest peak in Europe?", choices: ["Mont Blanc", "Elbrus", "Matterhorn", "Dufourspitze"], correct: 1 },
  { question: "Country of Mt. Elbrus?", choices: ["Georgia", "Russia", "Turkey", "Ukraine"], correct: 1 },
  { question: "Highest peak in Antarctica?", choices: ["Mt. Erebus", "Vinson Massif", "Mt. Tyree", "Sidley"], correct: 1 },
  { question: "Highest peak in Oceania (Carstensz list)?", choices: ["Mt. Wilhelm", "Carstensz Pyramid", "Mauna Kea", "Mt. Cook"], correct: 1 },
  { question: "Carstensz Pyramid country?", choices: ["Australia", "Indonesia", "PNG", "Fiji"], correct: 1 },
  { question: "Highest peak in Australia (Kosciuszko list)?", choices: ["Mt. Kosciuszko", "Mt. Cook", "Mt. Townsend", "Mt. Bogong"], correct: 0 },
  { question: "First to complete Seven Summits (Bass list)?", choices: ["Pat Morrow", "Dick Bass", "Reinhold Messner", "Junko Tabei"], correct: 1 },
  { question: "First to complete Messner list (with Carstensz)?", choices: ["Pat Morrow", "Dick Bass", "Messner", "Norgay"], correct: 0 },
  { question: "Approx height of Aconcagua?", choices: ["~5,000 m", "~6,961 m", "~7,800 m", "~8,200 m"], correct: 1 },
  { question: "Approx height of Denali?", choices: ["~5,000 m", "~6,190 m", "~7,200 m", "~8,000 m"], correct: 1 },
  { question: "Approx height of Kilimanjaro?", choices: ["~4,500 m", "~5,895 m", "~6,500 m", "~7,200 m"], correct: 1 },
  { question: "Approx height of Vinson Massif?", choices: ["~3,500 m", "~4,892 m", "~5,500 m", "~6,500 m"], correct: 1 },
  { question: "Approx height of Elbrus?", choices: ["~5,642 m", "~6,000 m", "~4,500 m", "~7,000 m"], correct: 0 },
  { question: "Approx height of Carstensz Pyramid?", choices: ["~4,000 m", "~4,884 m", "~5,500 m", "~6,200 m"], correct: 1 },
  { question: "Kilimanjaro is what type of mountain?", choices: ["Volcano (dormant)", "Folded", "Plateau", "Plug"], correct: 0 },
  { question: "Aconcagua is in which range?", choices: ["Rockies", "Andes", "Atlas", "Urals"], correct: 1 },
  { question: "Which Seven Summit is closest to ocean?", choices: ["Denali", "Vinson", "Kilimanjaro", "Carstensz"], correct: 3 },
  { question: "First woman to complete Seven Summits?", choices: ["Junko Tabei", "Wanda Rutkiewicz", "Vera Komarkova", "Sharon Wood"], correct: 0 },
  { question: "Most popular guided Seven Summit?", choices: ["Vinson", "Kilimanjaro", "Everest", "Aconcagua"], correct: 1 },
  { question: "Which Seven Summit has the worst weather statistically?", choices: ["Vinson", "Denali", "Aconcagua", "Carstensz"], correct: 1 },
  { question: "Mountain on the equator in this list?", choices: ["Kilimanjaro", "Carstensz Pyramid", "Both", "Neither"], correct: 2 },
  { question: "Which Seven Summit is technically hardest (rock)?", choices: ["Carstensz Pyramid", "Kilimanjaro", "Elbrus", "Kosciuszko"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SevenSummitsQuizSettings): SevenSummitsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SevenSummitsQuizState, action: SevenSummitsQuizAction): SevenSummitsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SevenSummitsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
