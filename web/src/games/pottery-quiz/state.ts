import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PotteryQuizSettings { questions: "10" | "20"; }
export interface PotteryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PotteryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Throwing pottery refers to?",
    "choices": [
      "smashing clay",
      "wheel forming",
      "glazing",
      "firing"
    ],
    "correct": 1
  },
  {
    "question": "Bisque firing is?",
    "choices": [
      "the final firing",
      "the first firing",
      "glaze firing",
      "wood firing"
    ],
    "correct": 1
  },
  {
    "question": "Clay must be ___ before firing?",
    "choices": [
      "dry",
      "wet",
      "frozen",
      "glazed"
    ],
    "correct": 0
  },
  {
    "question": "A kiln is a?",
    "choices": [
      "wheel",
      "oven",
      "mold",
      "storage"
    ],
    "correct": 1
  },
  {
    "question": "Stoneware fires at approximately?",
    "choices": [
      "500°F",
      "1200°F",
      "2200°F",
      "3500°F"
    ],
    "correct": 2
  },
  {
    "question": "Earthenware is fired at?",
    "choices": [
      "lower temps",
      "higher temps",
      "same as porcelain",
      "won't fire"
    ],
    "correct": 0
  },
  {
    "question": "Porcelain is known for being?",
    "choices": [
      "coarse",
      "translucent when thin",
      "heavy",
      "matte"
    ],
    "correct": 1
  },
  {
    "question": "Wedging removes?",
    "choices": [
      "air bubbles",
      "color",
      "glaze",
      "kiln dust"
    ],
    "correct": 0
  },
  {
    "question": "Slip is a?",
    "choices": [
      "dry powder",
      "liquid clay",
      "glaze type",
      "tool"
    ],
    "correct": 1
  },
  {
    "question": "Greenware is?",
    "choices": [
      "unfired clay",
      "glazed only",
      "fired bisque",
      "raku"
    ],
    "correct": 0
  },
  {
    "question": "Raku originated in?",
    "choices": [
      "China",
      "Japan",
      "Korea",
      "India"
    ],
    "correct": 1
  },
  {
    "question": "Coil pottery is built by?",
    "choices": [
      "throwing",
      "stacking ropes of clay",
      "molding",
      "slab"
    ],
    "correct": 1
  },
  {
    "question": "A pug mill is used to?",
    "choices": [
      "fire pottery",
      "mix clay",
      "glaze",
      "trim"
    ],
    "correct": 1
  },
  {
    "question": "Saggar firing involves?",
    "choices": [
      "enclosing pieces in containers",
      "pit firing",
      "raku only",
      "oxidation"
    ],
    "correct": 0
  },
  {
    "question": "Centering is critical when?",
    "choices": [
      "glazing",
      "wheel throwing",
      "trimming",
      "loading kiln"
    ],
    "correct": 1
  },
  {
    "question": "Ash glazes use?",
    "choices": [
      "sand",
      "plant ash",
      "oils",
      "oxides only"
    ],
    "correct": 1
  },
  {
    "question": "Cone numbers measure?",
    "choices": [
      "clay weight",
      "kiln temperature",
      "wheel speed",
      "glaze thickness"
    ],
    "correct": 1
  },
  {
    "question": "Slab construction uses?",
    "choices": [
      "coils",
      "flat sheets",
      "wheel",
      "slip casting"
    ],
    "correct": 1
  },
  {
    "question": "Sgraffito is a technique of?",
    "choices": [
      "scratching through slip",
      "throwing",
      "glazing",
      "firing"
    ],
    "correct": 0
  },
  {
    "question": "Underglaze is applied?",
    "choices": [
      "after final firing",
      "before glaze",
      "instead of glaze",
      "only on raw clay"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PotteryQuizSettings): PotteryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PotteryQuizState, action: PotteryQuizAction): PotteryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PotteryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
