import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BBQQuizSettings { questions: "10" | "20"; }
export interface BBQQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BBQQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Texas BBQ is most famous for?",
    "choices": [
      "Beef brisket",
      "Pulled pork",
      "Whole hog",
      "Burnt ends"
    ],
    "correct": 0
  },
  {
    "question": "Burnt ends originated in?",
    "choices": [
      "Kansas City",
      "Memphis",
      "Texas",
      "Carolinas"
    ],
    "correct": 0
  },
  {
    "question": "Memphis is famous for?",
    "choices": [
      "Dry-rubbed ribs",
      "Beef brisket",
      "Mustard pork",
      "Whole hog"
    ],
    "correct": 0
  },
  {
    "question": "Eastern Carolina BBQ traditionally cooks?",
    "choices": [
      "Whole hog",
      "Brisket",
      "Burnt ends",
      "Tri-tip"
    ],
    "correct": 0
  },
  {
    "question": "South Carolina is known for what unique sauce?",
    "choices": [
      "Mustard",
      "Vinegar",
      "Ketchup",
      "Cream"
    ],
    "correct": 0
  },
  {
    "question": "Western North Carolina sauce is?",
    "choices": [
      "Vinegar/tomato",
      "Mustard",
      "Mayo",
      "White wine"
    ],
    "correct": 0
  },
  {
    "question": "Alabama is famous for what BBQ sauce?",
    "choices": [
      "White (mayo)",
      "Vinegar",
      "Mustard",
      "Soy"
    ],
    "correct": 0
  },
  {
    "question": "St. Louis-style ribs are?",
    "choices": [
      "Trimmed spareribs",
      "Baby backs",
      "Country style",
      "Beef ribs"
    ],
    "correct": 0
  },
  {
    "question": "Baby back ribs come from?",
    "choices": [
      "Loin",
      "Belly",
      "Shoulder",
      "Leg"
    ],
    "correct": 0
  },
  {
    "question": "Pulled pork comes from which cut?",
    "choices": [
      "Shoulder/butt",
      "Loin",
      "Belly",
      "Brisket"
    ],
    "correct": 0
  },
  {
    "question": "Brisket comes from the?",
    "choices": [
      "Cow's chest",
      "Cow's loin",
      "Cow's leg",
      "Cow's rib"
    ],
    "correct": 0
  },
  {
    "question": "Tri-tip is associated with which regional style?",
    "choices": [
      "Santa Maria",
      "Memphis",
      "Kansas City",
      "Texas"
    ],
    "correct": 0
  },
  {
    "question": "The 'point' of a brisket is?",
    "choices": [
      "Fattier end",
      "Leaner end",
      "Trimmed off",
      "Center cut"
    ],
    "correct": 0
  },
  {
    "question": "The 'flat' of a brisket is?",
    "choices": [
      "Leaner end",
      "Fattier end",
      "Trimmed off",
      "Center cut"
    ],
    "correct": 0
  },
  {
    "question": "Low-and-slow temps are typically?",
    "choices": [
      "225-250F",
      "350-400F",
      "500F+",
      "100F"
    ],
    "correct": 0
  },
  {
    "question": "Brisket is usually pulled at internal temp around?",
    "choices": [
      "200-205F",
      "160F",
      "145F",
      "250F"
    ],
    "correct": 0
  },
  {
    "question": "Pork ribs are 'done' around?",
    "choices": [
      "195-203F",
      "145F",
      "165F",
      "250F"
    ],
    "correct": 0
  },
  {
    "question": "Hickory wood imparts?",
    "choices": [
      "Strong/savory",
      "Mild/sweet",
      "Citrus",
      "Floral"
    ],
    "correct": 0
  },
  {
    "question": "Apple wood is typically?",
    "choices": [
      "Mild/sweet",
      "Strong/bitter",
      "Sour",
      "Smoky-strong"
    ],
    "correct": 0
  },
  {
    "question": "Mesquite is associated with?",
    "choices": [
      "Texas",
      "Carolinas",
      "Memphis",
      "KC"
    ],
    "correct": 0
  },
  {
    "question": "Pecan wood flavor is?",
    "choices": [
      "Mild nutty",
      "Strong bitter",
      "Sour",
      "Pungent"
    ],
    "correct": 0
  },
  {
    "question": "A 'rub' is?",
    "choices": [
      "Dry seasoning",
      "Liquid sauce",
      "Marinade",
      "Brine"
    ],
    "correct": 0
  },
  {
    "question": "A 'mop' sauce is?",
    "choices": [
      "Thin baste",
      "Thick glaze",
      "Dry powder",
      "Dip"
    ],
    "correct": 0
  },
  {
    "question": "The Texas Crutch refers to?",
    "choices": [
      "Wrapping in foil",
      "Spritzing",
      "Resting",
      "Trimming"
    ],
    "correct": 0
  },
  {
    "question": "The 'stall' happens around?",
    "choices": [
      "150-170F",
      "100F",
      "200F",
      "225F"
    ],
    "correct": 0
  },
  {
    "question": "Pellet smokers burn?",
    "choices": [
      "Wood pellets",
      "Charcoal",
      "Gas",
      "Electricity only"
    ],
    "correct": 0
  },
  {
    "question": "Offset smokers feature a?",
    "choices": [
      "Side firebox",
      "Top firebox",
      "Center firebox",
      "No firebox"
    ],
    "correct": 0
  },
  {
    "question": "KCBS is a major BBQ?",
    "choices": [
      "Sanctioning body",
      "Sauce brand",
      "Restaurant",
      "Wood type"
    ],
    "correct": 0
  },
  {
    "question": "Competition meats commonly include?",
    "choices": [
      "Brisket/ribs/pork/chicken",
      "Brisket only",
      "Ribs only",
      "Fish only"
    ],
    "correct": 0
  },
  {
    "question": "The 'bark' on smoked meat is?",
    "choices": [
      "Crusty exterior",
      "Inside",
      "Sauce",
      "Fat layer"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BBQQuizSettings): BBQQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BBQQuizState, action: BBQQuizAction): BBQQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BBQQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
