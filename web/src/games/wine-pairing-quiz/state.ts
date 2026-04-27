import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WinePairingQuizSettings { questions: "10" | "20"; }
export interface WinePairingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WinePairingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which wine pairs best with steak?",
    "choices": [
      "Riesling",
      "Cabernet Sauvignon",
      "Pinot Grigio",
      "Champagne"
    ],
    "correct": 1
  },
  {
    "question": "Sushi pairs well with?",
    "choices": [
      "Cabernet",
      "Sauvignon Blanc",
      "Port",
      "Malbec"
    ],
    "correct": 1
  },
  {
    "question": "Champagne is from?",
    "choices": [
      "Italy",
      "France",
      "Spain",
      "Germany"
    ],
    "correct": 1
  },
  {
    "question": "Riesling is often described as?",
    "choices": [
      "sweet/aromatic",
      "dry oaky",
      "bold tannic",
      "earthy"
    ],
    "correct": 0
  },
  {
    "question": "Chianti is from?",
    "choices": [
      "France",
      "Tuscany",
      "Spain",
      "Portugal"
    ],
    "correct": 1
  },
  {
    "question": "Pinot Noir pairs nicely with?",
    "choices": [
      "mushroom dishes",
      "very spicy curry",
      "ice cream",
      "chocolate cake"
    ],
    "correct": 0
  },
  {
    "question": "Tannins are most associated with?",
    "choices": [
      "red wine",
      "sparkling wine",
      "white wine",
      "rosé"
    ],
    "correct": 0
  },
  {
    "question": "Sauvignon Blanc has notes of?",
    "choices": [
      "chocolate",
      "grass/citrus",
      "leather",
      "smoke"
    ],
    "correct": 1
  },
  {
    "question": "Bordeaux is famous for?",
    "choices": [
      "sparkling wine",
      "red blends",
      "Riesling",
      "Port"
    ],
    "correct": 1
  },
  {
    "question": "Which grape makes Chablis?",
    "choices": [
      "Chardonnay",
      "Riesling",
      "Pinot Gris",
      "Sauvignon Blanc"
    ],
    "correct": 0
  },
  {
    "question": "Port wine is from?",
    "choices": [
      "Spain",
      "Portugal",
      "France",
      "Italy"
    ],
    "correct": 1
  },
  {
    "question": "Fish typically pairs with?",
    "choices": [
      "red wine",
      "white wine",
      "port",
      "fortified wine"
    ],
    "correct": 1
  },
  {
    "question": "Malbec is most associated with?",
    "choices": [
      "Chile",
      "Argentina",
      "Australia",
      "France"
    ],
    "correct": 1
  },
  {
    "question": "Brut means?",
    "choices": [
      "sweet",
      "dry",
      "off-dry",
      "fruity"
    ],
    "correct": 1
  },
  {
    "question": "Decanting helps wine to?",
    "choices": [
      "chill",
      "aerate",
      "heat",
      "sweeten"
    ],
    "correct": 1
  },
  {
    "question": "Tempranillo is from?",
    "choices": [
      "Spain",
      "Italy",
      "France",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Pizza pairs well with?",
    "choices": [
      "Chianti",
      "Sauternes",
      "Sherry",
      "Madeira"
    ],
    "correct": 0
  },
  {
    "question": "Ice wine is harvested?",
    "choices": [
      "in summer",
      "while frozen",
      "early spring",
      "by night only"
    ],
    "correct": 1
  },
  {
    "question": "Aging in oak adds?",
    "choices": [
      "acidity",
      "vanilla/spice",
      "sugar",
      "tannin reduction"
    ],
    "correct": 1
  },
  {
    "question": "Rosé color comes from?",
    "choices": [
      "mixing red & white",
      "brief grape skin contact",
      "cherries",
      "food coloring"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WinePairingQuizSettings): WinePairingQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WinePairingQuizState, action: WinePairingQuizAction): WinePairingQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WinePairingQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
