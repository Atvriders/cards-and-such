import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DessertQuizSettings { questions: "10" | "20"; }
export interface DessertQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DessertQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's tiramisu?", choices: ["Italian coffee-flavored dessert","Just dessert","Both","Just Italian"], correct: 2 },
  { question: "What's the cheese in tiramisu?", choices: ["Mascarpone","Cream cheese","Both used","Just mascarpone"], correct: 3 },
  { question: "What's creme brulee?", choices: ["French custard with caramelized sugar top","Just custard","Both","Just French"], correct: 2 },
  { question: "What technique makes creme brulee's top?", choices: ["Torch caramelization","Just torch","Both","Just sugar"], correct: 2 },
  { question: "What's panna cotta?", choices: ["Italian cooked cream dessert","Just cream","Both","Just dessert"], correct: 2 },
  { question: "What's a souffle?", choices: ["French baked egg dish","Just souffle","Both","Just dish"], correct: 2 },
  { question: "What's a chocolate souffle?", choices: ["Hot puffy chocolate dessert","Just chocolate","Both","Just souffle"], correct: 2 },
  { question: "What's macaron?", choices: ["French meringue cookie sandwich","Just cookie","Both","Just macaron"], correct: 2 },
  { question: "What's a macaroon?", choices: ["Coconut cookie","Just coconut","Both","Different from macaron"], correct: 2 },
  { question: "What's baklava?", choices: ["Layered phyllo with nuts and syrup","Just layered","Both","Just baklava"], correct: 2 },
  { question: "What culture is baklava from?", choices: ["Middle East/Mediterranean","Just region","Both","Just origin"], correct: 2 },
  { question: "What's gelato?", choices: ["Italian ice cream (lower fat, denser)","Just ice cream","Both","Just gelato"], correct: 2 },
  { question: "What's the difference between gelato and ice cream?", choices: ["Gelato has less fat, less air","Just less fat","Both","Just denser"], correct: 2 },
  { question: "What's flan?", choices: ["Custard with caramel sauce","Just custard","Both","Just flan"], correct: 2 },
  { question: "What's pavlova?", choices: ["Meringue dessert with fruit","Just meringue","Both","Just pavlova"], correct: 2 },
  { question: "What countries claim pavlova?", choices: ["Australia and New Zealand","Just Australia","Both","Just NZ"], correct: 0 },
  { question: "What's a New York cheesecake?", choices: ["Dense baked cream cheese cake","Just baked","Both","Just cheesecake"], correct: 2 },
  { question: "What's chocolate truffle?", choices: ["Chocolate ganache rolled","Just chocolate","Both","Just truffle"], correct: 2 },
  { question: "What's a profiterole?", choices: ["Cream-filled choux pastry","Just choux","Both","Just profiterole"], correct: 2 },
  { question: "What's an eclair?", choices: ["Long choux pastry filled with cream","Just pastry","Both","Just eclair"], correct: 2 },
  { question: "What's choux pastry?", choices: ["Hollow pastry from cooked dough","Just pastry","Both","Just choux"], correct: 2 },
  { question: "What's a cannoli?", choices: ["Sicilian fried tube with ricotta","Just tube","Both","Just cannoli"], correct: 2 },
  { question: "What's a churro?", choices: ["Fried dough stick","Just fried","Both","Just churro"], correct: 2 },
  { question: "What country are churros associated with?", choices: ["Spain and Mexico","Just Spain","Both","Just Mexico"], correct: 2 },
  { question: "What's mochi?", choices: ["Japanese rice cake","Just rice","Both","Just mochi"], correct: 2 },
  { question: "What's mochi ice cream?", choices: ["Ice cream wrapped in mochi","Just mochi","Both","Just ice cream"], correct: 2 },
  { question: "What's Black Forest cake?", choices: ["German chocolate cherry layered cake","Just German","Both","Just cake"], correct: 2 },
  { question: "What's red velvet cake?", choices: ["Reddish chocolate cake with cream cheese frosting","Just cake","Both","Just red velvet"], correct: 2 },
  { question: "What's an opera cake?", choices: ["French layered almond/coffee/chocolate","Just French","Both","Just opera"], correct: 2 },
  { question: "What's mille-feuille?", choices: ["French puff pastry with pastry cream","Just puff","Both","Just mille-feuille"], correct: 2 },
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
