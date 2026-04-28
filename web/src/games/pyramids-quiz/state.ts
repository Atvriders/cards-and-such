import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PyramidsQuizSettings { questions: "10" | "20"; }
export interface PyramidsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PyramidsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where are the most famous pyramids located?", choices: ["Giza, Egypt", "Athens, Greece", "Tehran, Iran", "Luxor, Egypt"], correct: 0 },
  { question: "Which is the largest of the Egyptian pyramids?", choices: ["Pyramid of Khafre", "Great Pyramid of Khufu", "Pyramid of Menkaure", "Step Pyramid"], correct: 1 },
  { question: "When was the Great Pyramid of Giza built?", choices: ["~4500 BC", "~2580 BC", "~1500 BC", "~500 BC"], correct: 1 },
  { question: "Who was the Great Pyramid built for?", choices: ["Tutankhamun", "Khufu (Cheops)", "Ramesses II", "Cleopatra"], correct: 1 },
  { question: "How tall was the Great Pyramid originally?", choices: ["~80m", "~146m", "~250m", "~400m"], correct: 1 },
  { question: "How long was the Great Pyramid the world's tallest building?", choices: ["100 years", "1,000 years", "3,800+ years", "5,000 years"], correct: 2 },
  { question: "Approximately how many limestone blocks were used?", choices: ["~50K", "~500K", "~2.3M", "~10M"], correct: 2 },
  { question: "Who is generally believed to have built the pyramids?", choices: ["Slaves", "Skilled paid workers", "Aliens", "Romans"], correct: 1 },
  { question: "Which pyramid is the oldest?", choices: ["Step Pyramid of Djoser", "Khufu", "Khafre", "Bent Pyramid"], correct: 0 },
  { question: "Where is the Step Pyramid located?", choices: ["Saqqara", "Giza", "Luxor", "Aswan"], correct: 0 },
  { question: "What is on top of the Pyramid of Khafre?", choices: ["Capstone", "Original limestone casing", "Gold tip", "Nothing remains"], correct: 1 },
  { question: "What animal is the Sphinx near the pyramids?", choices: ["Lion body, human head", "Eagle body, lion head", "Horse body, human head", "Bull body, human head"], correct: 0 },
  { question: "Which pharaoh's likeness is on the Great Sphinx?", choices: ["Khufu", "Khafre", "Menkaure", "Ramesses"], correct: 1 },
  { question: "What is one of the pyramids' main internal features?", choices: ["Burial chambers", "Workshops", "Hospitals", "Schools"], correct: 0 },
  { question: "Which complex has 3 main pyramids and 6 smaller ones?", choices: ["Saqqara", "Giza", "Memphis", "Luxor"], correct: 1 },
  { question: "How long did it take to build the Great Pyramid (estimated)?", choices: ["5 years", "20 years", "50 years", "100 years"], correct: 1 },
  { question: "Which civilization also built pyramids in the Americas?", choices: ["Maya and Aztec", "Inuit", "Roman", "Inca only"], correct: 0 },
  { question: "Which is one of the Seven Wonders of the Ancient World?", choices: ["Great Pyramid of Giza", "Stonehenge", "Mt. Olympus", "Eiffel Tower"], correct: 0 },
  { question: "Of the Seven Ancient Wonders, which still stands?", choices: ["Hanging Gardens", "Lighthouse of Alexandria", "Great Pyramid of Giza", "Colossus of Rhodes"], correct: 2 },
  { question: "How accurately is the Great Pyramid aligned to true north?", choices: ["~1°", "~10°", "~30°", "Random"], correct: 0 }
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
