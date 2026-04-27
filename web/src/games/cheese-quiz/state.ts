import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CheeseQuizSettings { questions: "10" | "20"; }
export interface CheeseQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CheeseQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Parmigiano-Reggiano is from which country?",
    "choices": [
      "Italy",
      "France",
      "Spain",
      "Greece"
    ],
    "correct": 0
  },
  {
    "question": "Parmigiano-Reggiano is made from?",
    "choices": [
      "Cow milk",
      "Goat milk",
      "Sheep milk",
      "Buffalo milk"
    ],
    "correct": 0
  },
  {
    "question": "Pecorino is made from?",
    "choices": [
      "Sheep milk",
      "Cow milk",
      "Goat milk",
      "Buffalo milk"
    ],
    "correct": 0
  },
  {
    "question": "Manchego is from which country?",
    "choices": [
      "Spain",
      "Italy",
      "Portugal",
      "France"
    ],
    "correct": 0
  },
  {
    "question": "Manchego is made from?",
    "choices": [
      "Sheep milk",
      "Cow milk",
      "Goat milk",
      "Buffalo milk"
    ],
    "correct": 0
  },
  {
    "question": "Cheddar originated in?",
    "choices": [
      "England",
      "France",
      "Italy",
      "Holland"
    ],
    "correct": 0
  },
  {
    "question": "Brie is from?",
    "choices": [
      "France",
      "Italy",
      "Switzerland",
      "Belgium"
    ],
    "correct": 0
  },
  {
    "question": "Camembert is also from?",
    "choices": [
      "France",
      "Italy",
      "Spain",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Brie and Camembert are which style?",
    "choices": [
      "Soft-ripened",
      "Hard",
      "Blue",
      "Washed-rind"
    ],
    "correct": 0
  },
  {
    "question": "Roquefort is which style?",
    "choices": [
      "Blue",
      "Hard",
      "Soft",
      "Stretched curd"
    ],
    "correct": 0
  },
  {
    "question": "Roquefort is made from?",
    "choices": [
      "Sheep milk",
      "Cow milk",
      "Goat milk",
      "Buffalo milk"
    ],
    "correct": 0
  },
  {
    "question": "Stilton is from?",
    "choices": [
      "England",
      "France",
      "Italy",
      "Holland"
    ],
    "correct": 0
  },
  {
    "question": "Gorgonzola is from?",
    "choices": [
      "Italy",
      "France",
      "Spain",
      "Greece"
    ],
    "correct": 0
  },
  {
    "question": "Mozzarella di bufala uses milk from?",
    "choices": [
      "Water buffalo",
      "Sheep",
      "Cow",
      "Goat"
    ],
    "correct": 0
  },
  {
    "question": "Halloumi is famous for being?",
    "choices": [
      "Grillable",
      "Spicy",
      "Sweet",
      "Bitter"
    ],
    "correct": 0
  },
  {
    "question": "Halloumi is from which region?",
    "choices": [
      "Cyprus",
      "Greece",
      "Italy",
      "France"
    ],
    "correct": 0
  },
  {
    "question": "Feta is from?",
    "choices": [
      "Greece",
      "Italy",
      "Spain",
      "Turkey"
    ],
    "correct": 0
  },
  {
    "question": "Feta is made from?",
    "choices": [
      "Sheep/goat milk",
      "Cow milk only",
      "Buffalo only",
      "Yak"
    ],
    "correct": 0
  },
  {
    "question": "Gruyere is from?",
    "choices": [
      "Switzerland",
      "France",
      "Italy",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Emmental is famous for?",
    "choices": [
      "Holes",
      "Blue veins",
      "Black rind",
      "Smoky flavor"
    ],
    "correct": 0
  },
  {
    "question": "Gouda is from?",
    "choices": [
      "Netherlands",
      "Belgium",
      "Germany",
      "France"
    ],
    "correct": 0
  },
  {
    "question": "Edam is from?",
    "choices": [
      "Netherlands",
      "Belgium",
      "Germany",
      "Switzerland"
    ],
    "correct": 0
  },
  {
    "question": "Limburger is famous for?",
    "choices": [
      "Strong odor",
      "Blue veins",
      "Holes",
      "Black rind"
    ],
    "correct": 0
  },
  {
    "question": "Epoisses is what style?",
    "choices": [
      "Washed-rind",
      "Hard",
      "Blue",
      "Stretched curd"
    ],
    "correct": 0
  },
  {
    "question": "Taleggio is what style?",
    "choices": [
      "Washed-rind",
      "Hard",
      "Blue",
      "Stretched curd"
    ],
    "correct": 0
  },
  {
    "question": "Provolone is what style?",
    "choices": [
      "Stretched curd",
      "Soft",
      "Blue",
      "Hard aged"
    ],
    "correct": 0
  },
  {
    "question": "Aged cheddar wheels are typically aged?",
    "choices": [
      "6 months to 5+ years",
      "2 weeks",
      "1 week",
      "20+ years"
    ],
    "correct": 0
  },
  {
    "question": "Cottage cheese is which style?",
    "choices": [
      "Fresh curd",
      "Aged",
      "Blue",
      "Smoked"
    ],
    "correct": 0
  },
  {
    "question": "Mascarpone is famous in which dessert?",
    "choices": [
      "Tiramisu",
      "Crème brûlée",
      "Cheesecake",
      "Trifle"
    ],
    "correct": 0
  },
  {
    "question": "Ricotta is made from?",
    "choices": [
      "Whey",
      "Curd",
      "Cream only",
      "Buttermilk"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CheeseQuizSettings): CheeseQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CheeseQuizState, action: CheeseQuizAction): CheeseQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CheeseQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
