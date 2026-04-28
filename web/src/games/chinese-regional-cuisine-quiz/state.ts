import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChineseRegionalCuisineQuizSettings { questions: "5" | "10"; }
export interface ChineseRegionalCuisineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChineseRegionalCuisineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mapo tofu is most associated with which cuisine?", choices: ["Cantonese","Sichuan","Shandong","Fujian"], correct: 1 },
  { question: "Dim sum is a hallmark of which cuisine?", choices: ["Sichuan","Cantonese","Hunan","Anhui"], correct: 1 },
  { question: "Peking duck originated from which region?", choices: ["Beijing/Shandong","Sichuan","Cantonese","Yunnan"], correct: 0 },
  { question: "Which cuisine is known for \"ma la\" (numbing-spicy)?", choices: ["Cantonese","Sichuan","Shandong","Fujian"], correct: 1 },
  { question: "Xiao Long Bao soup dumplings come from?", choices: ["Shanghai","Beijing","Guangzhou","Chengdu"], correct: 0 },
  { question: "Which is one of the Eight Great Traditions?", choices: ["Mongolian","Hunan","Tibetan","Uyghur"], correct: 1 },
  { question: "Cantonese cuisine is famous for what cooking method?", choices: ["Deep frying","Steaming and stir-frying","Brining","Smoking"], correct: 1 },
  { question: "Dongbei cuisine refers to which region?", choices: ["Northeast China","Northwest","Southwest","Southeast"], correct: 0 },
  { question: "Which sauce is core to Hunan cuisine?", choices: ["Sweet soy","Smoky chili","Black bean","Hoisin"], correct: 1 },
  { question: "Lanzhou is famous for which dish?", choices: ["Hand-pulled beef noodles","Dim sum","Hot pot","Dumplings"], correct: 0 },
  { question: "Zhejiang cuisine is known for being?", choices: ["Fiery hot","Light and fresh","Sweet and rich","Heavily fried"], correct: 1 },
  { question: "Char siu is a Cantonese style of?", choices: ["Roast pork","Stewed beef","Steamed chicken","Smoked fish"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChineseRegionalCuisineQuizSettings): ChineseRegionalCuisineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChineseRegionalCuisineQuizState, action: ChineseRegionalCuisineQuizAction): ChineseRegionalCuisineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChineseRegionalCuisineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
