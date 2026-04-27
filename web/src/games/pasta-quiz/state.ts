import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PastaQuizSettings { questions: "10" | "20"; }
export interface PastaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PastaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Spaghetti shape is best described as?",
    "choices": [
      "Long thin string",
      "Tube",
      "Spiral",
      "Bow"
    ],
    "correct": 0
  },
  {
    "question": "Penne is shaped like?",
    "choices": [
      "Tube cut diagonally",
      "Long ribbon",
      "Spiral",
      "Shell"
    ],
    "correct": 0
  },
  {
    "question": "Fusilli is what shape?",
    "choices": [
      "Spiral",
      "Tube",
      "Long",
      "Stuffed"
    ],
    "correct": 0
  },
  {
    "question": "Farfalle means?",
    "choices": [
      "Butterflies",
      "Bows",
      "Shells",
      "Tubes"
    ],
    "correct": 0
  },
  {
    "question": "Rigatoni differs from penne in being?",
    "choices": [
      "Bigger ridged tube",
      "Shorter",
      "Smoother",
      "Twisted"
    ],
    "correct": 0
  },
  {
    "question": "Linguine is shaped like?",
    "choices": [
      "Flat narrow ribbon",
      "Round string",
      "Tube",
      "Bow"
    ],
    "correct": 0
  },
  {
    "question": "Fettuccine is wider than?",
    "choices": [
      "Tagliatelle",
      "Linguine",
      "Pappardelle",
      "Vermicelli"
    ],
    "correct": 1
  },
  {
    "question": "Pappardelle is best described as?",
    "choices": [
      "Wide flat ribbons",
      "Tube",
      "Spiral",
      "Tiny grain"
    ],
    "correct": 0
  },
  {
    "question": "Orzo resembles which grain?",
    "choices": [
      "Rice",
      "Barley",
      "Wheat",
      "Quinoa"
    ],
    "correct": 0
  },
  {
    "question": "Bucatini is unique because it has?",
    "choices": [
      "Hollow center",
      "Spiral",
      "Bows",
      "Filling"
    ],
    "correct": 0
  },
  {
    "question": "Ravioli is typically?",
    "choices": [
      "Stuffed",
      "Fried",
      "Long",
      "Tube"
    ],
    "correct": 0
  },
  {
    "question": "Tortellini originated in?",
    "choices": [
      "Bologna region",
      "Naples",
      "Sicily",
      "Venice"
    ],
    "correct": 0
  },
  {
    "question": "Cacio e pepe sauce uses?",
    "choices": [
      "Pecorino & black pepper",
      "Tomato",
      "Cream",
      "Pesto"
    ],
    "correct": 0
  },
  {
    "question": "Bolognese sauce is a slow-cooked?",
    "choices": [
      "Meat ragu",
      "Tomato cream",
      "Pesto",
      "Garlic oil"
    ],
    "correct": 0
  },
  {
    "question": "Pesto Genovese contains?",
    "choices": [
      "Basil/pine nuts/cheese",
      "Tomato/basil",
      "Cream/pancetta",
      "Olive oil/garlic only"
    ],
    "correct": 0
  },
  {
    "question": "Carbonara is made with?",
    "choices": [
      "Eggs/cheese/guanciale",
      "Cream/bacon",
      "Tomato/cream",
      "Pesto/cream"
    ],
    "correct": 0
  },
  {
    "question": "Arrabbiata sauce is famously?",
    "choices": [
      "Spicy",
      "Creamy",
      "Sweet",
      "Cold"
    ],
    "correct": 0
  },
  {
    "question": "Amatriciana includes?",
    "choices": [
      "Tomato/guanciale/cheese",
      "Cream/mushroom",
      "Pesto/garlic",
      "Cheese only"
    ],
    "correct": 0
  },
  {
    "question": "Vongole sauce contains?",
    "choices": [
      "Clams",
      "Octopus",
      "Shrimp",
      "Crab"
    ],
    "correct": 0
  },
  {
    "question": "Gnocchi are typically made from?",
    "choices": [
      "Potato",
      "Rice",
      "Corn",
      "Yam"
    ],
    "correct": 0
  },
  {
    "question": "Orecchiette means?",
    "choices": [
      "Little ears",
      "Little stars",
      "Little bows",
      "Little tubes"
    ],
    "correct": 0
  },
  {
    "question": "Conchiglie are shaped like?",
    "choices": [
      "Shells",
      "Bows",
      "Spirals",
      "Stars"
    ],
    "correct": 0
  },
  {
    "question": "Cannelloni are large?",
    "choices": [
      "Tubes filled",
      "Sheets layered",
      "Spirals",
      "Tiny grains"
    ],
    "correct": 0
  },
  {
    "question": "Lasagna is built with?",
    "choices": [
      "Layered sheets",
      "Long strings",
      "Tubes",
      "Bows"
    ],
    "correct": 0
  },
  {
    "question": "Vermicelli is thinner than?",
    "choices": [
      "Spaghetti",
      "Bucatini",
      "Linguine",
      "Pappardelle"
    ],
    "correct": 0
  },
  {
    "question": "Capellini is also known as?",
    "choices": [
      "Angel hair",
      "Bow tie",
      "Star",
      "Shell"
    ],
    "correct": 0
  },
  {
    "question": "Pici is a thick hand-rolled pasta from?",
    "choices": [
      "Tuscany",
      "Sicily",
      "Veneto",
      "Campania"
    ],
    "correct": 0
  },
  {
    "question": "Trofie pasta is famously paired with?",
    "choices": [
      "Pesto",
      "Tomato",
      "Cream",
      "Vongole"
    ],
    "correct": 0
  },
  {
    "question": "Al dente means?",
    "choices": [
      "To the tooth",
      "Well done",
      "Boiled",
      "Soft"
    ],
    "correct": 0
  },
  {
    "question": "Italian families often serve pasta as a?",
    "choices": [
      "First course (primo)",
      "Main course",
      "Dessert",
      "Side"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PastaQuizSettings): PastaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PastaQuizState, action: PastaQuizAction): PastaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PastaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
