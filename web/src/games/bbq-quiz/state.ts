import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BBQQuizSettings { questions: "10" | "20"; }
export interface BBQQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BBQQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What region is BBQ most associated with in the US?", choices: ["South","Northeast","West","Midwest"], correct: 0 },
  { question: "What are the four major US BBQ regions?", choices: ["Texas, Memphis, Carolina, Kansas City","Just Texas","Multiple","Just four major"], correct: 3 },
  { question: "What meat is Texas BBQ famous for?", choices: ["Beef brisket","Pork ribs","Chicken","Both beef and ribs"], correct: 0 },
  { question: "What style is North Carolina BBQ?", choices: ["Vinegar-based pork","Tomato","Both","Just pork"], correct: 2 },
  { question: "What's Memphis BBQ known for?", choices: ["Pulled pork, dry rub ribs","Just ribs","Both","Wet and dry"], correct: 2 },
  { question: "What's Kansas City BBQ known for?", choices: ["Sweet tomato sauce, varied meats","Just sauce","Both","Just KC"], correct: 2 },
  { question: "What's South Carolina BBQ unique mustard sauce called?", choices: ["Carolina Gold (mustard-based)","Just mustard","Both","Just yellow"], correct: 2 },
  { question: "What's a smoker?", choices: ["Slow cooks meat with smoke","Just smokes","Both","Just oven"], correct: 2 },
  { question: "What's wood typically used for smoking?", choices: ["Hickory, oak, mesquite, pecan","Just hickory","Multiple","All listed"], correct: 3 },
  { question: "What's the best wood for Texas brisket?", choices: ["Post oak","Hickory","Mesquite","All used"], correct: 0 },
  { question: "What's a brisket?", choices: ["Beef chest cut","Just beef","Both","Just brisket"], correct: 2 },
  { question: "What temperature is brisket cooked to (typically)?", choices: ["Around 200-205F","Just 165","Both","Higher"], correct: 0 },
  { question: "How long does brisket take to cook?", choices: ["~12+ hours","~2 hours","~6 hours","~20 hours"], correct: 0 },
  { question: "What's the bark on BBQ?", choices: ["Crusty seasoned exterior","Just outside","Both","Just crust"], correct: 2 },
  { question: "What's the smoke ring?", choices: ["Pink layer just under bark","Just discoloration","Both","Just ring"], correct: 2 },
  { question: "What causes the smoke ring?", choices: ["Nitrogen dioxide reaction","Just smoke","Both","Just chemistry"], correct: 2 },
  { question: "What's a dry rub?", choices: ["Spice mix applied to meat","Just spices","Both","Just rub"], correct: 2 },
  { question: "What's mopping or basting?", choices: ["Liquid applied during cooking","Just sauce","Both","Just method"], correct: 2 },
  { question: "What's burnt ends?", choices: ["Crispy point of brisket","Just ends","Both","Just KC delicacy"], correct: 2 },
  { question: "What's a Boston butt?", choices: ["Pork shoulder cut","Just pork","Both","Just shoulder"], correct: 2 },
  { question: "What's pulled pork from?", choices: ["Slow-smoked pork shoulder","Just pork","Both","Just pulled"], correct: 2 },
  { question: "What are baby back ribs?", choices: ["Smaller pork ribs from upper back","Just ribs","Both","Just baby back"], correct: 2 },
  { question: "What are spare ribs?", choices: ["Larger pork ribs from belly","Just ribs","Both","Just spare"], correct: 2 },
  { question: "What's St. Louis style ribs?", choices: ["Trimmed spare ribs","Just trimmed","Both","Just style"], correct: 2 },
  { question: "What's the 3-2-1 method?", choices: ["3hr smoke, 2hr wrapped, 1hr unwrapped (for ribs)","Just method","Both","Just timing"], correct: 2 },
  { question: "What sauce style is the Carolinas (NC east) known for?", choices: ["Vinegar and pepper","Tomato","Both","Just vinegar"], correct: 0 },
  { question: "What's hot links?", choices: ["Spicy sausage","Just sausage","Both","Just hot"], correct: 2 },
  { question: "What's a BBQ pit?", choices: ["Cooking apparatus / area","Just cooker","Both","Just pit"], correct: 2 },
  { question: "What's low and slow?", choices: ["Low temp, long cook","Just low temp","Both","Just method"], correct: 2 },
  { question: "What's the ideal smoking temperature?", choices: ["~225-275F","Just 200","Both","Just range"], correct: 0 },
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
