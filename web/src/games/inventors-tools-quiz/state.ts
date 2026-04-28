import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface InventorsToolsQuizSettings { questions: "10" | "20" | "30"; }
export interface InventorsToolsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type InventorsToolsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Modern zipper was patented by?",
    "choices": [
      "Edison",
      "Whitcomb Judson/Sundback",
      "Bell",
      "Tesla"
    ],
    "correct": 1
  },
  {
    "question": "Velcro was invented in the?",
    "choices": [
      "1900s",
      "1940s-50s",
      "1980s",
      "2000s"
    ],
    "correct": 1
  },
  {
    "question": "Ballpoint pen popularized by?",
    "choices": [
      "Parker",
      "Biro brothers",
      "Mont Blanc",
      "Cross"
    ],
    "correct": 1
  },
  {
    "question": "Sticky notes invented by?",
    "choices": [
      "Apple",
      "3M (Spencer Silver and Art Fry)",
      "IBM",
      "Sony"
    ],
    "correct": 1
  },
  {
    "question": "Scotch tape was developed by?",
    "choices": [
      "3M",
      "DuPont",
      "GE",
      "Kodak"
    ],
    "correct": 0
  },
  {
    "question": "Lightbulb is most associated with?",
    "choices": [
      "Edison",
      "Tesla",
      "Bell",
      "Marconi"
    ],
    "correct": 0
  },
  {
    "question": "Toilet paper became commercially available in?",
    "choices": [
      "1700s",
      "1857 (Gayetty)",
      "1920s",
      "1950s"
    ],
    "correct": 1
  },
  {
    "question": "Microwave oven developed using?",
    "choices": [
      "X-rays",
      "Magnetron radar tech (Spencer)",
      "Lasers",
      "Solar cells"
    ],
    "correct": 1
  },
  {
    "question": "Refrigerator (modern compressor) refined by?",
    "choices": [
      "Whirlpool",
      "Carl von Linde",
      "Kelvinator",
      "Frigidaire"
    ],
    "correct": 1
  },
  {
    "question": "Sewing machine widely commercialized by?",
    "choices": [
      "Howe and Singer",
      "Whitney",
      "Watt",
      "Bell"
    ],
    "correct": 0
  },
  {
    "question": "Wristwatch popularized for which use?",
    "choices": [
      "Explorers",
      "Soldiers (WWI)",
      "Bankers",
      "Doctors"
    ],
    "correct": 1
  },
  {
    "question": "Vacuum cleaner inventor?",
    "choices": [
      "Booth",
      "Hoover only",
      "Dyson only",
      "Edison"
    ],
    "correct": 0
  },
  {
    "question": "Pliers and pincers date back to?",
    "choices": [
      "Roman era",
      "Ancient Egypt/Bronze Age",
      "Industrial Revolution",
      "1800s"
    ],
    "correct": 1
  },
  {
    "question": "Stapler became standardized in the?",
    "choices": [
      "1700s",
      "Late 1800s",
      "1950s",
      "2000s"
    ],
    "correct": 1
  },
  {
    "question": "Power drill (handheld electric) by?",
    "choices": [
      "Black & Decker (1917)",
      "DeWalt 1960",
      "Bosch 1980",
      "Makita 1990"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: InventorsToolsQuizSettings): InventorsToolsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: InventorsToolsQuizState, action: InventorsToolsQuizAction): InventorsToolsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: InventorsToolsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
