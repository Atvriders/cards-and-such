import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PyramidsQuizSettings { questions: "10" | "20"; }
export interface PyramidsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PyramidsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where are the Great Pyramids located?", choices: ["Cairo", "Giza", "Luxor", "Alexandria"], correct: 1 },
  { question: "Tallest of the Giza pyramids?", choices: ["Khufu", "Khafre", "Menkaure", "Djoser"], correct: 0 },
  { question: "Approximate original height of Great Pyramid?", choices: ["~100 m", "~147 m", "~200 m", "~250 m"], correct: 1 },
  { question: "Years to build the Great Pyramid (estimate)?", choices: ["~5", "~20", "~80", "~200"], correct: 1 },
  { question: "Material used for the pyramid core?", choices: ["Granite", "Limestone", "Sandstone", "Basalt"], correct: 1 },
  { question: "Who built the Great Pyramid?", choices: ["Slaves only", "Skilled paid laborers", "Foreign captives", "Hyksos"], correct: 1 },
  { question: "Pharaoh of the Great Pyramid?", choices: ["Khufu", "Khafre", "Tutankhamun", "Ramesses II"], correct: 0 },
  { question: "The Sphinx most likely represents which pharaoh?", choices: ["Khufu", "Khafre", "Menkaure", "Sneferu"], correct: 1 },
  { question: "What is the Sphinx's body shaped like?", choices: ["Lion", "Bull", "Crocodile", "Ram"], correct: 0 },
  { question: "Approximate weight of an average pyramid block?", choices: ["1 t", "2.5 t", "10 t", "50 t"], correct: 1 },
  { question: "Number of stone blocks in the Great Pyramid (approx)?", choices: ["~200,000", "~2.3 million", "~10 million", "~50 million"], correct: 1 },
  { question: "Original outer casing material?", choices: ["Limestone (Tura)", "Marble", "Granite", "Gold leaf"], correct: 0 },
  { question: "Granite used inside came from?", choices: ["Aswan", "Sinai", "Luxor", "Nubia"], correct: 0 },
  { question: "Smallest of the three Giza pyramids?", choices: ["Khufu", "Khafre", "Menkaure", "Djoser"], correct: 2 },
  { question: "Step pyramid at Saqqara built for?", choices: ["Khufu", "Djoser", "Sneferu", "Khafre"], correct: 1 },
  { question: "Architect of the Step Pyramid?", choices: ["Imhotep", "Hemiunu", "Senenmut", "Ineni"], correct: 0 },
  { question: "Pyramid at Meidum is famous for?", choices: ["Collapse", "Tallest", "Underground river", "Hidden city"], correct: 0 },
  { question: "Bent Pyramid is associated with?", choices: ["Khufu", "Sneferu", "Khafre", "Menkaure"], correct: 1 },
  { question: "Pyramids align approximately with which compass direction?", choices: ["North", "East", "South", "West"], correct: 0 },
  { question: "Inside the Great Pyramid: King's, Queen's, and?", choices: ["Servant's chamber", "Subterranean chamber", "Sun chamber", "Star chamber"], correct: 1 },
  { question: "The Grand Gallery is part of which pyramid?", choices: ["Khafre", "Menkaure", "Khufu", "Djoser"], correct: 2 },
  { question: "Robotic exploration in 2010s found what behind shafts?", choices: ["Hidden corridor", "Books", "Treasure", "Mummy"], correct: 0 },
  { question: "Year Great Pyramid considered completed (approx)?", choices: ["~3500 BCE", "~2560 BCE", "~1500 BCE", "~500 BCE"], correct: 1 },
  { question: "Which Wonder of the Ancient World still stands?", choices: ["Hanging Gardens", "Colossus", "Great Pyramid", "Pharos"], correct: 2 },
  { question: "Sphinx's nose was famously?", choices: ["Repaired", "Lost", "Painted", "Always missing"], correct: 1 },
  { question: "Which Khufu artifact was buried beside his pyramid?", choices: ["Solar boat", "Throne", "Crown", "Sword"], correct: 0 },
  { question: "Pyramid texts first appear in which dynasty?", choices: ["3rd", "5th", "12th", "18th"], correct: 1 },
  { question: "River Nile's role in pyramid construction?", choices: ["Drinking only", "Stone transport", "Fishing", "Farming only"], correct: 1 },
  { question: "Pyramid base length (Great Pyramid, approx)?", choices: ["~100 m", "~150 m", "~230 m", "~400 m"], correct: 2 },
  { question: "What modern city sits next to the pyramids?", choices: ["Cairo", "Luxor", "Aswan", "Memphis"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PyramidsQuizSettings): PyramidsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PyramidsQuizState, action: PyramidsQuizAction): PyramidsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PyramidsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
