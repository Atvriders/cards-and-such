import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EntrepreneursQuizSettings { questions: "10" | "20" | "30"; }
export interface EntrepreneursQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EntrepreneursQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Apple co-founder (CEO)?", choices: ["Wozniak", "Jobs", "Cook", "Ive"], correct: 1 },
  { question: "Microsoft co-founder?", choices: ["Gates", "Jobs", "Ellison", "Zuckerberg"], correct: 0 },
  { question: "Facebook founder?", choices: ["Dorsey", "Zuckerberg", "Musk", "Bezos"], correct: 1 },
  { question: "Amazon founder?", choices: ["Bezos", "Musk", "Page", "Brin"], correct: 0 },
  { question: "Tesla CEO?", choices: ["Bezos", "Musk", "Ma", "Cook"], correct: 1 },
  { question: "Google co-founder (with Brin)?", choices: ["Page", "Bezos", "Musk", "Pichai"], correct: 0 },
  { question: "Twitter co-founder?", choices: ["Dorsey", "Zuckerberg", "Hoffman", "Systrom"], correct: 0 },
  { question: "LinkedIn founder?", choices: ["Hoffman", "Dorsey", "Systrom", "Spiegel"], correct: 0 },
  { question: "Instagram co-founder?", choices: ["Systrom", "Hoffman", "Spiegel", "Karp"], correct: 0 },
  { question: "Snapchat founder?", choices: ["Spiegel", "Systrom", "Karp", "Dorsey"], correct: 0 },
  { question: "SpaceX founder?", choices: ["Bezos", "Musk", "Branson", "Allen"], correct: 1 },
  { question: "Blue Origin founder?", choices: ["Musk", "Bezos", "Branson", "Allen"], correct: 1 },
  { question: "Virgin Group founder?", choices: ["Branson", "Buffett", "Bezos", "Musk"], correct: 0 },
  { question: "Berkshire Hathaway leader?", choices: ["Buffett", "Munger", "Soros", "Icahn"], correct: 0 },
  { question: "Oracle founder?", choices: ["Ellison", "Gates", "Bezos", "Page"], correct: 0 },
  { question: "Dell Computer founder?", choices: ["Dell", "HP", "Compaq", "IBM"], correct: 0 },
  { question: "Walmart founder?", choices: ["Walton", "Sears", "Penney", "Kresge"], correct: 0 },
  { question: "Ford Motor Company founder?", choices: ["Ford", "GM", "Chrysler", "Olds"], correct: 0 },
  { question: "Standard Oil founder?", choices: ["Rockefeller", "Carnegie", "Vanderbilt", "Morgan"], correct: 0 },
  { question: "Steel magnate Andrew?", choices: ["Rockefeller", "Carnegie", "Mellon", "Frick"], correct: 1 },
  { question: "JP Morgan was a?", choices: ["Banker", "Steel maker", "Oilman", "Railroad"], correct: 0 },
  { question: "Howard Schultz built which brand?", choices: ["McDonalds", "Starbucks", "Subway", "Dunkin"], correct: 1 },
  { question: "McDonald's was scaled by?", choices: ["Kroc", "Trump", "Walton", "Schultz"], correct: 0 },
  { question: "Disney founder?", choices: ["Walt Disney", "Roy Disney", "Iger", "Eisner"], correct: 0 },
  { question: "Henry Ford's mass-market car?", choices: ["Model T", "Mustang", "Bronco", "Falcon"], correct: 0 },
  { question: "Alibaba founder?", choices: ["Jack Ma", "Pony Ma", "Robin Li", "Lei Jun"], correct: 0 },
  { question: "Tencent founder?", choices: ["Pony Ma", "Jack Ma", "Robin Li", "Lei Jun"], correct: 0 },
  { question: "Xiaomi founder?", choices: ["Lei Jun", "Jack Ma", "Pony Ma", "Robin Li"], correct: 0 },
  { question: "Sara Blakely founded?", choices: ["Spanx", "Sephora", "Glossier", "Bumble"], correct: 0 },
  { question: "Whitney Wolfe Herd founded?", choices: ["Spanx", "Bumble", "Glossier", "Stitch Fix"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EntrepreneursQuizSettings): EntrepreneursQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EntrepreneursQuizState, action: EntrepreneursQuizAction): EntrepreneursQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EntrepreneursQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
