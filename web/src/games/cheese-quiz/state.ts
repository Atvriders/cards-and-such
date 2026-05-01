import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CheeseQuizSettings { questions: "10" | "20"; }
export interface CheeseQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CheeseQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What country is famous for the most cheese variety?", choices: ["France","Italy","Switzerland","All produce many"], correct: 0 },
  { question: "What's cheddar cheese from?", choices: ["Cheddar village in Somerset, England","Just England","Both","Just cheddar"], correct: 2 },
  { question: "What's Parmigiano-Reggiano?", choices: ["Hard Italian aged cow's milk cheese","Just Italian","Both","Just parmesan"], correct: 2 },
  { question: "What's Parmesan vs Parmigiano-Reggiano?", choices: ["Parm-Reg is PDO Italian; parmesan is generic","Just naming","Both","Just protected"], correct: 2 },
  { question: "What's Roquefort?", choices: ["French blue sheep's milk cheese","Just blue","Both","Just French"], correct: 2 },
  { question: "What's mozzarella?", choices: ["Italian fresh stretched-curd cheese","Just Italian","Both","Just mozzarella"], correct: 2 },
  { question: "What's the original mozzarella made from?", choices: ["Buffalo milk","Cow milk","Both used","Just buffalo"], correct: 0 },
  { question: "What's Brie?", choices: ["French soft surface-ripened cheese","Just French","Both","Just Brie"], correct: 2 },
  { question: "What's Camembert?", choices: ["French soft cheese, similar to Brie","Just soft","Both","Just Camembert"], correct: 2 },
  { question: "What's feta?", choices: ["Greek brined cheese","Just brined","Both","Just feta"], correct: 2 },
  { question: "What's halloumi?", choices: ["Cypriot semi-hard, grills well","Just Cypriot","Both","Just halloumi"], correct: 2 },
  { question: "What's gouda?", choices: ["Dutch semi-hard cheese","Just Dutch","Both","Just gouda"], correct: 2 },
  { question: "What's gruyere?", choices: ["Swiss hard cheese","Just Swiss","Both","Just gruyere"], correct: 2 },
  { question: "What's Emmental?", choices: ["Swiss cheese with holes","Just Swiss","Both","Just holey"], correct: 2 },
  { question: "What's blue cheese?", choices: ["Cheese with mold veins","Just mold","Both","Just blue"], correct: 2 },
  { question: "What's Stilton?", choices: ["English blue cheese","Just blue","Both","Just Stilton"], correct: 2 },
  { question: "What's Gorgonzola?", choices: ["Italian blue cheese","Just Italian","Both","Just Gorgonzola"], correct: 2 },
  { question: "What's mascarpone?", choices: ["Italian cream cheese","Just cream","Both","Just mascarpone"], correct: 2 },
  { question: "What's ricotta?", choices: ["Italian whey cheese","Just whey","Both","Just ricotta"], correct: 2 },
  { question: "What's manchego?", choices: ["Spanish sheep's milk cheese","Just Spanish","Both","Just manchego"], correct: 2 },
  { question: "What's a wheel of cheese?", choices: ["Round form of cheese","Just round","Both","Just wheel"], correct: 2 },
  { question: "What's cheese aging?", choices: ["Maturing cheese for flavor","Just aging","Both","Just maturing"], correct: 2 },
  { question: "What's whey?", choices: ["Liquid byproduct of cheesemaking","Just liquid","Both","Just whey"], correct: 2 },
  { question: "What's curds?", choices: ["Solid coagulated milk","Just solid","Both","Just curds"], correct: 2 },
  { question: "What's rennet?", choices: ["Enzyme to coagulate milk","Just enzyme","Both","Just rennet"], correct: 2 },
  { question: "What's a soft cheese?", choices: ["Spreadable, fresh or surface-ripened","Just soft","Both","Just type"], correct: 2 },
  { question: "What's a hard cheese?", choices: ["Aged firm cheese","Just aged","Both","Just type"], correct: 2 },
  { question: "What's Swiss cheese famous for?", choices: ["Holes from CO2 bacteria","Just holes","Both","Just Swiss"], correct: 2 },
  { question: "What's American cheese?", choices: ["Processed cheese","Just processed","Both","Just American"], correct: 2 },
  { question: "What's the rind of cheese?", choices: ["Outer coating, often inedible or special","Just outside","Both","Just rind"], correct: 2 },
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
