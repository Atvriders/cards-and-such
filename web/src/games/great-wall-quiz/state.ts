import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GreatWallQuizSettings { questions: "10" | "20"; }
export interface GreatWallQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GreatWallQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Country of the Great Wall?", choices: ["Japan", "China", "Mongolia", "Korea"], correct: 1 },
  { question: "Approximate total length (all branches)?", choices: ["~2,000 km", "~6,000 km", "~21,000 km", "~50,000 km"], correct: 2 },
  { question: "Earliest sections built around?", choices: ["7th century BCE", "1st century CE", "10th century CE", "15th century"], correct: 0 },
  { question: "Emperor who unified earlier walls?", choices: ["Qin Shi Huang", "Han Wudi", "Kangxi", "Hongwu"], correct: 0 },
  { question: "Most surviving wall sections were built during which dynasty?", choices: ["Qin", "Han", "Tang", "Ming"], correct: 3 },
  { question: "Main building materials in the Ming era?", choices: ["Bricks & stone", "Bamboo", "Mud only", "Wood planks"], correct: 0 },
  { question: "Primary purpose of the wall?", choices: ["Tourism", "Defense", "Trade route", "Religious"], correct: 1 },
  { question: "Which northern peoples did the wall guard against?", choices: ["Vikings", "Mongols/nomads", "Romans", "Persians"], correct: 1 },
  { question: "Famous pass at the eastern end?", choices: ["Jiayuguan", "Shanhaiguan", "Juyongguan", "Mutianyu"], correct: 1 },
  { question: "Famous pass at the western end?", choices: ["Shanhaiguan", "Jiayuguan", "Badaling", "Simatai"], correct: 1 },
  { question: "Most-visited section near Beijing?", choices: ["Mutianyu", "Badaling", "Jinshanling", "Simatai"], correct: 1 },
  { question: "Wall is visible from the Moon?", choices: ["Yes, easily", "No, this is a myth", "Only at night", "With telescope"], correct: 1 },
  { question: "Watchtowers along the wall served as?", choices: ["Granaries", "Lookouts/signaling", "Hotels", "Temples"], correct: 1 },
  { question: "Smoke signals during the day used?", choices: ["Wood", "Wolf dung", "Coal", "Incense"], correct: 1 },
  { question: "Mortar in some Ming sections used?", choices: ["Sand", "Sticky rice", "Honey", "Blood"], correct: 1 },
  { question: "UNESCO World Heritage status year?", choices: ["1978", "1987", "1997", "2007"], correct: 1 },
  { question: "How wide is the wall on average (top)?", choices: ["~1 m", "~6 m", "~15 m", "~50 m"], correct: 1 },
  { question: "Average height of major sections?", choices: ["~2 m", "~7 m", "~20 m", "~50 m"], correct: 1 },
  { question: "First Western traveler said to mention it?", choices: ["Marco Polo", "Columbus", "Magellan", "Da Gama"], correct: 0 },
  { question: "Wall section that is steep and 'wild'?", choices: ["Badaling", "Jiankou", "Mutianyu", "Juyongguan"], correct: 1 },
  { question: "Who breached the wall in 1644?", choices: ["Mongols", "Manchus", "British", "Japanese"], correct: 1 },
  { question: "Many wall laborers were?", choices: ["Nobles only", "Soldiers and conscripts", "Foreign volunteers", "Children"], correct: 1 },
  { question: "Estimated workers who died building it?", choices: ["Hundreds", "Thousands", "Hundreds of thousands", "Millions"], correct: 2 },
  { question: "Wall passes through how many provinces?", choices: ["3", "6", "15", "30"], correct: 2 },
  { question: "Highest point of the wall?", choices: ["~500 m", "~1,500 m", "~2,000 m", "~5,000 m"], correct: 1 },
  { question: "Modern threats to the wall include?", choices: ["Erosion", "Vandalism", "Both", "Neither"], correct: 2 },
  { question: "Which dynasty's wall remains best preserved?", choices: ["Qin", "Han", "Ming", "Qing"], correct: 2 },
  { question: "Wall is sometimes called in Chinese?", choices: ["W\u00e0n L\u01d0 Ch\u00e1ng Ch\u00e9ng", "Tian Cheng", "Qing Long", "Bao Cheng"], correct: 0 },
  { question: "'W\u00e0n L\u01d0' translates to?", choices: ["Eternal", "10,000 li (long)", "Mighty", "Stone"], correct: 1 },
  { question: "Folk tale: woman whose tears collapsed a wall section?", choices: ["Mulan", "Meng Jiangn\u00fc", "Diaochan", "Xi Shi"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GreatWallQuizSettings): GreatWallQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GreatWallQuizState, action: GreatWallQuizAction): GreatWallQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GreatWallQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
