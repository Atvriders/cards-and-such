import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WinePairingQuizSettings { questions: "10" | "20"; }
export interface WinePairingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WinePairingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pinot Noir traditionally pairs well with?",
    "choices": [
      "heavy steak",
      "salmon and duck",
      "spicy curry",
      "sweet desserts"
    ],
    "correct": 1
  },
  {
    "question": "Cabernet Sauvignon pairs well with?",
    "choices": [
      "white fish",
      "grilled red meat",
      "oysters",
      "fruit salad"
    ],
    "correct": 1
  },
  {
    "question": "Chardonnay (oaked) pairs with?",
    "choices": [
      "sushi",
      "buttery lobster",
      "spicy tacos",
      "chocolate"
    ],
    "correct": 1
  },
  {
    "question": "Sauvignon Blanc is a classic match for?",
    "choices": [
      "red meat",
      "goat cheese and salads",
      "steak",
      "duck"
    ],
    "correct": 1
  },
  {
    "question": "Champagne is famously paired with?",
    "choices": [
      "red meat",
      "oysters and caviar",
      "spicy chili",
      "brownies"
    ],
    "correct": 1
  },
  {
    "question": "Riesling (off-dry) pairs nicely with?",
    "choices": [
      "plain chicken",
      "spicy Asian food",
      "aged beef",
      "port wine"
    ],
    "correct": 1
  },
  {
    "question": "Malbec pairs traditionally with?",
    "choices": [
      "white fish",
      "Argentine steak",
      "sushi",
      "fruit"
    ],
    "correct": 1
  },
  {
    "question": "Tannins in red wine help cut through?",
    "choices": [
      "sweetness",
      "fat in food",
      "spice",
      "saltiness"
    ],
    "correct": 1
  },
  {
    "question": "Sweet wines are typically paired with?",
    "choices": [
      "spicy food",
      "desserts",
      "red meat",
      "oysters"
    ],
    "correct": 1
  },
  {
    "question": "Sancerre is made primarily from?",
    "choices": [
      "Chardonnay",
      "Sauvignon Blanc",
      "Riesling",
      "Pinot Gris"
    ],
    "correct": 1
  },
  {
    "question": "Chianti pairs classically with?",
    "choices": [
      "sushi",
      "tomato-based pasta",
      "oysters",
      "cheesecake"
    ],
    "correct": 1
  },
  {
    "question": "Port wine commonly accompanies?",
    "choices": [
      "seafood",
      "blue cheese",
      "salads",
      "chicken"
    ],
    "correct": 1
  },
  {
    "question": "Ros\u00e9 is well-suited to?",
    "choices": [
      "heavy stew",
      "summer salads",
      "hot soup",
      "red meat"
    ],
    "correct": 1
  },
  {
    "question": "Gew\u00fcrztraminer's spicy notes pair with?",
    "choices": [
      "plain chicken",
      "Indian curry",
      "oysters",
      "cheesecake"
    ],
    "correct": 1
  },
  {
    "question": "Acidity in wine helps pair with?",
    "choices": [
      "fatty foods",
      "sweet only",
      "spicy only",
      "bland foods"
    ],
    "correct": 0
  },
  {
    "question": "Bordeaux blends often pair with?",
    "choices": [
      "white fish",
      "lamb",
      "oysters",
      "fruit"
    ],
    "correct": 1
  },
  {
    "question": "Albari\u00f1o pairs well with?",
    "choices": [
      "red meat",
      "seafood",
      "spicy chili",
      "chocolate"
    ],
    "correct": 1
  },
  {
    "question": "Zinfandel pairs with?",
    "choices": [
      "raw fish",
      "barbecue",
      "oysters",
      "white asparagus"
    ],
    "correct": 1
  },
  {
    "question": "Sparkling wine cleanses the palate of?",
    "choices": [
      "sweet",
      "fried foods",
      "spicy",
      "raw"
    ],
    "correct": 1
  },
  {
    "question": "Sauternes is famously paired with?",
    "choices": [
      "steak",
      "foie gras",
      "salad",
      "sushi"
    ],
    "correct": 1
  },
  {
    "question": "Tempranillo (Rioja) pairs with?",
    "choices": [
      "seafood",
      "lamb and tapas",
      "sushi",
      "cheesecake"
    ],
    "correct": 1
  },
  {
    "question": "Beaujolais Nouveau is best with?",
    "choices": [
      "heavy stews",
      "light dishes/turkey",
      "steak",
      "rich sauces"
    ],
    "correct": 1
  },
  {
    "question": "Sherry (fino) pairs with?",
    "choices": [
      "red meat",
      "tapas and almonds",
      "desserts",
      "chocolate"
    ],
    "correct": 1
  },
  {
    "question": "White Burgundy is made from?",
    "choices": [
      "Pinot Noir",
      "Chardonnay",
      "Sauvignon Blanc",
      "Riesling"
    ],
    "correct": 1
  },
  {
    "question": "The 'fifth taste' that often clashes with wine is?",
    "choices": [
      "sweet",
      "umami",
      "sour",
      "salty"
    ],
    "correct": 1
  },
  {
    "question": "Syrah/Shiraz pairs with?",
    "choices": [
      "white fish",
      "grilled lamb",
      "oysters",
      "fruit"
    ],
    "correct": 1
  },
  {
    "question": "Pinot Grigio is typically?",
    "choices": [
      "heavy red",
      "light white",
      "sweet dessert",
      "sparkling"
    ],
    "correct": 1
  },
  {
    "question": "'Decanting' wine helps with?",
    "choices": [
      "chilling",
      "aeration",
      "filtering yeast",
      "carbonating"
    ],
    "correct": 1
  },
  {
    "question": "Ice wine pairs with?",
    "choices": [
      "red meat",
      "fruit desserts",
      "oysters",
      "steak"
    ],
    "correct": 1
  },
  {
    "question": "Madeira is a fortified wine from?",
    "choices": [
      "Spain",
      "Portugal",
      "Italy",
      "France"
    ],
    "correct": 1
  },
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
