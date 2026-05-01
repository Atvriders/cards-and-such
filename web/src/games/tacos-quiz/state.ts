import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TacosQuizSettings { questions: "10" | "20"; }
export interface TacosQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TacosQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What country are tacos from?", choices: ["Mexico","Spain","Peru","Just Mexico"], correct: 2 },
  { question: "What's a corn tortilla?", choices: ["Flatbread from masa","Just corn","Both","Just tortilla"], correct: 2 },
  { question: "What's a flour tortilla?", choices: ["Wheat-based flatbread","Just flour","Both","Northern Mexican"], correct: 2 },
  { question: "What's masa?", choices: ["Corn dough (nixtamalized)","Just corn","Both","Just dough"], correct: 2 },
  { question: "What's nixtamalization?", choices: ["Treating corn with alkaline solution","Just process","Both","Just chemistry"], correct: 2 },
  { question: "What's al pastor?", choices: ["Pork on vertical spit","Just pork","Both","Just style"], correct: 2 },
  { question: "What's al pastor's origin influence?", choices: ["Lebanese shawarma","Just Mexican","Both","Just influence"], correct: 2 },
  { question: "What fruit is on al pastor?", choices: ["Pineapple","Just pineapple","Both","Just fruit"], correct: 2 },
  { question: "What's carne asada?", choices: ["Grilled beef","Just beef","Both","Just grilled"], correct: 2 },
  { question: "What's carnitas?", choices: ["Pork cooked in own fat","Just pork","Both","Just braised"], correct: 2 },
  { question: "What's barbacoa?", choices: ["Slow-cooked meat traditionally pit-smoked","Just meat","Both","Just method"], correct: 2 },
  { question: "What's birria?", choices: ["Stewed meat (beef or goat)","Just stew","Both","Just dish"], correct: 2 },
  { question: "What region is birria from?", choices: ["Jalisco","Just Mexico","Both","Just region"], correct: 0 },
  { question: "What's the popular birria taco style with consomme?", choices: ["Quesabirria with dipping consomme","Just birria","Both","Variant"], correct: 2 },
  { question: "What's lengua?", choices: ["Beef tongue","Just tongue","Both","Just lengua"], correct: 2 },
  { question: "What's tripa?", choices: ["Tripe / intestines","Just tripe","Both","Just innards"], correct: 2 },
  { question: "What's chorizo?", choices: ["Spicy sausage","Just sausage","Both","Just spicy"], correct: 2 },
  { question: "What's pico de gallo?", choices: ["Tomato, onion, cilantro, lime salsa","Just salsa","Both","Just fresh"], correct: 2 },
  { question: "What's salsa verde made of?", choices: ["Tomatillos and chiles","Just green","Both","Just sauce"], correct: 2 },
  { question: "What's a tomatillo?", choices: ["Green husk tomato relative","Just green tomato","Both","Different fruit"], correct: 2 },
  { question: "What's guacamole?", choices: ["Avocado dip","Just avocado","Both","Just dip"], correct: 2 },
  { question: "What's traditional taco garnish?", choices: ["Cilantro and onion","Just cilantro","Both","Just garnish"], correct: 2 },
  { question: "What's a hard shell taco?", choices: ["Tex-Mex variant, fried tortilla","Just hard","Both","Tex-Mex"], correct: 2 },
  { question: "What's a Mexico City taco specialty?", choices: ["Tacos al pastor","Just al pastor","Both","Just CDMX"], correct: 2 },
  { question: "What state is birria from?", choices: ["Jalisco","Just region","Both","Just Jalisco"], correct: 0 },
  { question: "What's a flauta?", choices: ["Rolled crispy taco","Just rolled","Both","Just flauta"], correct: 2 },
  { question: "What's a taco al carbon?", choices: ["Charcoal-grilled meat tacos","Just grilled","Both","Just al carbon"], correct: 2 },
  { question: "What's a Mission burrito?", choices: ["Large SF-style burrito (not tacos but related)","Just burrito","Both","Just Mission"], correct: 2 },
  { question: "What's elote?", choices: ["Mexican grilled corn (street food)","Just corn","Both","Just elote"], correct: 2 },
  { question: "What's a quesadilla?", choices: ["Tortilla with cheese folded","Just cheese","Both","Just quesadilla"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TacosQuizSettings): TacosQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TacosQuizState, action: TacosQuizAction): TacosQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TacosQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
