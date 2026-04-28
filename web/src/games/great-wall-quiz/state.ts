import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GreatWallQuizSettings { questions: "10" | "20"; }
export interface GreatWallQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GreatWallQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How long is the Great Wall of China?", choices: ["~5,000 km", "~13,000 mi (21,196 km)", "~3,000 km", "~50,000 km"], correct: 1 },
  { question: "Which dynasty built the most of the existing Great Wall?", choices: ["Qin", "Han", "Ming", "Tang"], correct: 2 },
  { question: "When did the first sections of the Great Wall begin?", choices: ["1500 BC", "7th century BC", "200 BC", "1200 AD"], correct: 1 },
  { question: "Which emperor unified existing walls into the Great Wall?", choices: ["Qin Shi Huang", "Kublai Khan", "Han Wudi", "Sun Tzu"], correct: 0 },
  { question: "What was the primary purpose of the Great Wall?", choices: ["Tourism", "Defense from northern nomads", "Religious monument", "Trade route"], correct: 1 },
  { question: "Which materials were used to build the Wall?", choices: ["Stone, brick, tamped earth, wood", "Iron only", "Concrete", "Marble"], correct: 0 },
  { question: "Can the Great Wall be seen from space (low Earth orbit)?", choices: ["Yes, easily", "Barely with magnification", "No, it's too narrow", "Only at night"], correct: 2 },
  { question: "How tall is the Great Wall at its highest sections?", choices: ["~3m", "~8m", "~15m", "~30m"], correct: 1 },
  { question: "What lookout structures dot the wall?", choices: ["Beacon towers", "Lighthouses", "Mosques", "Forts only"], correct: 0 },
  { question: "How many people built the Great Wall over centuries?", choices: ["Tens of thousands", "Hundreds of thousands", "Millions over centuries", "About a thousand"], correct: 2 },
  { question: "Where is the most-visited section by tourists?", choices: ["Mutianyu", "Badaling", "Jinshanling", "Simatai"], correct: 1 },
  { question: "Which UNESCO designation does the Wall hold?", choices: ["Cultural Heritage Site", "Natural Site", "Mixed Site", "Modern Wonder"], correct: 0 },
  { question: "What year was the Great Wall named one of New Seven Wonders of the World?", choices: ["1995", "2007", "2015", "2020"], correct: 1 },
  { question: "Which sections are best-preserved today?", choices: ["Ming-era sections", "Qin-era sections", "Han-era sections", "All equally"], correct: 0 },
  { question: "How wide is the wall on top in well-preserved sections?", choices: ["~1m", "~3-5m", "~8-9m", "~15m"], correct: 2 },
  { question: "Which country borders ran along the wall?", choices: ["Russia/Mongolia frontiers", "Indian frontier", "Korean frontier", "Vietnam frontier"], correct: 0 },
  { question: "Were soldiers stationed along the wall?", choices: ["Yes, with garrisons in towers", "No, defensive only", "Only emperors", "Never"], correct: 0 },
  { question: "How many beacon towers are there?", choices: ["~1,000", "~10,000", "~25,000+", "~100"], correct: 2 },
  { question: "What is 'Bu Dao Changcheng Fei Hao Han'?", choices: ["He who has not climbed the Great Wall is not a true man", "Great Wall pass code", "Imperial decree", "Tourist motto"], correct: 0 },
  { question: "What % of the original Great Wall has eroded?", choices: ["10%", "30%", "More than 30%", "100%"], correct: 2 }
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
