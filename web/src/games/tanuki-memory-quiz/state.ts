import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TanukiMemorySettings { questions: "10"; }
export interface TanukiMemoryState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TanukiMemoryAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "A 'tanuki' is most accurately translated as?", choices: ["Fox","Raccoon dog","Squirrel","Badger"], correct: 1 },
  { question: "Tanuki are native to which country?", choices: ["Korea","Japan / East Asia","Thailand","Indonesia"], correct: 1 },
  { question: "The basic mechanic of Tanuki Memory is?", choices: ["Trick-taking","Pairs matching from face-down cards","Bidding","Solitaire"], correct: 1 },
  { question: "Tanuki are famous in Japanese folklore for?", choices: ["Stealing fire","Shapeshifting","Granting wishes","Stealing rice"], correct: 1 },
  { question: "A typical Tanuki Memory game uses how many pairs?", choices: ["6-12","20","26","52"], correct: 0 },
  { question: "Tanuki Memory is suitable for ages?", choices: ["Adults only","Children and families","Teenagers only","Seniors only"], correct: 1 },
  { question: "What do tanuki statues typically feature outside Japanese restaurants?", choices: ["A scroll","A sake bottle and round belly","A sword","A drum"], correct: 1 },
  { question: "Tanuki Memory typically supports how many players?", choices: ["1 only","2-6","8+","16"], correct: 1 },
  { question: "The skill primarily trained by this game is?", choices: ["Mental arithmetic","Pattern memory","Reflexes","Bluffing"], correct: 1 },
  { question: "A 'match' in Tanuki Memory means?", choices: ["Two identical illustrations","Numerical pair","Same colour","Adjacent positions"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TanukiMemorySettings): TanukiMemoryState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TanukiMemoryState, action: TanukiMemoryAction): TanukiMemoryState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TanukiMemoryState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
