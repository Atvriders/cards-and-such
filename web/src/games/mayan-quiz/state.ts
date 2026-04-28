import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MayanQuizSettings { questions: "10" | "20" | "30"; }
export interface MayanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MayanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Mayans lived primarily in?",
    "choices": [
      "Andes",
      "Mesoamerica (Yucatan/Guatemala)",
      "Brazil",
      "North America Plains"
    ],
    "correct": 1
  },
  {
    "question": "Mayan classic period was approx?",
    "choices": [
      "500 BCE-200 CE",
      "250-900 CE",
      "1000-1500 CE",
      "1500-1800 CE"
    ],
    "correct": 1
  },
  {
    "question": "Mayan writing was?",
    "choices": [
      "Cuneiform",
      "Hieroglyphic logosyllabic",
      "Alphabet",
      "Pictographic only"
    ],
    "correct": 1
  },
  {
    "question": "Mayan number system was base?",
    "choices": [
      "10",
      "20 (vigesimal)",
      "12",
      "60"
    ],
    "correct": 1
  },
  {
    "question": "Famous Mayan city with the Pyramid of Kukulcan?",
    "choices": [
      "Tikal",
      "Chichen Itza",
      "Palenque",
      "Copan"
    ],
    "correct": 1
  },
  {
    "question": "Mayan staple crop?",
    "choices": [
      "Wheat",
      "Maize",
      "Rice",
      "Potato"
    ],
    "correct": 1
  },
  {
    "question": "Mayans developed accurate?",
    "choices": [
      "Compasses",
      "Calendars",
      "Steam engines",
      "Telescopes"
    ],
    "correct": 1
  },
  {
    "question": "Long Count is part of the Mayan?",
    "choices": [
      "Religion",
      "Calendar system",
      "Architecture",
      "Diet"
    ],
    "correct": 1
  },
  {
    "question": "Pop Vuh is a?",
    "choices": [
      "City",
      "Sacred Mayan text",
      "Ruler",
      "Game"
    ],
    "correct": 1
  },
  {
    "question": "Mayan ball game involved a?",
    "choices": [
      "Wooden bat",
      "Hard rubber ball through stone hoops",
      "Net",
      "Bow"
    ],
    "correct": 1
  },
  {
    "question": "Tikal is in modern-day?",
    "choices": [
      "Mexico",
      "Guatemala",
      "Honduras",
      "Belize"
    ],
    "correct": 1
  },
  {
    "question": "Pacal the Great ruled?",
    "choices": [
      "Tikal",
      "Palenque",
      "Copan",
      "Calakmul"
    ],
    "correct": 1
  },
  {
    "question": "Mayan civilization declined around?",
    "choices": [
      "200 CE",
      "900 CE",
      "1500 CE",
      "1700 CE"
    ],
    "correct": 1
  },
  {
    "question": "Mayan priests practiced?",
    "choices": [
      "Astronomy",
      "Genetics",
      "Industry",
      "Banking"
    ],
    "correct": 0
  },
  {
    "question": "Mayan god of maize?",
    "choices": [
      "Itzamna",
      "Hun Hunahpu",
      "Chaac",
      "Kukulcan"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MayanQuizSettings): MayanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MayanQuizState, action: MayanQuizAction): MayanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MayanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
