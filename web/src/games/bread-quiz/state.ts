import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BreadQuizSettings { questions: "10" | "20"; }
export interface BreadQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BreadQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's the basic bread ingredient list?", choices: ["Flour, water, salt, yeast","Just flour","Both","Just bread"], correct: 2 },
  { question: "What gas leavens bread?", choices: ["Carbon dioxide","Oxygen","Hydrogen","Just CO2"], correct: 3 },
  { question: "What produces CO2 in bread?", choices: ["Yeast fermentation","Just fermentation","Both","Baking soda also"], correct: 2 },
  { question: "What's a baguette?", choices: ["Long thin French bread","Just French","Both","Just baguette"], correct: 2 },
  { question: "What's sourdough?", choices: ["Natural yeast culture bread","Just sour","Both","Just sourdough"], correct: 2 },
  { question: "What's a sourdough starter?", choices: ["Wild yeast/bacteria culture","Just culture","Both","Just starter"], correct: 2 },
  { question: "What's gluten?", choices: ["Wheat protein structure in bread","Just protein","Both","Just gluten"], correct: 2 },
  { question: "What's kneading?", choices: ["Working dough to develop gluten","Just mixing","Both","Just technique"], correct: 2 },
  { question: "What's proofing?", choices: ["Letting dough rise","Just rising","Both","Just proof"], correct: 2 },
  { question: "What's an oven spring?", choices: ["Initial rise during baking","Just rise","Both","Just bake"], correct: 2 },
  { question: "What's pita?", choices: ["Middle Eastern flatbread with pocket","Just flat","Both","Just pita"], correct: 2 },
  { question: "What's naan?", choices: ["Indian leavened flatbread","Just bread","Both","Just naan"], correct: 2 },
  { question: "What's tortilla?", choices: ["Mexican flatbread (corn or flour)","Just flat","Both","Just tortilla"], correct: 2 },
  { question: "What's challah?", choices: ["Jewish braided egg bread","Just Jewish","Both","Just challah"], correct: 2 },
  { question: "What's brioche?", choices: ["French rich egg/butter bread","Just French","Both","Just brioche"], correct: 2 },
  { question: "What's ciabatta?", choices: ["Italian rustic bread","Just Italian","Both","Just ciabatta"], correct: 2 },
  { question: "What's focaccia?", choices: ["Italian olive oil flatbread","Just flat","Both","Just focaccia"], correct: 2 },
  { question: "What's pumpernickel?", choices: ["Dark German rye bread","Just rye","Both","Just dark"], correct: 2 },
  { question: "What's a bagel?", choices: ["Boiled then baked ring of dough","Just boiled","Both","Just bagel"], correct: 2 },
  { question: "What city is famous for bagels?", choices: ["NYC and Montreal each have styles","NY only","Both","Different cities"], correct: 2 },
  { question: "What's a pretzel?", choices: ["Boiled or lye-bathed twisted dough","Just twisted","Both","Just pretzel"], correct: 2 },
  { question: "What's banneton?", choices: ["Round proofing basket","Just basket","Both","Just bread tool"], correct: 2 },
  { question: "What's a Dutch oven for bread?", choices: ["Heavy pot for steam-baking","Just pot","Both","Just baker tool"], correct: 2 },
  { question: "What's a baker's percentage?", choices: ["Ingredients as % of flour weight","Just percentage","Both","Just baking math"], correct: 2 },
  { question: "What's hydration in bread?", choices: ["Water as % of flour","Just water","Both","Just hydration"], correct: 2 },
  { question: "What's high hydration?", choices: ["75%+ water - more open crumb","Just high","Both","Just hydration level"], correct: 2 },
  { question: "What's the crust?", choices: ["Outer browned crispy layer","Just outside","Both","Just crust"], correct: 2 },
  { question: "What's the crumb?", choices: ["Interior of bread","Just inside","Both","Just crumb"], correct: 2 },
  { question: "What's a poolish?", choices: ["French pre-ferment","Just starter","Both","Just preferment"], correct: 2 },
  { question: "What's a biga?", choices: ["Italian stiff pre-ferment","Just preferment","Both","Just biga"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BreadQuizSettings): BreadQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BreadQuizState, action: BreadQuizAction): BreadQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BreadQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
