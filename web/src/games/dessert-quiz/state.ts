import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DessertQuizSettings { questions: "10" | "20"; }
export interface DessertQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DessertQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tiramisu is from?",
    "choices": [
      "Italy",
      "France",
      "Spain",
      "Greece"
    ],
    "correct": 0
  },
  {
    "question": "Tiramisu's main flavor is?",
    "choices": [
      "Coffee",
      "Chocolate",
      "Vanilla",
      "Lemon"
    ],
    "correct": 0
  },
  {
    "question": "Mascarpone in tiramisu is a type of?",
    "choices": [
      "Cheese",
      "Cream",
      "Yogurt",
      "Butter"
    ],
    "correct": 0
  },
  {
    "question": "Crème brûlée is famous for its?",
    "choices": [
      "Burnt sugar top",
      "Custard ribbon",
      "Pour spout",
      "Layered cream"
    ],
    "correct": 0
  },
  {
    "question": "Crème brûlée is from?",
    "choices": [
      "France",
      "Italy",
      "Spain",
      "Belgium"
    ],
    "correct": 0
  },
  {
    "question": "Panna cotta means?",
    "choices": [
      "Cooked cream",
      "Sweet cream",
      "Whipped cream",
      "Sour cream"
    ],
    "correct": 0
  },
  {
    "question": "Panna cotta is set with?",
    "choices": [
      "Gelatin",
      "Eggs",
      "Flour",
      "Cornstarch"
    ],
    "correct": 0
  },
  {
    "question": "Cheesecake's most American style is?",
    "choices": [
      "New York",
      "Boston",
      "Chicago",
      "Atlanta"
    ],
    "correct": 0
  },
  {
    "question": "Pavlova is named after?",
    "choices": [
      "A Russian ballerina",
      "A Russian tsar",
      "A Russian admiral",
      "A Russian poet"
    ],
    "correct": 0
  },
  {
    "question": "Pavlova is essentially a?",
    "choices": [
      "Meringue dessert",
      "Cake",
      "Pie",
      "Mousse"
    ],
    "correct": 0
  },
  {
    "question": "Sachertorte is from?",
    "choices": [
      "Vienna",
      "Paris",
      "Berlin",
      "Prague"
    ],
    "correct": 0
  },
  {
    "question": "Sachertorte's icing is?",
    "choices": [
      "Dark chocolate",
      "White chocolate",
      "Butter cream",
      "Caramel"
    ],
    "correct": 0
  },
  {
    "question": "Black Forest cake is from?",
    "choices": [
      "Germany",
      "Switzerland",
      "Austria",
      "France"
    ],
    "correct": 0
  },
  {
    "question": "Black Forest cake's signature fruit is?",
    "choices": [
      "Cherry",
      "Strawberry",
      "Raspberry",
      "Blueberry"
    ],
    "correct": 0
  },
  {
    "question": "Opera cake is from?",
    "choices": [
      "France",
      "Italy",
      "Austria",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Croissants originated in?",
    "choices": [
      "Austria (Vienna)",
      "France",
      "Italy",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Croissants are made with which dough?",
    "choices": [
      "Laminated",
      "Yeast bread",
      "Choux",
      "Shortcrust"
    ],
    "correct": 0
  },
  {
    "question": "Eclairs are made from which dough?",
    "choices": [
      "Choux",
      "Puff",
      "Shortcrust",
      "Brioche"
    ],
    "correct": 0
  },
  {
    "question": "Mille-feuille means?",
    "choices": [
      "Thousand sheets",
      "Sweet leaves",
      "White flower",
      "Light layer"
    ],
    "correct": 0
  },
  {
    "question": "Macarons are made from?",
    "choices": [
      "Almond flour/egg whites",
      "Wheat flour/cream",
      "Cornmeal/sugar",
      "Buckwheat/butter"
    ],
    "correct": 0
  },
  {
    "question": "Mochi is made from?",
    "choices": [
      "Glutinous rice",
      "Wheat flour",
      "Tapioca",
      "Coconut"
    ],
    "correct": 0
  },
  {
    "question": "Dorayaki is filled with?",
    "choices": [
      "Red bean paste",
      "Custard",
      "Cream",
      "Chocolate"
    ],
    "correct": 0
  },
  {
    "question": "Bingsu is a dessert from?",
    "choices": [
      "Korea",
      "Japan",
      "China",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "Halo-halo is from?",
    "choices": [
      "Philippines",
      "Japan",
      "Thailand",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "Baklava is layered with?",
    "choices": [
      "Phyllo dough",
      "Puff pastry",
      "Choux",
      "Shortcrust"
    ],
    "correct": 0
  },
  {
    "question": "Baklava is sweetened with?",
    "choices": [
      "Honey/syrup",
      "Powdered sugar",
      "Maple",
      "Stevia"
    ],
    "correct": 0
  },
  {
    "question": "Brownies originated in?",
    "choices": [
      "United States",
      "England",
      "France",
      "Italy"
    ],
    "correct": 0
  },
  {
    "question": "S'mores combine?",
    "choices": [
      "Marshmallow/chocolate/graham",
      "Marshmallow/peanut butter",
      "Cookie/jam",
      "Pretzel/caramel"
    ],
    "correct": 0
  },
  {
    "question": "Pecan pie is associated with?",
    "choices": [
      "Southern US",
      "New England",
      "Midwest",
      "West Coast"
    ],
    "correct": 0
  },
  {
    "question": "Apple pie is famously American but originated in?",
    "choices": [
      "Europe",
      "Africa",
      "Asia",
      "Polynesia"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DessertQuizSettings): DessertQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DessertQuizState, action: DessertQuizAction): DessertQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DessertQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
