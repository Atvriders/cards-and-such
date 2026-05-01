import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DimSumQuizSettings { questions: "10" | "20"; }
export interface DimSumQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DimSumQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What region is dim sum from?", choices: ["Cantonese (Hong Kong/Guangdong)","Just China","Both","Just southern China"], correct: 2 },
  { question: "What does dim sum literally mean?", choices: ["Touch the heart","Small bites","Both interpretations","Just the heart"], correct: 2 },
  { question: "What's yum cha?", choices: ["Drinking tea (with dim sum)","Just tea","Both","Just yum cha"], correct: 2 },
  { question: "What's har gow?", choices: ["Crystal shrimp dumplings","Just dumplings","Both","Just shrimp"], correct: 2 },
  { question: "What's siu mai?", choices: ["Open-top pork/shrimp dumplings","Just dumpling","Both","Just open"], correct: 2 },
  { question: "What's char siu bao?", choices: ["BBQ pork buns","Just bun","Both","Just char siu"], correct: 2 },
  { question: "What's char siu?", choices: ["Cantonese BBQ pork","Just BBQ","Both","Just pork"], correct: 2 },
  { question: "What's xiao long bao?", choices: ["Soup dumplings (Shanghainese, often served at dim sum)","Just dumplings","Both","Just XLB"], correct: 2 },
  { question: "What's the iconic feature of XLB?", choices: ["Liquid soup inside","Just dumpling","Both","Just soup"], correct: 2 },
  { question: "What's egg tart?", choices: ["Sweet baked custard tart","Just tart","Both","Just egg"], correct: 2 },
  { question: "What's the difference between Hong Kong and Portuguese egg tarts?", choices: ["HK has smoother, Portuguese has caramelized top","Just style","Both","Just difference"], correct: 2 },
  { question: "What's congee?", choices: ["Rice porridge","Just porridge","Both","Just rice"], correct: 2 },
  { question: "What's chicken feet (a dim sum classic)?", choices: ["Phoenix talons / Fung Zao","Just feet","Both","Just chicken"], correct: 2 },
  { question: "What's cheung fun?", choices: ["Rice noodle rolls","Just rolls","Both","Just rice"], correct: 2 },
  { question: "What's typically inside cheung fun?", choices: ["Shrimp, beef, BBQ pork, etc.","Just shrimp","Multiple fillings","All listed"], correct: 2 },
  { question: "What's lo mai gai?", choices: ["Sticky rice in lotus leaf","Just rice","Both","Just dish"], correct: 2 },
  { question: "What's turnip cake?", choices: ["Pan-fried daikon cake","Just cake","Both","Just turnip"], correct: 2 },
  { question: "What's the daikon called in Chinese?", choices: ["Lo bak","Just radish","Both","Just daikon"], correct: 2 },
  { question: "What's mango pudding?", choices: ["Sweet mango dessert","Just dessert","Both","Just mango"], correct: 2 },
  { question: "What tea is most common with dim sum?", choices: ["Pu-erh, jasmine, oolong","Multiple teas","All listed","Just tea"], correct: 2 },
  { question: "What are pushcarts in dim sum service?", choices: ["Cart service used historically","Just cart","Both","Just service"], correct: 2 },
  { question: "What's modern service?", choices: ["Order from menu","Just menu","Both","Both cart and menu"], correct: 3 },
  { question: "What's a wonton?", choices: ["Filled dumpling, often in soup","Just dumpling","Both","Just wonton"], correct: 2 },
  { question: "What's dumpling skin made of?", choices: ["Wheat flour or wheat starch","Just flour","Both","Just dough"], correct: 2 },
  { question: "What's the typical dim sum meal time?", choices: ["Brunch","Just brunch","Both","Lunch and brunch"], correct: 3 },
  { question: "What's a pork bun's color?", choices: ["White (steamed) or shiny brown (baked)","Just white","Both","Variations"], correct: 2 },
  { question: "What's the iconic dim sum cart's purpose?", choices: ["Bringing variety of dishes","Just service","Both","Just cart"], correct: 2 },
  { question: "What's siu yuk?", choices: ["Crispy roast pork","Just pork","Both","Just roast"], correct: 2 },
  { question: "What's a steamer basket called?", choices: ["Bamboo steamer","Just steamer","Both","Just bamboo"], correct: 2 },
  { question: "What's the word 'dim sum' in Mandarin?", choices: ["Dianxin","Just dim sum","Both names","Just dianxin"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DimSumQuizSettings): DimSumQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DimSumQuizState, action: DimSumQuizAction): DimSumQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DimSumQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
